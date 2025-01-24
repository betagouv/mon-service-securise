const jwt = require('jsonwebtoken');

const secret = process.env.SECRET_JWT;
const decode = (token) => {
  if (!token) return undefined;
  try {
    return jwt.verify(token, secret);
  } catch (e) {
    return undefined;
  }
};

const signeDonnees = (donnees) => jwt.sign(donnees, secret);

const genereToken = (idUtilisateur, source, estInvite) =>
  signeDonnees({ idUtilisateur, source, estInvite });

module.exports = { decode, genereToken, signeDonnees };
