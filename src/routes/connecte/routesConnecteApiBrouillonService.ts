import express from 'express';
import * as z from 'zod';
import { DepotDonneesBrouillonService } from '../../depots/depotDonneesBrouillonService.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { valideBody, valideParams } from '../../http/validePayloads.js';
import { UUID } from '../../typesBasiques.js';
import { ErreurBrouillonInexistant } from '../../erreurs.js';
import { Referentiel } from '../../referentiel.interface.js';
import { questionsV2 } from '../../../donneesReferentielMesuresV2.js';
import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';

const routesConnecteApiBrouillonService = ({
  depotDonnees,
  referentiel,
}: {
  depotDonnees: DepotDonneesBrouillonService;
  referentiel: Referentiel;
}) => {
  const routes = express.Router();

  const reglesValidationProprietes = () => ({
    siret: z.string().regex(/^\d{14}$/),
    nomService: z.string().trim().nonempty(),
    statutDeploiement: z.enum(Object.keys(referentiel.statutsDeploiement())),
    presentation: z.string().trim().nonempty(),
    pointsAcces: z.array(z.string().trim().nonempty()),
    typeService: z
      .array(z.enum(Object.keys(questionsV2.typeDeService)))
      .nonempty(),
    specificitesProjet: z.array(
      z.enum(Object.keys(questionsV2.specificiteProjet))
    ),
    typeHebergement: z.enum(Object.keys(questionsV2.typeHebergement)),
    activitesExternalisees: z.array(
      z.enum(Object.keys(questionsV2.activiteExternalisee))
    ),
    ouvertureSysteme: z.enum(Object.keys(questionsV2.ouvertureSysteme)),
    audienceCible: z.enum(Object.keys(questionsV2.audienceCible)),
    dureeDysfonctionnementAcceptable: z.enum(
      Object.keys(questionsV2.dureeDysfonctionnementAcceptable)
    ),
    categoriesDonneesTraitees: z.array(
      z.enum(Object.keys(questionsV2.categorieDonneesTraitees))
    ),
    categoriesDonneesTraiteesSupplementaires: z.array(
      z.string().trim().nonempty()
    ),
    volumetrieDonneesTraitees: z.enum(
      Object.keys(questionsV2.volumetrieDonneesTraitees)
    ),
    localisationsDonneesTraitees: z
      .array(z.enum(Object.keys(questionsV2.localisationDonneesTraitees)))
      .nonempty(),
  });

  routes.post(
    '/',
    valideBody(
      z.strictObject({
        nomService: reglesValidationProprietes().nomService,
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
        ]),
      })
    ),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;
      const { id, nomPropriete } = requete.params;

      const objetValidation = z.strictObject({
        [nomPropriete]: reglesValidationProprietes()[nomPropriete],
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
