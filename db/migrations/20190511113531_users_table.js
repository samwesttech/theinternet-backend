exports.up = knex => {
  return knex.schema.createTable('users', usersTable => {
    usersTable.string('username').primary();
    usersTable.string('name');
    usersTable.string('avatar_url');
  });
};

exports.down = knex => {
  return knex.schema.dropTableIfExists('users');
};
