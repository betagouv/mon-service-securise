import express, { Request } from 'express';
import { z } from 'zod';
import { valideBody } from '../../http/validePayloads.js';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import { Middleware } from '../../http/middleware.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { ReferentielV2 } from '../../referentiel.interface.js';
import { AdaptateurHorloge } from '../../adaptateurs/adaptateurHorloge.js';
import Service from '../../modeles/service.js';
import Dossier from '../../modeles/dossier.js';
import { ErreurDossierCourantInexistant } from '../../erreurs.js';
import {
  schemaPutAutoriteHomologation,
  schemaPutAvisHomologation,
  schemaPutDecisionHomologation,
  schemaPutDocumentsHomologation,
} from './routesConnecteApiServiceHomologation.schema.js';

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
  referentielV2,
}: {
  adaptateurHorloge: AdaptateurHorloge;
  depotDonnees: DepotDonnees;
  middleware: Middleware;
  referentielV2: ReferentielV2;
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
    valideBody(z.strictObject(schemaPutDecisionHomologation(referentielV2))),
    async (requete, reponse) => {
      const { dateHomologation, dureeValidite } = requete.body;

      const { service, dossierCourant } =
        requete as unknown as RequeteAvecServiceEtDossierCourant;

      dossierCourant.enregistreDecision(dateHomologation, dureeValidite);
      await depotDonnees.enregistreDossier(service.id, dossierCourant);

      reponse.sendStatus(204);
    }
  );

  routes.put(
    '/:id/homologation/telechargement',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
    middleware.trouveDossierCourant,
    async (requete, reponse) => {
      const { service, dossierCourant } =
        requete as unknown as RequeteAvecServiceEtDossierCourant;

      const dateTelechargement = adaptateurHorloge.maintenant().toISOString();
      dossierCourant.enregistreDateTelechargement(dateTelechargement);

      await depotDonnees.enregistreDossier(service.id, dossierCourant);

      reponse.sendStatus(204);
    }
  );

  routes.put(
    '/:id/homologation/avis',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
    middleware.trouveDossierCourant,
    valideBody(z.strictObject(schemaPutAvisHomologation(referentielV2))),
    async (requete, reponse) => {
      const {
        body: { avis, avecAvis },
      } = requete;

      const { service, dossierCourant } =
        requete as unknown as RequeteAvecServiceEtDossierCourant;

      if (avecAvis) dossierCourant.enregistreAvis(avis);
      else dossierCourant.declareSansAvis();

      await depotDonnees.enregistreDossier(service.id, dossierCourant);

      reponse.sendStatus(204);
    }
  );

  routes.put(
    '/:id/homologation/documents',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
    middleware.trouveDossierCourant,
    valideBody(z.strictObject(schemaPutDocumentsHomologation())),
    async (requete, reponse) => {
      const {
        body: { documents, avecDocuments },
      } = requete;

      const { service, dossierCourant } =
        requete as unknown as RequeteAvecServiceEtDossierCourant;

      if (avecDocuments) dossierCourant.enregistreDocuments(documents);
      else dossierCourant.declareSansDocument();

      await depotDonnees.enregistreDossier(service.id, dossierCourant);

      reponse.sendStatus(204);
    }
  );

  routes.post(
    '/:id/homologation/finalise',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
    async (requete, reponse) => {
      const { service } = requete as unknown as RequeteAvecService;

      await depotDonnees.finaliseDossierCourant(service);
      reponse.sendStatus(204);
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
