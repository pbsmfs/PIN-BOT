const config =  require('./knexfile.js');
const knex =  require('knex');


exports.default = knex(config)