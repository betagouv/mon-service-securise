const jwt = require('jsonwebtoken');

const secret = process.env.SECRET_JWT;
const decode = (token) => (token ? jwt.verify(token, secret) : undefined);
const genereToken = (idUtilisateur) => jwt.sign({ idUtilisateur }, secret);

module.exports = { decode, genereToken };
