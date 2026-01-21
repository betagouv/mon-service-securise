import express from 'express';
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
import { Referentiel } from '../../referentiel.interface.js';
import { RequestRouteConnecteService } from './routesConnecte.types.js';

const { ECRITURE } = Permissions;
const { DECRIRE } = Rubriques;

export const routesConnecteApiServiceDescription = ({
  depotDonnees,
  middleware,
  referentiel,
}: {
  depotDonnees: DepotDonnees;
  middleware: Middleware;
  referentiel: Referentiel;
}) => {
  const routes = express.Router();

  routes.put(
    '/:id',
    middleware.trouveService({ [DECRIRE]: ECRITURE }),
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
        else if (e instanceof ErreurModele) reponse.status(422).send(e.message);
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
