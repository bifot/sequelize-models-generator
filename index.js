const Sequelize = require('sequelize')
const mysql = require('mysql2')
const util = require('util')
const types = require('./types')

class ModelsGenerator {
  constructor (dbConfig) {
    this.sequelize = new Sequelize(
      dbConfig.db,
      dbConfig.user,
      dbConfig.password,
      {
        host: dbConfig.host,
        dialect: 'mysql',
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        logging: false,
        operatorsAliases: false
      }
    )
    this.mysql = mysql.createConnection({
      host: dbConfig.host,
      database: dbConfig.db,
      user: dbConfig.user,
      password: dbConfig.password
    })
    this.mysql.query = util.promisify(this.mysql.query)
  }

  async getTableModel (table) {
    const columns = await this.mysql.query(`SHOW COLUMNS FROM ${table}`)
    const sequelizeModel = columns
      .filter((item) => item.Field !== 'id')
      .map(({
        Field: field,
        Type: dbType
      }) => {
        const [args] = dbType.match(/\(\S{1,}\)/)
        const [type] = dbType.split(args)
        const sequelizeType = types[type.toLowerCase()]
        const formattedArgs = args
          .replace(/\(|\)/g, '')
          .split(',')
          .map((item) => isNaN(item) ? item.replace(/\'/g, '') : +item)

        return {
          [field]: Sequelize[sequelizeType](...formattedArgs)
        }
      })
      .reduce((a, b) => ({ ...a, ...b }), {})

    return this.sequelize.define(table, sequelizeModel, {
      freezeTableName: true,
      timestamps: false,
      tableName: table
    })
  }
}

module.exports = async (dbConfig, tables) => {
  const generator = new ModelsGenerator(dbConfig)
  const models = await Promise.all(tables.map(item => generator.getTableModel(item.tableName)))

  return tables.map(({ tableName, newTableName = tableName }, i) =>
    ({ [newTableName]: models[i] })).reduce((a, b) => ({ ...a, ...b }), {})
}