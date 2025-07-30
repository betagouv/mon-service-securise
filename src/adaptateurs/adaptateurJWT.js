const jwt = require('jsonwebtoken');
const { JWT: environnement } = require('./adaptateurEnvironnement');

const secret = environnement().secret();
const decode = (token) => (token ? jwt.verify(token, secret) : undefined);

const signeDonnees = (donnees) =>
  jwt.sign(donnees, secret, { expiresIn: '1h' });

const genereToken = (idUtilisateur, source, estInvite) =>
  signeDonnees({ idUtilisateur, source, estInvite });

const fabriqueAdaptateurJWT = () => ({ decode, genereToken, signeDonnees });

module.exports = { fabriqueAdaptateurJWT };
