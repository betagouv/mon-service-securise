const jwt = require('jsonwebtoken');

const secret = process.env.SECRET_JWT;
const decode = (token) => jwt.verify(token, secret);
const genereToken = (idUtilisateur) => jwt.sign({ idUtilisateur }, secret);

module.exports = { decode, genereToken };
