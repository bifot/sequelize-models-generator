const { expect } = require('chai')
const generateModels = require('./')

describe('models generator', () => {
  it('generate models', async () => {
    const models = await generateModels({
      host: process.env.DB_HOST,
      db: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }, [{
      tableName: process.env.DB_TABLE_NAME,
      newTableName: process.env.DB_NEW_TABLE_NAME
    }])
    const Model = models[process.env.DB_NEW_TABLE_NAME]

    await Model.destroy({
      where: {}
    })

    const documentCreated = await Model.create({
      service: 'live',
      sportId: 1,
      typeId: 1,
      subTypeId: 1,
      language: 'ru',
      text: 'Example text',
      isHandicap: false,
      isDisabled: false
    })
    const documentFound = await Model.findOne({
      where: {
        sportId: 1
      }
    })

    expect(documentCreated.toJSON()).to.deep.equal(documentFound.toJSON())
  })
})