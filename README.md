# sequelize-models-generator

Util for generate sequelize models from pure MySQL tables.

## Install

```sh
$ npm i sequelize-models-generator
```

## Tests

```sh
$ npm test
```

## Usage

```js
const generateModels = require('sequelize-models-generator')

const { Users } = await generateModels({
  host: process.env.DB_HOST,
  db: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
}, [
  {
    tableName: 'game_users', // table name in db
    newTableName: 'Users'    // table name which return
  }
])

// call any sequelize methods as usually

// e.g.
await Users.create({})
await Users.findOne({})
await Users.findAll({})
```
