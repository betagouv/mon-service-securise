import express, { NextFunction, Request, Response } from 'express';
import { Server } from 'http';
import { authentificationParCleApi } from './middlewares/authentificationParCleApi.js';
import { limiteDeDebitParCleApi } from './middlewares/limiteDeDebitParCleApi.js';
import { routesApiPubliqueV1 } from './routes/routesApiPubliqueV1.js';
import { routesDocumentation } from './routes/routesDocumentation.js';
import { DepotDonnees } from '../depotDonnees.interface.js';
import { AdaptateurGestionErreur } from '../adaptateurs/adaptateurGestionErreur.interface.js';

type LimiteDeDebit = { fenetreMs: number; maxParFenetre: number };

type ConfigurationApiPublique = {
  depotDonnees: DepotDonnees;
  adaptateurGestionErreur: AdaptateurGestionErreur;
  limiteDeDebit?: LimiteDeDebit;
  trustProxy?: boolean | number | string;
};

const limiteDeDebitParDefaut: LimiteDeDebit = {
  fenetreMs: 60_000,
  maxParFenetre: 60,
};

export const creeServeurApiPublique = ({
  depotDonnees,
  adaptateurGestionErreur,
  limiteDeDebit = limiteDeDebitParDefaut,
  trustProxy,
}: ConfigurationApiPublique) => {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', trustProxy);

  app.use(routesDocumentation());

  app.use(
    '/v1',
    authentificationParCleApi({ depotDonnees }),
    limiteDeDebitParCleApi(limiteDeDebit),
    routesApiPubliqueV1({ depotDonnees })
  );

  app.use((_requete: Request, reponse: Response) => {
    reponse.status(404).json({ erreur: 'RESSOURCE_INEXISTANTE' });
  });

  app.use(
    (
      erreur: Error,
      _requete: Request,
      reponse: Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _suite: NextFunction
    ) => {
      adaptateurGestionErreur.logueErreur(erreur);
      reponse.status(500).json({ erreur: 'ERREUR_INTERNE' });
    }
  );

  let serveur: Server;

  const ecoute = (port: number | string, succes: () => void) => {
    serveur = app.listen(port, succes);
  };

  const arreteEcoute = () => {
    serveur.close();
  };

  return { ecoute, arreteEcoute, app };
};
