exports.up = function (knex) {
  return knex.schema.alterTable('comments', (commentsTable) => {
    commentsTable.dropForeign('article_id');
    commentsTable
      .integer('article_id')
      .references('article_id')
      .inTable('articles')
      .notNullable()
      .onDelete('CASCADE')
      .alter();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('comments', (commentsTable) => {
    commentsTable.dropForeign('article_id');

    commentsTable
      .integer('article_id')
      .references('article_id')
      .inTable('articles')
      .notNullable()
      .alter();
  });
};
