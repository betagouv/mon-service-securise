import express from 'express';
import { z } from 'zod';
import routesConnecteApiServicePdf from './routesConnecteApiServicePdf.js';
import {
  EchecAutorisation,
  ErreurDonneesObligatoiresManquantes,
} from '../../erreurs.js';
import RisqueGeneral from '../../modeles/risqueGeneral.js';
import * as objetGetService from '../../modeles/objetsApi/objetGetService.js';
import * as objetGetAutorisation from '../../modeles/objetsApi/objetGetAutorisation.js';
import {
  Permissions,
  Rubriques,
  verifieCoherenceDesDroits,
} from '../../modeles/autorisations/gestionDroits.js';
import routesConnecteApiServiceActivitesMesure from './routesConnecteApiServiceActivitesMesure.js';
import { Autorisation } from '../../modeles/autorisations/autorisation.js';
import routesConnecteApiSimulationMigrationReferentiel from './routesConnecteApiSimulationMigrationReferentiel.js';
import { schemaSuggestionAction } from '../../http/schemas/suggestionAction.schema.js';
import { valideBody, valideParams } from '../../http/validePayloads.js';
import { schemaPutRisqueGeneral } from './routesConnecteApiService.schema.js';
import { schemaAutorisation } from '../../http/schemas/autorisation.schema.js';
import { routesConnecteApiServiceMesuresSpecifiques } from './routesConnecteApiServiceMesuresSpecifiques.js';
import { routesConnecteApiServiceHomologation } from './routesConnecteApiServiceHomologation.js';
import { routesConnecteApiServiceRisquesSpecifiques } from './routesConnecteApiServiceRisquesSpecifiques.js';
import { routesConnecteApiServiceModeleMesureSpecifique } from './routesConnecteApiServiceModeleMesureSpecifique.js';
import { routesConnecteApiServiceRetourUtilisateur } from './routesConnecteApiServiceRetourUtilisateur.js';
import { routesConnecteApiServiceMesuresGenerales } from './routesConnecteApiServiceMesuresGenerales.js';
import { routesConnecteApiServiceDescription } from './routesConnecteApiServiceDescription.js';
import { routesConnecteApiServiceRolesReponsaibilites } from './routesConnecteApiServiceRolesReponsabilites.js';

const { ECRITURE, LECTURE } = Permissions;
const { SECURISER, RISQUES } = Rubriques;

