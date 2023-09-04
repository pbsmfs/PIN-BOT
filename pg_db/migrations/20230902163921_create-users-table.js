exports.up = knex => {
    setTimeout(() => {}, 500)
      return knex.schema.createTable('users', t => {
        t.string('id').unique().primary()
        t.string('username', 32)
        t.string('message', 2000)
        t.string('known_as', 32)
        t.string('group', 32)
        t.string('name', 32)
      })
    }
    
    exports.down = knex => {
      return knex.schema.dropTable('users')
    }
