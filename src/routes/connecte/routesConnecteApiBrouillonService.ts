import express from 'express';
import * as z from 'zod';
import { DepotDonneesBrouillonService } from '../../depots/depotDonneesBrouillonService.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { valideBody, valideParams } from '../../http/validePayloads.js';
import { UUID } from '../../typesBasiques.js';
import {
  ErreurBrouillonInexistant,
  ErreurModele,
  ErreurNomServiceDejaExistant,
} from '../../erreurs.js';
import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';
import { reglesValidationBrouillonServiceV2 } from './routesConnecte.schema.js';

const routesConnecteApiBrouillonService = ({
  depotDonnees,
}: {
  depotDonnees: DepotDonneesBrouillonService;
}) => {
  const routes = express.Router();

  routes.post(
    '/',
    valideBody(
      z.strictObject({
        nomService: reglesValidationBrouillonServiceV2.nomService,
      })
    ),
    async (requete, reponse) => {
      const { idUtilisateurCourant } = requete as RequestRouteConnecte;
      const { nomService } = requete.body;

      const id = await depotDonnees.nouveauBrouillonService(
        idUtilisateurCourant,
        nomService
      );

      return reponse.json({ id });
    }
  );

  routes.put(
    '/:id/:nomPropriete',
    valideParams(
      z.strictObject({
        id: z.uuidv4(),
        nomPropriete: z.enum([
          'siret',
          'nomService',
          'statutDeploiement',
          'presentation',
          'pointsAcces',
          'typeService',
          'specificitesProjet',
          'typeHebergement',
          'activitesExternalisees',
          'ouvertureSysteme',
          'audienceCible',
          'dureeDysfonctionnementAcceptable',
          'categoriesDonneesTraitees',
          'categoriesDonneesTraiteesSupplementaires',
          'volumetrieDonneesTraitees',
          'localisationsDonneesTraitees',
          'niveauSecurite',
        ]),
      })
    ),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;
      const { id, nomPropriete } = requete.params;

      const objetValidation = z.strictObject({
        [nomPropriete]: reglesValidationBrouillonServiceV2[nomPropriete],
      });
      const resultatParsingBody = objetValidation.safeParse(requete.body);
      if (!resultatParsingBody.success) return reponse.sendStatus(400);

      const valeurPropriete = resultatParsingBody.data[nomPropriete];

      try {
        const brouillon = await depotDonnees.lisBrouillonService(
          idUtilisateurCourant,
          id as UUID
        );

        brouillon.metsAJourPropriete(nomPropriete, valeurPropriete);

        await depotDonnees.sauvegardeBrouillonService(
          idUtilisateurCourant,
          brouillon
        );
      } catch (e) {
        if (e instanceof ErreurBrouillonInexistant)
          return reponse.sendStatus(404);

        return suite(e);
      }

      return reponse.sendStatus(200);
    }
  );

  routes.get('/:id/niveauSecuriteRequis', async (requete, reponse, suite) => {
    const { idUtilisateurCourant } = requete as unknown as RequestRouteConnecte;
    const { id } = requete.params;
    try {
      const brouillon = await depotDonnees.lisBrouillonService(
        idUtilisateurCourant,
        id as UUID
      );
      const niveauRequis = DescriptionServiceV2.niveauSecuriteMinimalRequis(
        brouillon.enDonneesCreationServiceV2().descriptionService
      );
      return reponse.json({
        niveauDeSecuriteMinimal: niveauRequis,
      });
    } catch (e) {
      if (e instanceof ErreurBrouillonInexistant)
        return reponse.sendStatus(404);
      return suite(e);
    }
  });

  routes.post(
    '/:id/finalise',
    valideParams(z.strictObject({ id: z.uuidv4() })),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;
      const { id } = requete.params;

      try {
        const idService = await depotDonnees.finaliseBrouillonService(
          idUtilisateurCourant,
          id as UUID
        );

        return reponse.json({ idService });
      } catch (e) {
        if (e instanceof ErreurBrouillonInexistant)
          return reponse.sendStatus(404);

        if (e instanceof ErreurNomServiceDejaExistant)
          return reponse
            .status(422)
            .json({ erreur: { code: 'NOM_SERVICE_DEJA_EXISTANT' } });

        if (e instanceof ErreurModele) return reponse.sendStatus(422);

        return suite(e);
      }
    }
  );

  routes.get(
    '/:id',
    valideParams(z.strictObject({ id: z.uuidv4() })),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;
      const { id } = requete.params;

      try {
        const brouillon = await depotDonnees.lisBrouillonService(
          idUtilisateurCourant,
          id as UUID
        );

        return reponse.json(brouillon.toJSON());
      } catch (e) {
        if (e instanceof ErreurBrouillonInexistant)
          return reponse.sendStatus(404);
        return suite(e);
      }
    }
  );

  return routes;
};

export default routesConnecteApiBrouillonService;
