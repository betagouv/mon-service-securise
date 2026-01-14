import express from 'express';
import { z } from 'zod';
import { valideBody } from '../../http/validePayloads.js';
import { schemaPostModelesMesureSpecifique } from './routesConnecteApi.schema.js';
import {
  ErreurAutorisationInexistante,
  ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique,
  ErreurModeleDeMesureSpecifiqueDejaAssociee,
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurNombreLimiteModelesMesureSpecifiqueAtteint,
  ErreurServiceInexistant,
} from '../../erreurs.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { Middleware } from '../../http/middleware.interface.js';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { UUID } from '../../typesBasiques.js';

const routesConnecteApiModeleMesureSpecifique = ({
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

  routes.get('/', async (requete, reponse) => {
    const modeles =
      await depotDonnees.lisModelesMesureSpecifiquePourUtilisateur(
        (requete as RequestRouteConnecte).idUtilisateurCourant
      );

    reponse.json(modeles);
  });

  routes.post(
    '/',
    valideBody(
      z.strictObject(
        schemaPostModelesMesureSpecifique(referentiel, referentielV2)
      )
    ),
    async (requete, reponse) => {
      const { categorie, description, descriptionLongue } = requete.body;

      try {
        const idModele = await depotDonnees.ajouteModeleMesureSpecifique(
          (requete as RequestRouteConnecte).idUtilisateurCourant,
          { description, descriptionLongue, categorie }
        );

        reponse.status(201).send({ id: idModele });
      } catch (e) {
        if (e instanceof ErreurNombreLimiteModelesMesureSpecifiqueAtteint) {
          reponse.status(403).send('Limite de création atteinte');
          return;
        }
        throw e;
      }
    }
  );

  routes.put(
    '/:id',
    middleware.aseptise('description', 'descriptionLongue', 'categorie'),
    async (requete, reponse) => {
      const idModele = requete.params.id;
      const { categorie, description, descriptionLongue } = requete.body;

      const modelesMesureDeUtilisateur =
        await depotDonnees.lisModelesMesureSpecifiquePourUtilisateur(
          (requete as unknown as RequestRouteConnecte).idUtilisateurCourant
        );
      const modele = modelesMesureDeUtilisateur.find(
        (m: { id: UUID }) => m.id === idModele
      );
      if (!modele) {
        reponse.sendStatus(404);
        return;
      }

      try {
        referentiel.verifieCategoriesMesuresSontRepertoriees([categorie]);
      } catch (e) {
        if (e instanceof ErreurCategorieInconnue) {
          reponse.status(400).send('La catégorie est invalide');
          return;
        }
      }
      if (!description) {
        reponse.status(400).send('La description est obligatoire');
        return;
      }

      await depotDonnees.metsAJourModeleMesureSpecifique(
        (requete as unknown as RequestRouteConnecte).idUtilisateurCourant,
        idModele,
        {
          categorie,
          description,
          descriptionLongue,
        }
      );

      reponse.sendStatus(200);
    }
  );

  routes.delete(
    '/:id',
    middleware.aseptise('detacheMesures'),
    async (requete, reponse) => {
      try {
        const { idUtilisateurCourant } =
          requete as unknown as RequestRouteConnecte;
        if (requete.query.detacheMesures === 'true') {
          await depotDonnees.supprimeModeleMesureSpecifiqueEtDetacheMesuresAssociees(
            idUtilisateurCourant,
            requete.params.id
          );
        } else {
          await depotDonnees.supprimeModeleMesureSpecifiqueEtMesuresAssociees(
            idUtilisateurCourant,
            requete.params.id
          );
        }
        reponse.sendStatus(200);
      } catch (e) {
        if (e instanceof ErreurModeleDeMesureSpecifiqueIntrouvable) {
          reponse.sendStatus(404);
          return;
        }
        if (
          e instanceof ErreurAutorisationInexistante ||
          e instanceof ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique
        ) {
          reponse.sendStatus(403);
          return;
        }
        throw e;
      }
    }
  );

  routes.put(
    '/:id/services',
    middleware.aseptise('idsServicesAAssocier.*'),
    async (requete, reponse) => {
      const { id: idModele } = requete.params;
      const { idsServicesAAssocier } = requete.body;
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;

      const modelesMesureDeUtilisateur =
        await depotDonnees.lisModelesMesureSpecifiquePourUtilisateur(
          idUtilisateurCourant
        );
      const modele = modelesMesureDeUtilisateur.find(
        (m: { id: UUID }) => m.id === idModele
      );
      if (!modele) {
        reponse.sendStatus(404);
        return;
      }
      try {
        await depotDonnees.associeModeleMesureSpecifiqueAuxServices(
          idModele,
          idsServicesAAssocier,
          idUtilisateurCourant
        );
        reponse.sendStatus(200);
      } catch (e) {
        if (e instanceof ErreurModeleDeMesureSpecifiqueDejaAssociee) {
          reponse.sendStatus(400);
          return;
        }
        if (
          e instanceof ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique
        ) {
          reponse.sendStatus(403);
          return;
        }
        if (e instanceof ErreurAutorisationInexistante) {
          reponse.sendStatus(404);
          return;
        }
        if (e instanceof ErreurServiceInexistant) {
          reponse.sendStatus(400);
          return;
        }
        throw e;
      }
    }
  );

  routes.delete(
    '/:id/services',
    middleware.aseptise('idsServices.*'),
    async (requete, reponse) => {
      try {
        const { idUtilisateurCourant } =
          requete as unknown as RequestRouteConnecte;

        await depotDonnees.supprimeDesMesuresAssocieesAuModele(
          idUtilisateurCourant,
          requete.params.id,
          requete.body.idsServices
        );
        reponse.sendStatus(200);
      } catch (e) {
        if (e instanceof ErreurModeleDeMesureSpecifiqueIntrouvable) {
          reponse.sendStatus(404);
          return;
        }
        if (
          e instanceof ErreurAutorisationInexistante ||
          e instanceof ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique
        ) {
          reponse.sendStatus(403);
          return;
        }
        if (e instanceof ErreurServiceInexistant) {
          reponse.sendStatus(400);
          return;
        }
        throw e;
      }
    }
  );

  return routes;
};

export default routesConnecteApiModeleMesureSpecifique;
