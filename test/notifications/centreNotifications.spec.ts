import CentreNotifications from '../../src/notifications/centreNotifications.ts';
import * as Referentiel from '../../src/referentiel.js';
import { creeDepot } from '../../src/depotDonnees.js';
import {
  ErreurIdentifiantNouveauteInconnu,
  ErreurIdentifiantTacheInconnu,
} from '../../src/erreurs.js';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { uneTacheDeService } from '../constructeurs/constructeurTacheDeService.js';
import { fabriqueAdaptateurHorloge } from '../../src/adaptateurs/adaptateurHorloge.js';
import fauxAdaptateurRechercheEntreprise from '../mocks/adaptateurRechercheEntreprise.js';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';
import * as adaptateurEnvironnement from '../../src/adaptateurs/adaptateurEnvironnement.js';
import { creeReferentielV2 } from '../../src/referentielV2.js';
import { TousReferentiels } from '../../src/referentiel.interface.ts';
import { DepotDonnees } from '../../src/depotDonnees.interface.ts';
import BusEvenements from '../../src/bus/busEvenements.js';
import { unUUID } from '../constructeurs/UUID.ts';

describe('Le centre de notifications', () => {
  let referentiel: TousReferentiels;
  let depotDonnees: DepotDonnees;

  const unReferentiel = (donnees: Record<string, unknown>) =>
    // @ts-expect-error On force des valeurs de test
    Referentiel.creeReferentiel(donnees);

  beforeEach(() => {
    referentiel = unReferentiel({
      nouvellesFonctionnalites: [
        { id: 'N1', dateDeDeploiement: '2024-01-01' },
        { id: 'N2', dateDeDeploiement: '2024-02-02' },
      ],
      naturesTachesService: { natureDeTest: { titre: '', lien: '/…' } },
      tachesCompletudeProfil: [],
    });
    depotDonnees = creeDepot({
      adaptateurEnvironnement,
      referentielV2: creeReferentielV2(),
      serviceCgu: { versionActuelle: () => '1' },
      adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      busEvenements: fabriqueBusPourLesTests() as unknown as BusEvenements,
    });

    depotDonnees.utilisateur = async () =>
      unUtilisateur()
        .quiSAppelle('Jean Dujardin')
        .quiSEstInscritLe('2020-01-01')
        .construis();
  });

  const centreDeNotification = () =>
    new CentreNotifications({
      referentiel,
      depotDonnees,
      adaptateurHorloge: fabriqueAdaptateurHorloge(),
    });

  it("jette une erreur s'il n'est pas instancié avec les bonnes dépendances", () => {
    // @ts-expect-error On force une mauvaise instanciation
    expect(() => new CentreNotifications({})).toThrow(
      "Impossible d'instancier le centre de notifications sans ses dépendances"
    );
  });

  it('trie toutes les notifications retournées', async () => {
    const enJanvier = '2024-01-01';
    referentiel.enrichis({
      // @ts-expect-error On force des valeurs de test
      nouvellesFonctionnalites: [{ id: 'N1', dateDeDeploiement: enJanvier }],
    });

    const enFevrier = '2024-02-02';
    depotDonnees.tachesDesServices = async () => [
      uneTacheDeService()
        .avecId('T1')
        .avecDateDeCreation(new Date(enFevrier))
        .construis(),
    ];

    const notifications = await centreDeNotification().toutesNotifications(
      unUUID('U1')
    );

    expect(notifications[0].id).toBe('T1');
    expect(notifications[1].id).toBe('N1');
  });

  describe('sur marquage de nouveauté lue', () => {
    it("jette une erreur si l'identifiant de nouveauté n'est pas présent dans le référentiel", async () => {
      try {
        await centreDeNotification().marqueNouveauteLue(
          unUUID('U1'),
          // @ts-expect-error On force un ID inconnu
          'ID_NOUVEAUTE_INCONNU'
        );
        expect.fail("L'appel aurait dû lever une exception.");
      } catch (e) {
        expect(e).toBeInstanceOf(ErreurIdentifiantNouveauteInconnu);
      }
    });

    it("délègue au dépôt de données le marquage à 'lu' de la nouveauté", async () => {
      let donneesRecues;
      depotDonnees.marqueNouveauteLue = async (idUtilisateur, idNouveaute) => {
        donneesRecues = { idUtilisateur, idNouveaute };
      };

      // @ts-expect-error On utilise un idenfitiant de test
      await centreDeNotification().marqueNouveauteLue(unUUID('U1'), 'N1');

      expect(donneesRecues!.idUtilisateur).toBe(unUUID('U1'));
      expect(donneesRecues!.idNouveaute).toBe('N1');
    });
  });

  describe('sur demande de toutes les notifications', () => {
    beforeEach(() => {
      depotDonnees.utilisateur = async () =>
        unUtilisateur()
          .quiSAppelle('Jean Valjean')
          .quiSEstInscritLe('2024-01-01')
          .construis();
      referentiel = unReferentiel({
        tachesCompletudeProfil: [{ id: 'siret', titre: 'Titre tâche' }],
        nouvellesFonctionnalites: [
          { id: 'N1', dateDeDeploiement: '2024-01-01' },
        ],
      });
    });

    it('renvoie les tâches en attente en premier, puis les nouveautés', async () => {
      const notifications = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(notifications.length).toBe(2);
      expect(notifications[0].id).toBe('siret');
      expect(notifications[1].id).toBe('N1');
    });

    it('ajoute le "type" de notifications', async () => {
      const notifications = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(notifications[0].type).toBe('tache');
      expect(notifications[1].type).toBe('nouveaute');
    });
  });

  describe('sur marquage de tâche de service lue', () => {
    it("jette une erreur si l'identifiant de tâche n'est pas présent dans le dépôt", async () => {
      depotDonnees.tachesDesServices = async () => [];

      try {
        await centreDeNotification().marqueTacheDeServiceLue(
          unUUID('U1'),
          // @ts-expect-error On force un ID inconnu
          'ID_INCONNU'
        );
        expect.fail("L'appel aurait dû lever une exception.");
      } catch (e) {
        expect(e).toBeInstanceOf(ErreurIdentifiantTacheInconnu);
      }
    });

    it("délègue au dépôt de données le marquage à 'lu' de la tâche", async () => {
      let donneesRecues;
      depotDonnees.tachesDesServices = async (idUtilisateur) =>
        idUtilisateur === unUUID('U1') ? [{ id: unUUID('T1') }] : [];
      depotDonnees.marqueTacheDeServiceLue = async (idTache) => {
        donneesRecues = { idTache };
      };

      await centreDeNotification().marqueTacheDeServiceLue(
        unUUID('U1'),
        unUUID('T1')
      );

      expect(donneesRecues!.idTache).toBe(unUUID('T1'));
    });
  });
});
