const jwt = require('jsonwebtoken');
const environnement = require('./adaptateurEnvironnement');

const adaptateurJWT = ({ adaptateurEnvironnement }) => {
  const secret = adaptateurEnvironnement.JWT().secret();

  const decode = (token) => (token ? jwt.verify(token, secret) : undefined);

  const signeDonnees = (donnees) =>
    jwt.sign(donnees, secret, { expiresIn: '1h' });

  const genereToken = (idUtilisateur, source, estInvite) =>
    signeDonnees({ idUtilisateur, source, estInvite });

  return {
    decode,
    signeDonnees,
    genereToken,
  };
};

const fabriqueAdaptateurJWT = () =>
  adaptateurJWT({ adaptateurEnvironnement: environnement });

module.exports = { adaptateurJWT, fabriqueAdaptateurJWT };
