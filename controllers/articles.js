const {
  selectArticles,
  selectArticleById,
  updateArticleById,
  insertArticle,
  removeArticleById,
} = require('../models/articles');
const { checkOrderQuery } = require('./utils');

exports.getArticles = async (req, res) => {
  const { order } = req.query;
  if (!checkOrderQuery(order)) {
    return Promise.reject({
      status: 400,
      msg: 'Bad Request: Invalid order query',
    });
  }
  const articles = await selectArticles(req.query);
  res.send({ articles });
};

exports.getArticleById = async (req, res) => {
  const { article_id } = req.params;
  const article = await selectArticleById(article_id);
  res.send({ article });
};

exports.patchArticleById = async (req, res) => {
  const { article_id } = req.params;
  const article = await updateArticleById(article_id, req.body);
  res.send({ article });
};

exports.postArticle = async (req, res) => {
  const { username: author, title, body, topic } = req.body;
  const article = await insertArticle({ author, title, body, topic });
  res.status(201).send({ article });
};

exports.deleteArticleById = async (req, res) => {
  console.log('in deleteArticleById');
  const { article_id } = req.params;
  await removeArticleById(article_id);
  res.sendStatus(204);
};
