import express, { Request } from 'express';
import RisqueSpecifique from '../../modeles/risqueSpecifique.js';
import {
  ErreurCategorieRisqueInconnue,
  ErreurCategoriesRisqueManquantes,
  ErreurIntituleRisqueManquant,
  ErreurNiveauGraviteInconnu,
  ErreurNiveauVraisemblanceInconnu,
  ErreurRisqueInconnu,
} from '../../erreurs.js';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import { Middleware } from '../../http/middleware.interface.js';
import { Referentiel } from '../../referentiel.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import Service from '../../modeles/service.js';

const { ECRITURE } = Permissions;
const { RISQUES } = Rubriques;

type RequeteAvecService = Request & {
  service: Service;
};

export const routesConnecteApiServiceRisquesSpecifiques = ({
  depotDonnees,
  middleware,
  referentiel,
}: {
  depotDonnees: DepotDonnees;
  middleware: Middleware;
  referentiel: Referentiel;
}) => {
  const routes = express.Router();

  routes.post(
    '/:id/risquesSpecifiques',
    middleware.trouveService({ [RISQUES]: ECRITURE }),
    middleware.aseptise(
      'niveauGravite',
      'niveauVraisemblance',
      'commentaire',
      'description',
      'intitule',
      'categories.*'
    ),
    async (requete, reponse, suite) => {
      const { service } = requete as unknown as RequeteAvecService;
      const {
        niveauGravite,
        niveauVraisemblance,
        intitule,
        commentaire,
        description,
        categories,
      } = requete.body;
      try {
        RisqueSpecifique.valide(
          {
            niveauVraisemblance,
            niveauGravite,
            intitule,
            commentaire,
            description,
            categories,
          },
          referentiel
        );
        const risque = new RisqueSpecifique(
          {
            niveauGravite,
            niveauVraisemblance,
            intitule,
            commentaire,
            description,
            categories,
          },
          referentiel
        );
        await depotDonnees.ajouteRisqueSpecifiqueAService(service.id, risque);
        reponse.status(201).send(risque.toJSON());
      } catch (e) {
        if (
          e instanceof ErreurNiveauGraviteInconnu ||
          e instanceof ErreurNiveauVraisemblanceInconnu ||
          e instanceof ErreurIntituleRisqueManquant ||
          e instanceof ErreurCategoriesRisqueManquantes ||
          e instanceof ErreurCategorieRisqueInconnue
        ) {
          reponse.status(400).send(e.constructor.name);
          return;
        }
        suite(e);
      }
    }
  );

  routes.put(
    '/:id/risquesSpecifiques/:idRisque',
    middleware.trouveService({ [RISQUES]: ECRITURE }),
    middleware.aseptise(
      'niveauGravite',
      'niveauVraisemblance',
      'commentaire',
      'description',
      'intitule',
      'categories.*'
    ),
    async (requete, reponse, suite) => {
      const {
        niveauGravite,
        niveauVraisemblance,
        intitule,
        commentaire,
        description,
        categories,
      } = requete.body;
      const { idRisque } = requete.params;
      const { service } = requete as unknown as RequeteAvecService;
      try {
        RisqueSpecifique.valide(
          {
            niveauGravite,
            niveauVraisemblance,
            intitule,
            commentaire,
            description,
            categories,
          },
          referentiel
        );
        const risque = new RisqueSpecifique(
          {
            id: idRisque,
            niveauGravite,
            niveauVraisemblance,
            intitule,
            commentaire,
            description,
            categories,
          },
          referentiel
        );
        await depotDonnees.metsAJourRisqueSpecifiqueDuService(
          service.id,
          risque
        );
        reponse.status(200).send(risque.toJSON());
      } catch (e) {
        if (e instanceof ErreurRisqueInconnu) {
          reponse.status(404).send('Le risque est introuvable');
          return;
        }
        if (
          e instanceof ErreurNiveauGraviteInconnu ||
          e instanceof ErreurNiveauVraisemblanceInconnu ||
          e instanceof ErreurIntituleRisqueManquant ||
          e instanceof ErreurCategoriesRisqueManquantes ||
          e instanceof ErreurCategorieRisqueInconnue
        ) {
          reponse.status(400).send(e.constructor.name);
          return;
        }
        suite(e);
      }
    }
  );

  routes.delete(
    '/:id/risquesSpecifiques/:idRisque',
    middleware.trouveService({ [RISQUES]: ECRITURE }),
    async (requete, reponse) => {
      const { idRisque } = requete.params;
      const { service } = requete as unknown as RequeteAvecService;

      await depotDonnees.supprimeRisqueSpecifiqueDuService(
        service.id,
        idRisque
      );

      reponse.sendStatus(200);
    }
  );

  return routes;
};
