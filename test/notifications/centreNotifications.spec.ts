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

  describe('concernant les nouveautés', () => {
    it("retourne les nouveautés, dans l'ordre antéchronologique", async () => {
      const notifications = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(notifications.length).toBe(2);
      expect(notifications[0].id).toBe('N2');
    });

    it("ajoute le statut 'lu' à la notification si elle l'est", async () => {
      let donneesRecues;
      depotDonnees.nouveautesPourUtilisateur = async (idUtilisateur) => {
        donneesRecues = { idUtilisateur };
        return ['N2'];
      };

      const notifications = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(donneesRecues!.idUtilisateur).toBe(unUUID('U1'));

      expect(notifications[0].id).toBe('N2');
      expect(notifications[0].statutLecture).toBe('lue');
      expect(notifications[1].id).toBe('N1');
      expect(notifications[1].statutLecture).toBe('nonLue');
    });

    it('ne retourne pas les nouveautés du futur', async () => {
      referentiel = unReferentiel({
        nouvellesFonctionnalites: [
          { id: 'N1', dateDeDeploiement: '2024-01-01' },
        ],
        tachesCompletudeProfil: [],
      });
      const decembre2023 = { maintenant: () => new Date(2023, 11, 1) };
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
        adaptateurHorloge: decembre2023,
      });

      const notifications = await centreNotifications.toutesNotifications(
        unUUID('U1')
      );

      expect(notifications.length).toBe(0);
    });

    it("ne retourne pas les nouveautés antécédentes à la création de l'utilisateur", async () => {
      referentiel = unReferentiel({
        nouvellesFonctionnalites: [
          { id: 'N1', dateDeDeploiement: '2023-01-01' },
        ],
        tachesCompletudeProfil: [],
      });
      depotDonnees.utilisateur = async () =>
        unUtilisateur()
          .quiSAppelle('Jean Dujardin')
          .quiSEstInscritLe('2024-01-01')
          .construis();
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
        adaptateurHorloge: fabriqueAdaptateurHorloge(),
      });

      const notifications = await centreNotifications.toutesNotifications(
        unUUID('U1')
      );

      expect(notifications.length).toBe(0);
    });

    it('indique que la nouveaute doit être notifiée de sa lecture', async () => {
      const notifications = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(notifications[0].doitNotifierLecture).toBe(true);
    });

    it('utilise la date de déploiement comme horodatage', async () => {
      referentiel.enrichis({
        nouvellesFonctionnalites: [
          // @ts-expect-error On force des valeurs de test
          { id: 'N1', dateDeDeploiement: '2024-07-15' },
        ],
      });

      const notifications = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(notifications[0].horodatage).toEqual(new Date('2024-07-15'));
    });
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

  describe('concernant les tâches liées aux services', () => {
    beforeEach(() => {
      referentiel.enrichis({
        nouvellesFonctionnalites: [],
        // @ts-expect-error On force des valeurs de test
        naturesTachesService: { natureDeTest: { titre: '', lien: '/…' } },
      });
    });

    it('retourne les tâches', async () => {
      depotDonnees.tachesDesServices = async (idUtilisateur) =>
        idUtilisateur === unUUID('U1')
          ? [uneTacheDeService().avecId('T1').construis()]
          : [];

      const notifs = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(notifs.length).toBe(1);
      expect(notifs[0].id).toBe('T1');
      expect(notifs[0].type).toBe('tache');
      expect(notifs[0].canalDiffusion).toBe('centreNotifications');
    });

    it('retourne uniquement les tâches non lues', async () => {
      depotDonnees.tachesDesServices = async () => [
        uneTacheDeService().avecId('T1').faiteMaintenant().construis(),
      ];

      const notifs = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(notifs.length).toBe(0);
    });

    it('complète les informations depuis le référentiel', async () => {
      depotDonnees.tachesDesServices = async () => [
        uneTacheDeService().avecNature('niveauRetrograde').construis(),
      ];
      referentiel = unReferentiel({
        nouvellesFonctionnalites: [],
        naturesTachesService: {
          niveauRetrograde: {
            entete: 'Le besoin de sécurité a été modifié',
            titreCta: 'Voir le changement',
            titre:
              'Votre service [XXX] a désormais des besoins de sécurité modérés.',
            lien: '/…',
          },
        },
        tachesCompletudeProfil: [],
      });

      const notifs = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(notifs[0].entete).toBe('Le besoin de sécurité a été modifié');
      expect(notifs[0].titreCta).toBe('Voir le changement');
      expect(notifs[0].titre).toBe(
        'Votre service [XXX] a désormais des besoins de sécurité modérés.'
      );
    });

    it('complète le titre avec les informations liées au service', async () => {
      referentiel.enrichis({
        naturesTachesService: {
          // @ts-expect-error On force des valeurs de test
          natureDeTest: { titre: '--%NOM_SERVICE%--', lien: '' },
        },
      });

      depotDonnees.tachesDesServices = async () => [
        uneTacheDeService().avecUnServiceNomme('toto').construis(),
      ];

      const notifs = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(notifs[0].titre).toBe('--toto--');
    });

    it('complète le titre avec les informations des données de la tâche', async () => {
      referentiel.enrichis({
        naturesTachesService: {
          // @ts-expect-error On force des valeurs de test
          natureDeTest: { titre: '--%nouveauxBesoins%--', lien: '' },
        },
      });

      depotDonnees.tachesDesServices = async () => [
        uneTacheDeService()
          .avecLesDonnees({ nouveauxBesoins: 'petits' })
          .construis(),
      ];
      const notifs = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(notifs[0].titre).toBe('--petits--');
    });

    it("peut utiliser n'importe quelle donnée de la tâche pour complèter le titre", async () => {
      referentiel.enrichis({
        naturesTachesService: {
          // @ts-expect-error On force des valeurs de test
          natureDeTest: { titre: '--%nimportequoi%--', lien: '' },
        },
      });

      depotDonnees.tachesDesServices = async () => [
        uneTacheDeService()
          .avecLesDonnees({ nimportequoi: 'nimportequi' })
          .construis(),
      ];
      const notifs = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(notifs[0].titre).toBe('--nimportequi--');
    });

    it("complète le lien avec l'ID du service", async () => {
      referentiel.enrichis({
        naturesTachesService: {
          // @ts-expect-error On force des valeurs de test
          natureDeTest: { lien: '/service/%ID_SERVICE%/page' },
        },
      });

      depotDonnees.tachesDesServices = async () => [
        uneTacheDeService().avecUnServiceId('S1').construis(),
      ];

      const notifs = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(notifs[0].lien).toBe('/service/S1/page');
    });

    it('ne conserve pas les données du service', async () => {
      referentiel.enrichis({
        naturesTachesService: {
          // @ts-expect-error On force des valeurs de test
          natureDeTest: { lien: '/service/%ID_SERVICE%/page' },
        },
      });

      depotDonnees.tachesDesServices = async () => [
        uneTacheDeService().avecUnServiceId('S1').construis(),
      ];

      const notifs = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(notifs[0].service).toBe(undefined);
    });

    it('indique que la tache doit être notifiée de sa lecture', async () => {
      depotDonnees.tachesDesServices = async () => [
        uneTacheDeService().construis(),
      ];

      const notifications = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(notifications[0].doitNotifierLecture).toBe(true);
    });

    it('utilise la date de création comme horodatage', async () => {
      depotDonnees.tachesDesServices = async () => [
        uneTacheDeService()
          .avecDateDeCreation(new Date('2024-09-13'))
          .construis(),
      ];

      const notifications = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(notifications[0].horodatage).toEqual(new Date('2024-09-13'));
    });
  });

  describe("concernant les tâches liées à l'utilisateur", () => {
    it("utilise le dépôt de données pour récupérer l'utilisateur", async () => {
      let idRecu;
      depotDonnees.utilisateur = async (idUtilisateur) => {
        idRecu = idUtilisateur;
        return unUtilisateur().avecId(idUtilisateur).construis();
      };

      await centreDeNotification().toutesNotifications(unUUID('U1'));

      expect(idRecu).toBe(unUUID('U1'));
    });

    it("reste robuste si l'utilisateur est introuvable", async () => {
      depotDonnees.utilisateur = async () => undefined;

      const taches = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(taches).toBeInstanceOf(Array);
    });

    it("renvoie un tableau vide si le profil de l'utilisateur est complet", async () => {
      referentiel = unReferentiel({
        nouvellesFonctionnalites: [],
      });

      depotDonnees.utilisateur = async () =>
        unUtilisateur()
          .quiSAppelle('Jean Valjean')
          .quiTravaillePourUneEntiteAvecSiret('12345')
          .construis();

      const taches = await centreDeNotification().toutesNotifications(
        unUUID('U1')
      );

      expect(taches.length).toBe(0);
    });

    describe("lorsque le SIRET de l'utilisateur est manquant", () => {
      beforeEach(() => {
        depotDonnees.utilisateur = async () =>
          unUtilisateur()
            .quiSAppelle('Jeanine Valjean')
            .quiTravaillePourUneEntiteAvecSiret(null)
            .construis();
      });

      it('renvoie la notification correspondant au champ non renseigné du profil', async () => {
        referentiel = unReferentiel({
          tachesCompletudeProfil: [{ id: 'siret', titre: 'Titre tâche' }],
        });

        const taches = await centreDeNotification().toutesNotifications(
          unUUID('U1')
        );

        expect(taches.length).toBe(1);
        expect(taches[0].titre).toBe('Titre tâche');
        expect(taches[0].statutLecture).toBe('nonLue');
        expect(taches[0].canalDiffusion).toBe('centreNotifications');
      });

      it("reste robuste si les données d'une tâche sont absentes du référentiel", async () => {
        referentiel = unReferentiel({
          tachesCompletudeProfil: [],
        });

        const taches = await centreDeNotification().toutesNotifications(
          unUUID('U1')
        );

        expect(taches.length).toBe(0);
      });
    });

    describe("lorsque l'utilisateur vient d'être invité, donc son profil a plein de champs non renseignés", () => {
      it('renvoie uniquement la notification « globale » de profil à mettre à jour', async () => {
        depotDonnees.utilisateur = async () =>
          unUtilisateur().quiNAPasRempliSonProfil().construis();
        referentiel = unReferentiel({
          tachesCompletudeProfil: [
            { id: 'profil', titre: 'Titre tâche' },
            { id: 'siret', titre: 'Titre tâche' },
          ],
        });

        const taches = await centreDeNotification().toutesNotifications(
          unUUID('U1')
        );

        expect(taches.length).toBe(1);
        expect(taches[0].id).toBe('profil');
        expect(taches[0].canalDiffusion).toBe('centreNotifications');
      });
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
