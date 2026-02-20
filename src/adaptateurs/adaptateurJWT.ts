import jwt from 'jsonwebtoken';
import { ErreurJWTInvalide, ErreurJWTManquant } from '../erreurs.js';
import * as environnement from './adaptateurEnvironnement.js';
import { secondesJusqua23h59m59s } from '../utilitaires/date.js';
import { AdaptateurEnvironnement } from './adaptateurEnvironnement.interface.js';
import { UUID } from '../typesBasiques.js';
import { SourceAuthentification } from '../modeles/sourceAuthentification.js';

const adaptateurJWT = ({
  adaptateurEnvironnement,
}: {
  adaptateurEnvironnement: AdaptateurEnvironnement;
}) => {
  const secret = adaptateurEnvironnement.JWT().secret() as string;

  const decode = (token: string | undefined): Record<string, unknown> => {
    if (!token) {
      throw new ErreurJWTManquant();
    }

    try {
      return jwt.verify(token, secret) as Record<string, unknown>;
    } catch {
      throw new ErreurJWTInvalide();
    }
  };

  const signeDonnees = (donnees: Record<string, unknown>) =>
    jwt.sign(donnees, secret, {
      expiresIn: secondesJusqua23h59m59s(new Date()),
    });

  const genereToken = (
    idUtilisateur: UUID,
    source: SourceAuthentification,
    estInvite: boolean
  ) => signeDonnees({ idUtilisateur, source, estInvite });

  return { decode, signeDonnees, genereToken };
};

const fabriqueAdaptateurJWT = () =>
  adaptateurJWT({ adaptateurEnvironnement: environnement });

export { adaptateurJWT, fabriqueAdaptateurJWT };
