import express, { Request } from 'express';
import { z } from 'zod';
import { valideBody } from '../../http/validePayloads.js';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import { Middleware } from '../../http/middleware.interface.js';
import { schemaPutAutoriteHomologation } from './routesConnecteApiService.schema.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { dateInvalide } from '../../utilitaires/date.js';
import { Referentiel } from '../../referentiel.interface.js';
import { AdaptateurHorloge } from '../../adaptateurs/adaptateurHorloge.js';
import { valeurBooleenne } from '../../utilitaires/aseptisation.js';
import Avis from '../../modeles/avis.js';
import Service from '../../modeles/service.js';
import Dossier from '../../modeles/dossier.js';
import { ErreurDossierCourantInexistant } from '../../erreurs.js';

const { ECRITURE } = Permissions;
const { HOMOLOGUER } = Rubriques;

type RequeteAvecService = Request & {
  service: Service;
};

type RequeteAvecServiceEtDossierCourant = RequeteAvecService & {
  dossierCourant: Dossier;
};

export const routesConnecteApiServiceHomologation = ({
  adaptateurHorloge,
  depotDonnees,
  middleware,
  referentiel,
}: {
  adaptateurHorloge: AdaptateurHorloge;
  depotDonnees: DepotDonnees;
  middleware: Middleware;
  referentiel: Referentiel;
}) => {
  const routes = express.Router();

  routes.put(
    '/:id/homologation/autorite',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
    middleware.trouveDossierCourant,
    valideBody(z.strictObject(schemaPutAutoriteHomologation())),
    (requete, reponse, suite) => {
      const { service, dossierCourant } =
        requete as unknown as RequeteAvecServiceEtDossierCourant;

      const {
        body: { nom, fonction },
      } = requete;
      dossierCourant.enregistreAutoriteHomologation(nom, fonction);
      depotDonnees
        .enregistreDossier(service.id, dossierCourant)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.put(
    '/:id/homologation/decision',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
    middleware.trouveDossierCourant,
    middleware.aseptise('dateHomologation', 'dureeValidite'),
    (requete, reponse, suite) => {
      const { dateHomologation, dureeValidite } = requete.body;
      if (dateInvalide(dateHomologation)) {
        reponse.status(422).send("Date d'homologation invalide");
        return;
      }

      if (
        !referentiel.estIdentifiantEcheanceRenouvellementConnu(dureeValidite)
      ) {
        reponse.status(422).send('Durée de validité invalide');
        return;
      }

      const { service, dossierCourant } =
        requete as unknown as RequeteAvecServiceEtDossierCourant;

      dossierCourant.enregistreDecision(dateHomologation, dureeValidite);
      depotDonnees
        .enregistreDossier(service.id, dossierCourant)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.put(
    '/:id/homologation/telechargement',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
    middleware.trouveDossierCourant,
    (requete, reponse, suite) => {
      const { service, dossierCourant } =
        requete as unknown as RequeteAvecServiceEtDossierCourant;

      const dateTelechargement = adaptateurHorloge.maintenant();
      dossierCourant.enregistreDateTelechargement(dateTelechargement);
      depotDonnees
        .enregistreDossier(service.id, dossierCourant)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.put(
    '/:id/homologation/avis',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
    middleware.trouveDossierCourant,
    middleware.aseptiseListes([
      {
        nom: 'avis',
        proprietes: [
          ...Avis.proprietesAtomiquesRequises(),
          ...Avis.proprietesAtomiquesFacultatives(),
        ],
      },
    ]),
    middleware.aseptise('avis.*.collaborateurs.*', 'avecAvis'),
    (requete, reponse, suite) => {
      const {
        body: { avis },
      } = requete;
      if (!avis) {
        reponse.sendStatus(400);
        return;
      }

      const { service, dossierCourant } =
        requete as unknown as RequeteAvecServiceEtDossierCourant;
      const avecAvis = valeurBooleenne(requete.body.avecAvis);

      if (avecAvis) dossierCourant.enregistreAvis(avis);
      else dossierCourant.declareSansAvis();

      depotDonnees
        .enregistreDossier(service.id, dossierCourant)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.put(
    '/:id/homologation/documents',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
    middleware.trouveDossierCourant,
    middleware.aseptise('documents.*', 'avecDocuments'),
    (requete, reponse, suite) => {
      const {
        body: { documents },
      } = requete;
      if (!documents) {
        reponse.sendStatus(400);
        return;
      }

      const { service, dossierCourant } =
        requete as unknown as RequeteAvecServiceEtDossierCourant;
      const avecDocuments = valeurBooleenne(requete.body.avecDocuments);

      if (avecDocuments) dossierCourant.enregistreDocuments(documents);
      else dossierCourant.declareSansDocument();

      depotDonnees
        .enregistreDossier(service.id, dossierCourant)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.post(
    '/:id/homologation/finalise',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
    (requete, reponse, suite) => {
      const { service } = requete as unknown as RequeteAvecService;

      depotDonnees
        .finaliseDossierCourant(service)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.delete(
    '/:id/homologation/dossierCourant',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
    async (requete, reponse, suite) => {
      const { service } = requete as unknown as RequeteAvecService;
      try {
        service.supprimeDossierCourant();
        await depotDonnees.metsAJourService(service);
        reponse.sendStatus(204);
      } catch (e) {
        if (e instanceof ErreurDossierCourantInexistant)
          reponse.status(422).send(e.message);
        else suite(e);
      }
    }
  );

  return routes;
};
