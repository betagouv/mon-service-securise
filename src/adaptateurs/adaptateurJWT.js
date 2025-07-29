const jwt = require('jsonwebtoken');
const { ErreurJWTAbsent } = require('../erreurs');

const secret = process.env.SECRET_JWT;
const decode = (token) => {
  if (token) {
    jwt.verify(token, secret);
  }
  throw ErreurJWTAbsent;
};

const signeDonnees = (donnees) =>
  jwt.sign(donnees, secret, { expiresIn: '1h' });

const genereToken = (idUtilisateur, source, estInvite) =>
  signeDonnees({ idUtilisateur, source, estInvite });

module.exports = { decode, genereToken, signeDonnees };
