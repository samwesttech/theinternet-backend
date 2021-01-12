const { selectUserByUsername, selectAllUsers } = require('../models/users');

exports.getUser = async (req, res) => {
  const { username } = req.params;
  const user = await selectUserByUsername(username);
  res.send({ user });
};

exports.getAllUsers = async(req, res) => {
const users = await selectAllUsers();
res.send({users})
}