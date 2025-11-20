import express from 'express';
import * as z from 'zod';
import { UUID } from '../../typesBasiques.js';
import { DepotDonneesSimulationMigrationReferentiel } from '../../depots/depotDonneesSimulationMigrationReferentiel.js';
import { ErreurSimulationInexistante } from '../../erreurs.js';
import { valideParams } from '../../http/validePayloads.js';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import { Middleware } from '../../http/middleware.interface.js';
import { reglesValidationBrouillonServiceV2 } from './routesConnecte.schema.js';

const { LECTURE, ECRITURE } = Permissions;
const { DECRIRE, SECURISER } = Rubriques;

const routesConnecteApiSimulationMigrationReferentiel = ({
  depotDonnees,
  middleware,
}: {
  depotDonnees: DepotDonneesSimulationMigrationReferentiel;
  middleware: Middleware;
}) => {
  const routes = express.Router();

  routes.get(
    '/:id/simulation-migration-referentiel',
    valideParams(z.strictObject({ id: z.uuidv4() })),
    middleware.trouveService({ [DECRIRE]: LECTURE, [SECURISER]: LECTURE }),
    async (requete, reponse, suite) => {
      const { id: idService } = requete.params;

      try {
        const simulation = await depotDonnees.lisSimulationMigrationReferentiel(
          idService as UUID
        );

        return reponse.json(simulation.toJSON());
      } catch (e) {
        if (e instanceof ErreurSimulationInexistante)
          return reponse.sendStatus(404);
        return suite(e);
      }
    }
  );

  routes.put(
    '/:id/simulation-migration-referentiel/:nomPropriete',
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
          'localisationDonneesTraitees',
          'niveauSecurite',
        ]),
      })
    ),
    middleware.trouveService({ [DECRIRE]: ECRITURE, [SECURISER]: ECRITURE }),
    async (requete, reponse, suite) => {
      const { nomPropriete, id: idService } = requete.params;

      const objetValidation = z.strictObject({
        [nomPropriete]: reglesValidationBrouillonServiceV2[nomPropriete],
      });
      const resultatParsingBody = objetValidation.safeParse(requete.body);
      if (!resultatParsingBody.success) return reponse.sendStatus(400);
      const valeurPropriete = resultatParsingBody.data[nomPropriete];

      try {
        const simulation = await depotDonnees.lisSimulationMigrationReferentiel(
          idService as UUID
        );
        simulation.metsAJourPropriete(nomPropriete, valeurPropriete);
        await depotDonnees.sauvegardeSimulationMigrationReferentiel(
          idService as UUID,
          simulation
        );
      } catch (e) {
        if (e instanceof ErreurSimulationInexistante)
          return reponse.sendStatus(404);
        return suite(e);
      }

      reponse.sendStatus(200);
    }
  );

  return routes;
};

export default routesConnecteApiSimulationMigrationReferentiel;
