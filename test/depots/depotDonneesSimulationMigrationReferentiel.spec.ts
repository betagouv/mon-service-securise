import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import * as DepotDonneesSimulationMigrationReferentiel from '../../src/depots/depotDonneesSimulationMigrationReferentiel.js';
import * as AdaptateurPersistanceMemoire from '../../src/adaptateurs/adaptateurPersistanceMemoire.js';
import { unBrouillonComplet } from '../constructeurs/constructeurBrouillonService.js';
import { unUUID, unUUIDRandom } from '../constructeurs/UUID.js';
import { unService } from '../constructeurs/constructeurService.js';
import { UUID } from '../../src/typesBasiques.js';
import { unAdaptateurChiffrementQuiWrap } from '../mocks/adaptateurChiffrementQuiWrap.js';
import { AdaptateurChiffrement } from '../../src/adaptateurs/adaptateurChiffrement.interface.js';
import { ErreurSimulationInexistante } from '../../src/erreurs.js';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';
import EvenementSimulationMigrationReferentielCreee from '../../src/bus/evenementSimulationMigrationReferentielCreee.js';
import BusEvenements from '../../src/bus/busEvenements.js';

describe('Le dépôt de données des simulations de migration du référentiel v2', () => {
  let persistance: ReturnType<
    typeof AdaptateurPersistanceMemoire.nouvelAdaptateur
  >;
  let adaptateurChiffrement: AdaptateurChiffrement;
  let busEvenements: ReturnType<typeof fabriqueBusPourLesTests> & BusEvenements;

  beforeEach(() => {
    persistance = unePersistanceMemoire().construis();
    adaptateurChiffrement = unAdaptateurChiffrementQuiWrap();
    busEvenements = fabriqueBusPourLesTests() as unknown as BusEvenements;
  });

  describe("sur demande d'ajout d'une simulation si nécessaire", () => {
    it("créé une simulation si elle n'existe pas pour ce service en chiffrant les données", async () => {
      const leDepot = () =>
        DepotDonneesSimulationMigrationReferentiel.creeDepot({
          adaptateurChiffrement,
          busEvenements,
          persistance,
        });

      let idRecu: UUID;
      let donneesRecues;
      persistance.sauvegardeSimulationMigrationReferentiel = async (
        idService: UUID,
        donnees
      ) => {
        idRecu = idService;
        donneesRecues = donnees;
      };

      const service = unService()
        .avecNomService('Mon service en V2')
        .avecId(unUUID('s'))
        .construis();

      await leDepot().ajouteSimulationMigrationReferentielSiNecessaire(service);

      expect(idRecu!).toBe(unUUID('s'));
      expect(donneesRecues!.chiffre).toBe(true);
      expect(donneesRecues!.coffreFort.nomService).toBe('Mon service en V2');
    });

    it('ne créé pas de simulation si elle existe déjà pour ce service', async () => {
      persistance = unePersistanceMemoire()
        .ajouteUneSimulationMigrationReferentiel(
          unUUID('s'),
          unBrouillonComplet().donneesBrouillon()
        )
        .construis();

      let peristanceAppelee = false;
      persistance.sauvegardeSimulationMigrationReferentiel = async () => {
        peristanceAppelee = true;
      };

      const leDepot = () =>
        DepotDonneesSimulationMigrationReferentiel.creeDepot({
          adaptateurChiffrement,
          busEvenements,
          persistance,
        });

      const service = unService().avecId(unUUID('s')).construis();

      await leDepot().ajouteSimulationMigrationReferentielSiNecessaire(service);
      expect(peristanceAppelee).toBe(false);
    });

    it('publie un événement de « simulation créée »', async () => {
      const leDepot = () =>
        DepotDonneesSimulationMigrationReferentiel.creeDepot({
          adaptateurChiffrement,
          busEvenements,
          persistance,
        });

      const service = unService()
        .avecNomService('Mon service en V2')
        .avecId(unUUID('s'))
        .construis();

      await leDepot().ajouteSimulationMigrationReferentielSiNecessaire(service);

      expect(
        busEvenements.aRecuUnEvenement(
          EvenementSimulationMigrationReferentielCreee
        )
      ).toBe(true);
      const evenement: EvenementSimulationMigrationReferentielCreee =
        busEvenements.recupereEvenement(
          EvenementSimulationMigrationReferentielCreee
        );
      expect(evenement.service.id).toBe(unUUID('s'));
    });

    it("ne publie pas d'événement de « simulation créée » si la simulation existe", async () => {
      persistance = unePersistanceMemoire()
        .ajouteUneSimulationMigrationReferentiel(
          unUUID('s'),
          unBrouillonComplet().donneesBrouillon()
        )
        .construis();
      const leDepot = () =>
        DepotDonneesSimulationMigrationReferentiel.creeDepot({
          adaptateurChiffrement,
          busEvenements,
          persistance,
        });

      const service = unService()
        .avecNomService('Mon service en V2')
        .avecId(unUUID('s'))
        .construis();

      await leDepot().ajouteSimulationMigrationReferentielSiNecessaire(service);

      expect(
        busEvenements.nAPasRecuUnEvenement(
          EvenementSimulationMigrationReferentielCreee
        )
      ).toBe(true);
    });
  });

  describe("sur demande de lecture d'une simulation", () => {
    it('retourne un brouillon en déchiffrant les données', async () => {
      const idService = unUUID('1');

      persistance = unePersistanceMemoire()
        .ajouteUneSimulationMigrationReferentiel(idService, {
          chiffre: true,
          coffreFort: unBrouillonComplet().donneesBrouillon(),
        })
        .construis();

      const leDepot = () =>
        DepotDonneesSimulationMigrationReferentiel.creeDepot({
          adaptateurChiffrement,
          busEvenements,
          persistance,
        });

      const simulation =
        await leDepot().lisSimulationMigrationReferentiel(idService);

      expect(simulation!.toJSON().nomService).toBe('Service A');
    });

    it("jette une erreur si la simulation n'existe pas", async () => {
      const leDepot = () =>
        DepotDonneesSimulationMigrationReferentiel.creeDepot({
          adaptateurChiffrement,
          busEvenements,
          persistance,
        });

      await expect(
        leDepot().lisSimulationMigrationReferentiel(unUUIDRandom())
      ).rejects.toThrowError(ErreurSimulationInexistante);
    });
  });

  describe("sur demande de sauvegarde d'une simulation", () => {
    it('sauvegarde la simulation en chiffrant les données', async () => {
      const idDuService = unUUID('s');
      const leDepot = () =>
        DepotDonneesSimulationMigrationReferentiel.creeDepot({
          adaptateurChiffrement,
          busEvenements,
          persistance,
        });

      let idRecu: UUID;
      let donneesRecues;
      persistance.sauvegardeSimulationMigrationReferentiel = async (
        idService: UUID,
        donnees
      ) => {
        idRecu = idService;
        donneesRecues = donnees;
      };

      const simulation = unBrouillonComplet().construis();

      await leDepot().sauvegardeSimulationMigrationReferentiel(
        idDuService,
        simulation
      );

      expect(idRecu!).toBe(unUUID('s'));
      expect(donneesRecues!.chiffre).toBe(true);
      expect(donneesRecues!.coffreFort.nomService).toBe('Service A');
    });
  });

  describe("sur demande de suppression d'une simulation", () => {
    it('supprime la simulation', async () => {
      const idService = unUUID('1');

      persistance = unePersistanceMemoire()
        .ajouteUneSimulationMigrationReferentiel(idService, {})
        .construis();

      const leDepot = () =>
        DepotDonneesSimulationMigrationReferentiel.creeDepot({
          adaptateurChiffrement,
          busEvenements,
          persistance,
        });

      await leDepot().supprimeSimulationMigrationReferentiel(idService);

      const simulationSupprimee =
        await persistance.lisSimulationMigrationReferentiel(idService);
      expect(simulationSupprimee).toBe(undefined);
    });
  });
});
