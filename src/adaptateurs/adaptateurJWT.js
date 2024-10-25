const jwt = require('jsonwebtoken');

const secret = process.env.SECRET_JWT;
const decode = (token) => (token ? jwt.verify(token, secret) : undefined);

const signeDonnees = (donnees) => jwt.sign(donnees, secret);

const genereToken = (idUtilisateur, cguAcceptees, source, estInvite) =>
  signeDonnees({ idUtilisateur, cguAcceptees, source, estInvite });

module.exports = { decode, genereToken, signeDonnees };