const routesConnecteApiService = ({
  middleware,
  depotDonnees,
  referentiel,
  referentielV2,
  adaptateurHorloge,
  adaptateurPdf,
  adaptateurZip,
  adaptateurJournal,
}) => {
  const routes = express.Router();

  routes.use(
    routesConnecteApiServicePdf({
      adaptateurHorloge,
      adaptateurPdf,
      adaptateurZip,
      middleware,
      referentiel,
    })
  );

  routes.use(
    routesConnecteApiServiceActivitesMesure({
      middleware,
      depotDonnees,
      referentiel,
      referentielV2,
    })
  );

  routes.use(
    routesConnecteApiServiceMesuresSpecifiques({
      depotDonnees,
      middleware,
      referentiel,
      referentielV2,
    })
  );

  routes.use(
    routesConnecteApiServiceRisquesSpecifiques({
      depotDonnees,
      middleware,
      referentielV2,
    })
  );

  routes.use(
    routesConnecteApiServiceHomologation({
      adaptateurHorloge,
      depotDonnees,
      middleware,
      referentielV2,
    })
  );

  routes.use(
    routesConnecteApiServiceModeleMesureSpecifique({
      depotDonnees,
      middleware,
    })
  );

  routes.use(
    routesConnecteApiServiceRetourUtilisateur({
      middleware,
      adaptateurJournal,
      referentiel,
      referentielV2,
    })
  );

  routes.use(
    routesConnecteApiServiceMesuresGenerales({
      depotDonnees,
      middleware,
      referentiel,
      referentielV2,
    })
  );

  routes.use(
    routesConnecteApiServiceDescription({
      depotDonnees,
      middleware,
      referentiel,
      referentielV2,
    })
  );

  routes.use(
    routesConnecteApiServiceRolesReponsaibilites({ depotDonnees, middleware })
  );

  routes.get(
    '/:id',
    middleware.trouveService({}),
    middleware.chargeAutorisationsService,
    async (requete, reponse) => {
      const donnees = objetGetService.donnees(
        requete.service,
        requete.autorisationService,
        referentiel
      );
      reponse.json(donnees);
    }
  );

  routes.put(
    '/:id/risques/:idRisque',
    middleware.trouveService({ [RISQUES]: ECRITURE }),
    valideParams(
      z.looseObject({ idRisque: z.enum(referentielV2.identifiantsRisques()) })
    ),
    valideBody(z.strictObject(schemaPutRisqueGeneral(referentielV2))),
    async (requete, reponse) => {
      const { niveauGravite, niveauVraisemblance, commentaire, desactive } =
        requete.body;
      const { idRisque: id } = requete.params;
      const risque = new RisqueGeneral(
        { id, niveauGravite, niveauVraisemblance, commentaire, desactive },
        referentielV2
      );
      await depotDonnees.ajouteRisqueGeneralAService(requete.service, risque);

      reponse.status(200).send(risque.toJSON());
    }
  );

  routes.get(
    '/:id/risques/v2',
    middleware.trouveService({ [RISQUES]: LECTURE }),
    middleware.chargeAutorisationsService,
    async (requete, reponse) => {
      const { service } = requete;

      const risquesV2 = service.moteurRisques.toJSON();
      const risquesSpecifiques = service.risquesSpecifiques().toJSON();

      reponse.json({ ...risquesV2, risquesSpecifiques });
    }
  );

  routes.delete(
    '/:id',
    middleware.trouveService({}),
    middleware.chargeAutorisationsService,
    (requete, reponse, suite) => {
      const verifiePermissionSuppressionService = () =>
        requete.autorisationService.peutSupprimerService()
          ? Promise.resolve()
          : Promise.reject(new EchecAutorisation());

      const { idUtilisateurCourant } = requete;
      const idService = requete.params.id;

      verifiePermissionSuppressionService(idUtilisateurCourant, idService)
        .then(() => depotDonnees.supprimeService(idService))
        .then(() => reponse.send('Service supprimé'))
        .catch((e) => {
          if (e instanceof EchecAutorisation) {
            reponse
              .status(403)
              .send('Droits insuffisants pour supprimer le service');
          } else {
            suite(e);
          }
        });
    }
  );

  routes.copy(
    '/:id',
    middleware.protegeTrafic(),
    middleware.trouveService({}),
    middleware.chargeAutorisationsService,
    async (requete, reponse, suite) => {
      const verifiePermissionDuplicationService = () =>
        requete.autorisationService.peutDupliquer()
          ? Promise.resolve()
          : Promise.reject(new EchecAutorisation());

      const { idUtilisateurCourant } = requete;
      const idService = requete.params.id;

      try {
        await verifiePermissionDuplicationService(
          idUtilisateurCourant,
          idService
        );
        await depotDonnees.dupliqueService(idService, idUtilisateurCourant);
        reponse.send('Service dupliqué');
      } catch (e) {
        if (e instanceof EchecAutorisation) {
          reponse
            .status(403)
            .send('Droits insuffisants pour dupliquer le service');
          return;
        }
        if (e instanceof ErreurDonneesObligatoiresManquantes) {
          reponse.status(424).send({
            type: 'DONNEES_OBLIGATOIRES_MANQUANTES',
            message:
              'La duplication a échoué car certaines données obligatoires ne sont pas renseignées',
          });
          return;
        }
        suite(e);
      }
    }
  );

  routes.get(
    '/:id/autorisations',
    middleware.trouveService({}),
    async (requete, reponse) => {
      const { id: idService } = requete.service;
      let autorisations = await depotDonnees.autorisationsDuService(idService);

      const autorisationUtilisateurCourant = autorisations.find(
        (a) => a.idUtilisateur === requete.idUtilisateurCourant
      );

      if (!autorisationUtilisateurCourant.peutGererContributeurs()) {
        autorisations = autorisations.filter(
          (a) =>
            a.estProprietaire ||
            a.idUtilisateur === requete.idUtilisateurCourant
        );
      }

      reponse.json(autorisations.map((a) => objetGetAutorisation.donnees(a)));
    }
  );

  routes.patch(
    '/:id/autorisations/:idAutorisation',
    middleware.trouveService({}),
    middleware.chargeAutorisationsService,
    valideParams(z.looseObject({ idAutorisation: z.uuid() })),
    valideBody(z.strictObject({ droits: schemaAutorisation.droits() })),
    async (requete, reponse) => {
      const { autorisationService, idUtilisateurCourant } = requete;
      const { idAutorisation } = requete.params;
      const nouveauxDroits = requete.body.droits;

      if (!nouveauxDroits.estProprietaire)
        delete nouveauxDroits.estProprietaire;

      if (!verifieCoherenceDesDroits(nouveauxDroits)) {
        reponse.status(422).json({ code: 'DROITS_INCOHERENTS' });
        return;
      }

      if (!autorisationService.peutGererContributeurs()) {
        reponse.status(403).json({ code: 'INTERDIT' });
        return;
      }

      const ciblee = await depotDonnees.autorisation(idAutorisation);
      if (ciblee.idUtilisateur === idUtilisateurCourant) {
        reponse.status(422).json({ code: 'AUTO-MODIFICATION_INTERDITE' });
        return;
      }

      const { service } = requete;
      const cibleUnServiceDifferent = ciblee.idService !== service.id;
      if (cibleUnServiceDifferent) {
        reponse.status(422).json({ code: 'LIEN_INCOHERENT' });
        return;
      }

      const avaitLesDroits = ciblee.aLesPermissions(
        Autorisation.DROITS_EDITER_MESURES
      );

      ciblee.appliqueDroits(nouveauxDroits);

      const aActuellementLesDroits = ciblee.aLesPermissions(
        Autorisation.DROITS_EDITER_MESURES
      );
      if (avaitLesDroits && !aActuellementLesDroits) {
        await depotDonnees.dissocieTousModelesMesureSpecifiqueDeUtilisateurSurService(
          ciblee.idUtilisateur,
          service.id
        );
      }
      await depotDonnees.sauvegardeAutorisation(ciblee);

      reponse.json(objetGetAutorisation.donnees(ciblee));
    }
  );

  routes.get(
    '/:id/indiceCyber',
    middleware.trouveService({ [SECURISER]: LECTURE }),
    (requete, reponse) => {
      const { service } = requete;
      reponse.json(service.indiceCyber());
    }
  );

  routes.get(
    '/:id/indiceCyberPersonnalise',
    middleware.trouveService({ [SECURISER]: LECTURE }),
    (requete, reponse) => {
      const { service } = requete;
      reponse.json(service.indiceCyberPersonnalise());
    }
  );

  routes.put(
    '/:id/suggestionAction/:nature',
    middleware.trouveService({}),
    valideParams(z.looseObject({ nature: schemaSuggestionAction.nature() })),
    async (requete, reponse) => {
      const { nature, id } = requete.params;
      await depotDonnees.acquitteSuggestionAction(id, nature);
      reponse.sendStatus(200);
    }
  );

  routes.use(
    routesConnecteApiSimulationMigrationReferentiel({
      depotDonnees,
      middleware,
      referentiel,
      referentielV2,
    })
  );

  return routes;
};

export default routesConnecteApiService;
