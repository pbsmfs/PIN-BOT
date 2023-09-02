
module.exports = {

    client: 'postgresql',
    connection: {
      host: "pg_whois_db",
      database: 'postgres',
      user:     'postgres',
      password: 'MIET2023'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
