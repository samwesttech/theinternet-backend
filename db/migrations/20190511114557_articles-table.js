exports.up = knex => {
  return knex.schema.createTable('articles', articlesTable => {
    articlesTable.increments('article_id').primary();
    articlesTable.string('title').notNullable();
    articlesTable.string('body', 25000).notNullable();
    articlesTable.timestamp('created_at').defaultTo(knex.fn.now());
    articlesTable.integer('votes').defaultTo(0);
    articlesTable
      .string('topic')
      .references('slug')
      .inTable('topics')
      .notNullable();
    articlesTable
      .string('author')
      .references('username')
      .inTable('users')
      .notNullable();
  });
};

exports.down = knex => {
  return knex.schema.dropTableIfExists('articles');
};
