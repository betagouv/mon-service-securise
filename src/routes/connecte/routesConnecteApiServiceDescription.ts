import express from 'express';
import { z } from 'zod';
import { ErreurNomServiceDejaExistant } from '../../erreurs.js';
import DescriptionService from '../../modeles/descriptionService.js';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import { Middleware } from '../../http/middleware.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';
import { RequestRouteConnecteService } from './routesConnecte.types.js';
import { valideBody } from '../../http/validePayloads.js';
import {
  schemaPostEstimationNiveauSecurite,
  schemaPutDescriptionService,
} from './routesConnecteApiServiceDescription.schema.js';

const { ECRITURE } = Permissions;
const { DECRIRE } = Rubriques;

export const routesConnecteApiServiceDescription = ({
  depotDonnees,
  middleware,
  referentiel,
  referentielV2,
}: {
  depotDonnees: DepotDonnees;
  middleware: Middleware;
  referentiel: Referentiel;
  referentielV2: ReferentielV2;
}) => {
  const routes = express.Router();

  routes.put(
    '/:id',
    middleware.trouveService({ [DECRIRE]: ECRITURE }),
    valideBody(z.strictObject(schemaPutDescriptionService(referentielV2))),
    async (requete, reponse, suite) => {
      try {
        const {
          nomService,
          organisationResponsable,
          nombreOrganisationsUtilisatrices,
          pointsAcces,
          fonctionnalitesSpecifiques,
          donneesSensiblesSpecifiques,
          typeService,
          presentation,
          niveauSecurite,
          statutDeploiement,
          provenanceService,
          delaiAvantImpactCritique,
          donneesCaracterePersonnel,
          localisationDonnees,
          fonctionnalites,
        } = requete.body;

        const descriptionService = new DescriptionService(
          {
            nomService,
            organisationResponsable,
            nombreOrganisationsUtilisatrices,
            pointsAcces,
            fonctionnalitesSpecifiques,
            donneesSensiblesSpecifiques,
            typeService,
            presentation,
            niveauSecurite,
            statutDeploiement,
            provenanceService,
            delaiAvantImpactCritique,
            donneesCaracterePersonnel,
            localisationDonnees,
            fonctionnalites,
          },
          referentiel
        );

        const { idUtilisateurCourant, service } =
          requete as unknown as RequestRouteConnecteService;

        await depotDonnees.ajouteDescriptionService(
          idUtilisateurCourant,
          requete.params.id,
          descriptionService
        );

        reponse.send({ idService: service.id });
      } catch (e) {
        if (e instanceof ErreurNomServiceDejaExistant)
          reponse
            .status(422)
            .json({ erreur: { code: 'NOM_SERVICE_DEJA_EXISTANT' } });
        else suite(e);
      }
    }
  );

  routes.post(
    '/estimationNiveauSecurite',
    middleware.verificationAcceptationCGU,
    valideBody(
      z.strictObject(schemaPostEstimationNiveauSecurite(referentielV2))
    ),
    async (requete, reponse) => {
      const {
        nomService,
        organisationResponsable,
        nombreOrganisationsUtilisatrices,
        pointsAcces,
        fonctionnalitesSpecifiques,
        donneesSensiblesSpecifiques,
        typeService,
        presentation,
        statutDeploiement,
        provenanceService,
        delaiAvantImpactCritique,
        donneesCaracterePersonnel,
        localisationDonnees,
        fonctionnalites,
      } = requete.body;

      const descriptionService = new DescriptionService(
        {
          nomService,
          organisationResponsable,
          nombreOrganisationsUtilisatrices,
          pointsAcces,
          fonctionnalitesSpecifiques,
          donneesSensiblesSpecifiques,
          typeService,
          presentation,
          statutDeploiement,
          provenanceService,
          delaiAvantImpactCritique,
          donneesCaracterePersonnel,
          localisationDonnees,
          fonctionnalites,
        },
        referentiel
      );

      reponse.json({
        niveauDeSecuriteMinimal:
          DescriptionService.estimeNiveauDeSecurite(descriptionService),
      });
    }
  );

  return routes;
};
