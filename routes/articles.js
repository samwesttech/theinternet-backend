const articlesRouter = require('express').Router();
const {
  getArticles,
  getArticleById,
  patchArticleById,
  postArticle,
  deleteArticleById,
} = require('../controllers/articles');
const { getComments, postComment } = require('../controllers/comments');
const { withErrorHandling, methodNotAllowed } = require('../errors');

articlesRouter
  .route('/')
  .get(withErrorHandling(getArticles))
  .post(withErrorHandling(postArticle))
  .all(methodNotAllowed);

articlesRouter
  .route('/:article_id')
  .get(withErrorHandling(getArticleById))
  .patch(withErrorHandling(patchArticleById))
  .delete(withErrorHandling(deleteArticleById))
  .all(methodNotAllowed);

articlesRouter
  .route('/:article_id/comments')
  .get(withErrorHandling(getComments))
  .post(withErrorHandling(postComment))
  .all(methodNotAllowed);

module.exports = articlesRouter;
