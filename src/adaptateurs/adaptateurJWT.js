import jwt from 'jsonwebtoken';
import { ErreurJWTInvalide, ErreurJWTManquant } from '../erreurs.js';
import * as environnement from './adaptateurEnvironnement.js';
import { secondesJusqua23h59m59s } from '../utilitaires/date.js';

const adaptateurJWT = ({ adaptateurEnvironnement }) => {
  const secret = adaptateurEnvironnement.JWT().secret();

  const decode = (token) => {
    if (!token) {
      throw new ErreurJWTManquant();
    }

    try {
      return jwt.verify(token, secret);
    } catch (e) {
      throw new ErreurJWTInvalide();
    }
  };

  const signeDonnees = (donnees) =>
    jwt.sign(donnees, secret, {
      expiresIn: secondesJusqua23h59m59s(new Date()),
    });

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

export { adaptateurJWT, fabriqueAdaptateurJWT };
