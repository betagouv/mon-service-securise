import express, { NextFunction, Request, Response } from 'express';
import { Server } from 'http';
import helmet from 'helmet';
import { authentificationParCleApi } from './middlewares/authentificationParCleApi.js';
import { limiteDeDebitParCleApi } from './middlewares/limiteDeDebitParCleApi.js';
import { auditApiPublique } from './middlewares/auditApiPublique.js';
import { routesApiPubliqueV1 } from './routes/routesApiPubliqueV1.js';
import { routesDocumentation } from './routes/routesDocumentation.js';
import { DepotDonnees } from '../depotDonnees.interface.js';
import { AdaptateurGestionErreur } from '../adaptateurs/adaptateurGestionErreur.interface.js';
import { AdaptateurAuditApiPublique } from '../adaptateurs/adaptateurAuditApiPublique.interface.js';

type LimiteDeDebit = { fenetreMs: number; maxParFenetre: number };

type ConfigurationApiPublique = {
  depotDonnees: DepotDonnees;
  adaptateurGestionErreur: AdaptateurGestionErreur;
  urlBaseMss: string;
  adaptateurAuditApiPublique: AdaptateurAuditApiPublique;
  limiteDeDebit?: LimiteDeDebit;
  trustProxy?: boolean | number | string;
};

const limiteDeDebitParDefaut: LimiteDeDebit = {
  fenetreMs: 60_000,
  maxParFenetre: 60,
};

const politiqueSecuriteApi = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
  },
  frameguard: { action: 'deny' },
});

export const creeServeurApiPublique = ({
  depotDonnees,
  adaptateurGestionErreur,
  urlBaseMss,
  adaptateurAuditApiPublique,
  limiteDeDebit = limiteDeDebitParDefaut,
  trustProxy,
}: ConfigurationApiPublique) => {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', trustProxy);
  app.use(politiqueSecuriteApi);

  app.use(routesDocumentation({ urlBaseMss }));

  app.use(
    '/v1',
    authentificationParCleApi({ depotDonnees }),
    limiteDeDebitParCleApi(limiteDeDebit),
    auditApiPublique({ adaptateurAuditApiPublique, adaptateurGestionErreur }),
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
