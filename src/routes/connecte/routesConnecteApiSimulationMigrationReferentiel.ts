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
import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';
import { DepotDonneesService } from '../../depots/depotDonneesService.interface.js';
import { SimulationMigrationReferentiel } from '../../modeles/simulationMigrationReferentiel.js';

const { LECTURE, ECRITURE } = Permissions;
const { DECRIRE, SECURISER } = Rubriques;

const routesConnecteApiSimulationMigrationReferentiel = ({
  depotDonnees,
  middleware,
  referentiel,
  referentielV2,
}: {
  depotDonnees: DepotDonneesSimulationMigrationReferentiel &
    DepotDonneesService;
  middleware: Middleware;
  referentiel: Referentiel;
  referentielV2: ReferentielV2;
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

      return reponse.sendStatus(200);
    }
  );

  routes.get(
    '/:id/simulation-migration-referentiel/niveauSecuriteRequis',
    valideParams(z.strictObject({ id: z.uuidv4() })),
    middleware.trouveService({ [DECRIRE]: LECTURE }),
    async (requete, reponse, suite) => {
      const { id } = requete.params;
      try {
        const simulation = await depotDonnees.lisSimulationMigrationReferentiel(
          id as UUID
        );

        const niveauRequis = DescriptionServiceV2.niveauSecuriteMinimalRequis(
          simulation.pourCalculNiveauDeSecurite()
        );

        return reponse.json({ niveauDeSecuriteMinimal: niveauRequis });
      } catch (e) {
        if (e instanceof ErreurSimulationInexistante)
          return reponse.sendStatus(404);
        return suite(e);
      }
    }
  );

  routes.get(
    '/:id/simulation-migration-referentiel/evolution-mesures',
    valideParams(z.strictObject({ id: z.uuidv4() })),
    middleware.trouveService({ [DECRIRE]: LECTURE, [SECURISER]: LECTURE }),
    async (requete, reponse, suite) => {
      const { id } = requete.params;
      const idService = id as UUID;

      try {
        const brouillonService =
          await depotDonnees.lisSimulationMigrationReferentiel(idService);

        const service = await depotDonnees.service(idService);
        if (!service) return reponse.sendStatus(404);

        const { total } = service.indiceCyber();

        const evolutionMesures = new SimulationMigrationReferentiel({
          serviceV1: service,
          descriptionServiceV2: brouillonService.enDescriptionV2(referentielV2),
          referentielV1: referentiel,
          referentielV2,
        }).evolutionMesures();

        return reponse.json({
          indiceCyberV1: { total, max: referentiel.indiceCyberNoteMax() },
          evolutionMesures,
        });
      } catch (e) {
        if (e instanceof ErreurSimulationInexistante)
          return reponse.sendStatus(404);

        return suite(e);
      }
    }
  );

  return routes;
};

export default routesConnecteApiSimulationMigrationReferentiel;
