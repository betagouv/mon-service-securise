import express, { NextFunction, Request, Response } from 'express';
import { Server } from 'http';
import { authentificationParCleApi } from './authentificationParCleApi.js';
import { routesApiPubliqueV1 } from './routesApiPubliqueV1.js';
import { routesDocumentation } from './routesDocumentation.js';
import { DepotDonnees } from '../depotDonnees.interface.js';
import { AdaptateurGestionErreur } from '../adaptateurs/adaptateurGestionErreur.interface.js';

type ConfigurationApiPublique = {
  depotDonnees: DepotDonnees;
  adaptateurGestionErreur: AdaptateurGestionErreur;
};

export const creeServeurApiPublique = ({
  depotDonnees,
  adaptateurGestionErreur,
}: ConfigurationApiPublique) => {
  const app = express();
  app.disable('x-powered-by');

  app.use(routesDocumentation());

  app.use(
    '/v1',
    authentificationParCleApi({ depotDonnees }),
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
