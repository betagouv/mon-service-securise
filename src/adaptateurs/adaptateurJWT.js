const jwt = require('jsonwebtoken');

const secret = process.env.SECRET_JWT;
const decode = (token) => (token ? jwt.verify(token, secret) : undefined);

const signeDonnees = (donnees) =>
  jwt.sign(donnees, secret, { expiresIn: '1h' });

const genereToken = (idUtilisateur, source, estInvite) =>
  signeDonnees({ idUtilisateur, source, estInvite });

const fabriqueAdaptateurJWT = () => ({ decode, genereToken, signeDonnees });

module.exports = { fabriqueAdaptateurJWT };
