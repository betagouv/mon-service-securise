import express from 'express';
import { z } from 'zod';
import { ErreurModele, ErreurNomServiceDejaExistant } from '../../erreurs.js';
import DescriptionService from '../../modeles/descriptionService.js';
import FonctionnalitesSpecifiques from '../../modeles/fonctionnalitesSpecifiques.js';
import DonneesSensiblesSpecifiques from '../../modeles/donneesSensiblesSpecifiques.js';
import PointsAcces from '../../modeles/pointsAcces.js';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import { Middleware } from '../../http/middleware.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';
import { RequestRouteConnecteService } from './routesConnecte.types.js';
import { valideBody, valideParams } from '../../http/validePayloads.js';
import { schemaPutDescriptionService } from './routesConnecteApiServiceDescription.schema.js';

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
    valideParams(z.strictObject({ id: z.uuid() })),
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
    middleware.aseptise(
      'nomService',
      'organisationsResponsables.*',
      'nombreOrganisationsUtilisatrices.*'
    ),
    middleware.aseptiseListes([
      { nom: 'pointsAcces', proprietes: PointsAcces.proprietesItem() },
      {
        nom: 'fonctionnalitesSpecifiques',
        proprietes: FonctionnalitesSpecifiques.proprietesItem(),
      },
      {
        nom: 'donneesSensiblesSpecifiques',
        proprietes: DonneesSensiblesSpecifiques.proprietesItem(),
      },
    ]),
    async (requete, reponse, suite) => {
      try {
        const descriptionService = new DescriptionService(
          requete.body,
          referentiel
        );

        reponse.json({
          niveauDeSecuriteMinimal:
            DescriptionService.estimeNiveauDeSecurite(descriptionService),
        });
      } catch (e) {
        if (e instanceof ErreurModele)
          reponse.status(400).send('La description du service est invalide');
        else suite(e);
      }
    }
  );

  return routes;
};
