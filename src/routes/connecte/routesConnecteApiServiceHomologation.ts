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
  schemaPostRepriseHomologation,
  schemaPutAutoriteHomologation,
  schemaPutAvisHomologation,
  schemaPutDecisionHomologation,
  schemaPutDocumentsHomologation,
} from './routesConnecteApiServiceHomologation.schema.js';
import { Autorisation } from '../../modeles/autorisations/autorisation.js';

const { ECRITURE, LECTURE } = Permissions;
const { HOMOLOGUER } = Rubriques;

type RequeteAvecService = Request & {
  service: Service;
};

type RequeteAvecServiceEtDossierCourant = RequeteAvecService & {
  dossierCourant: Dossier;
};

type RequeteAvecServiceEtAutorisation = RequeteAvecService & {
  autorisationService: Autorisation;
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

  routes.post(
    '/:id/homologation/reprends',
    middleware.trouveService({ [HOMOLOGUER]: LECTURE }),
    middleware.chargeAutorisationsService,
    valideBody(z.strictObject(schemaPostRepriseHomologation(referentielV2))),
    async (requete, reponse) => {
      const { service, autorisationService } =
        requete as unknown as RequeteAvecServiceEtAutorisation;
      const { etapeDemandee } = requete.body;

      if (
        !service.dossierCourant() &&
        !autorisationService.aLesPermissions(
          Autorisation.DROITS_EDITER_HOMOLOGATION
        )
      ) {
        reponse.sendStatus(403);
        return;
      }

      await depotDonnees.ajouteDossierCourantSiNecessaire(service.id);
      const s = await depotDonnees.service(service.id);
      const etapeCourante = referentielV2.etapeDossierAutorisee(
        s!.dossierCourant().etapeCourante(),
        autorisationService.peutHomologuer()
      );
      const numeroEtapeCourante = referentielV2.numeroEtape(etapeCourante!);
      const numeroEtapeDemandee = referentielV2.numeroEtape(etapeDemandee);
      if (numeroEtapeDemandee! > numeroEtapeCourante!) {
        reponse.json({ etapeAAfficher: etapeCourante });
        return;
      }

      reponse.json({ etapeAAfficher: etapeDemandee });
    }
  );

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
    valideBody(schemaPutDecisionHomologation(referentielV2)),
    async (requete, reponse) => {
      const { dateHomologation, dureeValidite, refusee } = requete.body;

      const { service, dossierCourant } =
        requete as unknown as RequeteAvecServiceEtDossierCourant;

      dossierCourant.enregistreDecision(dateHomologation, {
        dureeHomologation: dureeValidite,
        refusee,
      });
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
