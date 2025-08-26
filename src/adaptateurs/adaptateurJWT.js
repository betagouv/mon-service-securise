import jwt from 'jsonwebtoken';
import { ErreurJWTInvalide, ErreurJWTManquant } from '../erreurs.js';
import * as adaptateurEnvironnement from './adaptateurEnvironnement.js';

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
    jwt.sign(donnees, secret, { expiresIn: '1h' });

  const genereToken = (idUtilisateur, source, estInvite) =>
    signeDonnees({ idUtilisateur, source, estInvite });

  return { decode, signeDonnees, genereToken };
};

const fabriqueAdaptateurJWT = () => adaptateurJWT({ adaptateurEnvironnement });

export { adaptateurJWT, fabriqueAdaptateurJWT };
