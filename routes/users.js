const usersRouter = require('express').Router();
const { getUser, getAllUsers } = require('../controllers/users');
const { withErrorHandling, methodNotAllowed } = require('../errors');

usersRouter.route('/').get(withErrorHandling(getAllUsers)).all(methodNotAllowed)

usersRouter
  .route('/:username')
  .get(withErrorHandling(getUser))
  .all(methodNotAllowed);

module.exports = usersRouter;
