exports.up = knex => {
  return knex.schema.createTable('comments', commentsTable => {
    commentsTable.increments('comment_id').primary();
    commentsTable.string('body', 511).notNullable();
    commentsTable.integer('votes').defaultTo(0);
    commentsTable.timestamp('created_at').defaultTo(knex.fn.now());
    commentsTable
      .integer('article_id')
      .references('article_id')
      .inTable('articles')
      .notNullable();
    commentsTable
      .string('author')
      .references('username')
      .inTable('users')
      .notNullable();
  });
};

exports.down = knex => {
  return knex.schema.dropTableIfExists('comments');
};
