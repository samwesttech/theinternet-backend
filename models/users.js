const connection = require('../db/connection');

exports.selectUserByUsername = async username => {
  const user = await connection
    .select()
    .from('users')
    .where({ username })
    .first();
  if (!user) return Promise.reject({ status: 404, msg: 'user not found' });
  return user;
};

exports.selectAllUsers = async() => {
  const users = await connection.select().from('users')
  return users
}