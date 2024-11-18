const expect = require('expect.js');
const CentreNotifications = require('../../src/notifications/centreNotifications');
const Referentiel = require('../../src/referentiel');
const { creeDepot } = require('../../src/depotDonnees');
const {
  ErreurIdentifiantNouveauteInconnu,
  ErreurIdentifiantTacheInconnu,
} = require('../../src/erreurs');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');
const adaptateurHorloge = require('../../src/adaptateurs/adaptateurHorloge');
const {
  uneTacheDeService,
} = require('../constructeurs/constructeurTacheDeService');

describe('Le centre de notifications', () => {
  let referentiel;
  let depotDonnees;

  beforeEach(() => {
    referentiel = Referentiel.creeReferentiel({
      nouvellesFonctionnalites: [
        { id: 'N1', dateDeDeploiement: '2024-01-01' },
        { id: 'N2', dateDeDeploiement: '2024-02-02' },
      ],
      naturesTachesService: { natureDeTest: { titre: '', lien: '/…' } },
      tachesCompletudeProfil: [],
    });
    depotDonnees = creeDepot();

    depotDonnees.utilisateur = async () =>
      unUtilisateur()
        .quiSAppelle('Jean Dujardin')
        .quiSEstInscritLe('2020-01-01')
        .construis();
  });

  const centreDeNotification = () =>
    new CentreNotifications({ referentiel, depotDonnees, adaptateurHorloge });

  it("jette une erreur s'il n'est pas instancié avec les bonnes dépendances", () => {
    expect(() => new CentreNotifications({})).to.throwError((e) => {
      expect(e.message).to.be(
        "Impossible d'instancier le centre de notifications sans ses dépendances"
      );
    });
  });

  it('trie toutes les notifications retournées', async () => {
    const enJanvier = '2024-01-01';
    referentiel.enrichis({
      nouvellesFonctionnalites: [{ id: 'N1', dateDeDeploiement: enJanvier }],
    });

    const enFevrier = '2024-02-02';
    depotDonnees.tachesDesServices = async () => [
      uneTacheDeService()
        .avecId('T1')
        .avecDateDeCreation(new Date(enFevrier))
        .construis(),
    ];

    const notifications =
      await centreDeNotification().toutesNotifications('U1');

    expect(notifications[0].id).to.be('T1');
    expect(notifications[1].id).to.be('N1');
  });

  describe('concernant les nouveautés', () => {
    it("retourne les nouveautés, dans l'ordre antéchronologique", async () => {
      const notifications =
        await centreDeNotification().toutesNotifications('U1');

      expect(notifications.length).to.be(2);
      expect(notifications[0].id).to.be('N2');
    });

    it("ajoute le statut 'lu' à la notification si elle l'est", async () => {
      let donneesRecues;
      depotDonnees.nouveautesPourUtilisateur = async (idUtilisateur) => {
        donneesRecues = { idUtilisateur };
        return ['N2'];
      };

      const notifications =
        await centreDeNotification().toutesNotifications('U1');

      expect(donneesRecues.idUtilisateur).to.be('U1');

      expect(notifications[0].id).to.be('N2');
      expect(notifications[0].statutLecture).to.be('lue');
      expect(notifications[1].id).to.be('N1');
      expect(notifications[1].statutLecture).to.be('nonLue');
    });

    it('ne retourne pas les nouveautés du futur', async () => {
      referentiel = Referentiel.creeReferentiel({
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

      const notifications = await centreNotifications.toutesNotifications('U1');

      expect(notifications.length).to.be(0);
    });

    it("ne retourne pas les nouveautés antécédentes à la création de l'utilisateur", async () => {
      referentiel = Referentiel.creeReferentiel({
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
        adaptateurHorloge,
      });

      const notifications = await centreNotifications.toutesNotifications('U1');

      expect(notifications.length).to.be(0);
    });

    it('indique que la nouveaute doit être notifiée de sa lecture', async () => {
      const notifications =
        await centreDeNotification().toutesNotifications('U1');

      expect(notifications[0].doitNotifierLecture).to.be(true);
    });

    it('utilise la date de déploiement comme horodatage', async () => {
      referentiel.enrichis({
        nouvellesFonctionnalites: [
          { id: 'N1', dateDeDeploiement: '2024-07-15' },
        ],
      });

      const notifications =
        await centreDeNotification().toutesNotifications('U1');

      expect(notifications[0].horodatage).to.eql(new Date('2024-07-15'));
    });
  });

  describe('sur marquage de nouveauté lue', () => {
    it("jette une erreur si l'identifiant de nouveauté n'est pas présent dans le référentiel", async () => {
      try {
        await centreDeNotification().marqueNouveauteLue(
          'idUtilisateur',
          'ID_NOUVEAUTE_INCONNU'
        );
        expect().fail("L'appel aurait dû lever une exception.");
      } catch (e) {
        expect(e).to.be.an(ErreurIdentifiantNouveauteInconnu);
      }
    });

    it("délègue au dépôt de données le marquage à 'lu' de la nouveauté", async () => {
      let donneesRecues;
      depotDonnees.marqueNouveauteLue = async (idUtilisateur, idNouveaute) => {
        donneesRecues = { idUtilisateur, idNouveaute };
      };

      await centreDeNotification().marqueNouveauteLue('U1', 'N1');

      expect(donneesRecues.idUtilisateur).to.be('U1');
      expect(donneesRecues.idNouveaute).to.be('N1');
    });
  });

  describe('concernant les tâches liées aux services', () => {
    beforeEach(() => {
      referentiel.enrichis({
        nouvellesFonctionnalites: [],
        naturesTachesService: { natureDeTest: { titre: '', lien: '/…' } },
      });
    });

    it('retourne les tâches', async () => {
      depotDonnees.tachesDesServices = async (idUtilisateur) =>
        idUtilisateur === 'U1'
          ? [uneTacheDeService().avecId('T1').construis()]
          : [];

      const notifs = await centreDeNotification().toutesNotifications('U1');

      expect(notifs.length).to.be(1);
      expect(notifs[0].id).to.be('T1');
      expect(notifs[0].type).to.be('tache');
      expect(notifs[0].canalDiffusion).to.be('centreNotifications');
    });

    it('retourne uniquement les tâches non lues', async () => {
      depotDonnees.tachesDesServices = async () => [
        uneTacheDeService().avecId('T1').faiteMaintenant().construis(),
      ];

      const notifs = await centreDeNotification().toutesNotifications('U1');

      expect(notifs.length).to.be(0);
    });

    it('complète les informations depuis le référentiel', async () => {
      depotDonnees.tachesDesServices = async (_) => [
        uneTacheDeService().avecNature('niveauRetrograde').construis(),
      ];
      referentiel = Referentiel.creeReferentiel({
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

      const notifs = await centreDeNotification().toutesNotifications('U1');

      expect(notifs[0].entete).to.be('Le besoin de sécurité a été modifié');
      expect(notifs[0].titreCta).to.be('Voir le changement');
      expect(notifs[0].titre).to.be(
        'Votre service [XXX] a désormais des besoins de sécurité modérés.'
      );
    });

    it('complète le titre avec les informations liées au service', async () => {
      referentiel.enrichis({
        naturesTachesService: {
          natureDeTest: { titre: '--%NOM_SERVICE%--', lien: '' },
        },
      });

      depotDonnees.tachesDesServices = async (_) => [
        uneTacheDeService().avecUnServiceNomme('toto').construis(),
      ];

      const notifs = await centreDeNotification().toutesNotifications('U1');

      expect(notifs[0].titre).to.be('--toto--');
    });

    it('decode les caractères HTML dans les données liées au service', async () => {
      referentiel.enrichis({
        naturesTachesService: {
          natureDeTest: { titre: '%NOM_SERVICE%', lien: '' },
        },
      });

      depotDonnees.tachesDesServices = async (_) => [
        uneTacheDeService()
          .avecUnServiceNomme('le service &quot;modéré&quot;')
          .construis(),
      ];

      const notifs = await centreDeNotification().toutesNotifications('U1');

      expect(notifs[0].titre).to.be('le service "modéré"');
    });

    it('complète le titre avec les informations des données de la tâche', async () => {
      referentiel.enrichis({
        naturesTachesService: {
          natureDeTest: { titre: '--%nouveauxBesoins%--', lien: '' },
        },
      });

      depotDonnees.tachesDesServices = async (_) => [
        uneTacheDeService()
          .avecLesDonnees({ nouveauxBesoins: 'petits' })
          .construis(),
      ];
      const notifs = await centreDeNotification().toutesNotifications('U1');

      expect(notifs[0].titre).to.be('--petits--');
    });

    it("peut utiliser n'importe quelle donnée de la tâche pour complèter le titre", async () => {
      referentiel.enrichis({
        naturesTachesService: {
          natureDeTest: { titre: '--%nimportequoi%--', lien: '' },
        },
      });

      depotDonnees.tachesDesServices = async (_) => [
        uneTacheDeService()
          .avecLesDonnees({ nimportequoi: 'nimportequi' })
          .construis(),
      ];
      const notifs = await centreDeNotification().toutesNotifications('U1');

      expect(notifs[0].titre).to.be('--nimportequi--');
    });

    it("complète le lien avec l'ID du service", async () => {
      referentiel.enrichis({
        naturesTachesService: {
          natureDeTest: { lien: '/service/%ID_SERVICE%/page' },
        },
      });

      depotDonnees.tachesDesServices = async (_) => [
        uneTacheDeService().avecUnServiceId('S1').construis(),
      ];

      const notifs = await centreDeNotification().toutesNotifications('U1');

      expect(notifs[0].lien).to.be('/service/S1/page');
    });

    it('indique que la tache doit être notifiée de sa lecture', async () => {
      depotDonnees.tachesDesServices = async (_) => [
        uneTacheDeService().construis(),
      ];

      const notifications =
        await centreDeNotification().toutesNotifications('U1');

      expect(notifications[0].doitNotifierLecture).to.be(true);
    });

    it('utilise la date de création comme horodatage', async () => {
      depotDonnees.tachesDesServices = async (_) => [
        uneTacheDeService()
          .avecDateDeCreation(new Date('2024-09-13'))
          .construis(),
      ];

      const notifications =
        await centreDeNotification().toutesNotifications('U1');

      expect(notifications[0].horodatage).to.eql(new Date('2024-09-13'));
    });
  });

  describe("concernant les tâches liées à l'utilisateur", () => {
    it("utilise le dépôt de données pour récupérer l'utilisateur", async () => {
      let idRecu;
      depotDonnees.utilisateur = async (idUtilisateur) => {
        idRecu = idUtilisateur;
      };

      await centreDeNotification().toutesNotifications('U1');

      expect(idRecu).to.be('U1');
    });

    it("reste robuste si l'utilisateur est introuvable", async () => {
      depotDonnees.utilisateur = async () => undefined;

      const taches = await centreDeNotification().toutesNotifications('U1');

      expect(taches).to.be.an(Array);
    });

    it("renvoie un tableau vide si le profil de l'utilisateur est complet", async () => {
      referentiel = Referentiel.creeReferentiel({
        nouvellesFonctionnalites: [],
      });

      depotDonnees.utilisateur = async () =>
        unUtilisateur()
          .quiSAppelle('Jean Valjean')
          .quiTravaillePourUneEntiteAvecSiret('12345')
          .construis();

      const taches = await centreDeNotification().toutesNotifications('U1');

      expect(taches.length).to.be(0);
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
        referentiel = Referentiel.creeReferentiel({
          tachesCompletudeProfil: [{ id: 'siret', titre: 'Titre tâche' }],
        });

        const taches = await centreDeNotification().toutesNotifications('U1');

        expect(taches.length).to.be(1);
        expect(taches[0].titre).to.be('Titre tâche');
        expect(taches[0].statutLecture).to.be('nonLue');
        expect(taches[0].canalDiffusion).to.be('centreNotifications');
      });

      it("reste robuste si les données d'une tâche sont absentes du référentiel", async () => {
        referentiel = Referentiel.creeReferentiel({
          tachesCompletudeProfil: [],
        });

        const taches = await centreDeNotification().toutesNotifications('U1');

        expect(taches.length).to.be(0);
      });
    });

    describe("lorsque l'utilisateur vient d'être invité, donc son profil a plein de champs non renseignés", () => {
      it('renvoie uniquement la notification « globale » de profil à mettre à jour', async () => {
        depotDonnees.utilisateur = async () =>
          unUtilisateur().quiNAPasRempliSonProfil().construis();
        referentiel = Referentiel.creeReferentiel({
          tachesCompletudeProfil: [
            { id: 'profil', titre: 'Titre tâche' },
            { id: 'siret', titre: 'Titre tâche' },
          ],
        });

        const taches = await centreDeNotification().toutesNotifications('U1');

        expect(taches.length).to.be(1);
        expect(taches[0].id).to.be('profil');
        expect(taches[0].canalDiffusion).to.be('centreNotifications');
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
      referentiel = Referentiel.creeReferentiel({
        tachesCompletudeProfil: [{ id: 'siret', titre: 'Titre tâche' }],
        nouvellesFonctionnalites: [
          { id: 'N1', dateDeDeploiement: '2024-01-01' },
        ],
      });
    });

    it('renvoie les tâches en attente en premier, puis les nouveautés', async () => {
      const notifications =
        await centreDeNotification().toutesNotifications('U1');

      expect(notifications.length).to.be(2);
      expect(notifications[0].id).to.be('siret');
      expect(notifications[1].id).to.be('N1');
    });

    it('ajoute le "type" de notifications', async () => {
      const notifications =
        await centreDeNotification().toutesNotifications('U1');

      expect(notifications[0].type).to.be('tache');
      expect(notifications[1].type).to.be('nouveaute');
    });
  });

  describe('sur marquage de tâche de service lue', () => {
    it("jette une erreur si l'identifiant de tâche n'est pas présent dans le dépôt", async () => {
      depotDonnees.tachesDesServices = async (_) => [];

      try {
        await centreDeNotification().marqueTacheDeServiceLue(
          'idUtilisateur',
          'ID_INCONNU'
        );
        expect().fail("L'appel aurait dû lever une exception.");
      } catch (e) {
        expect(e).to.be.an(ErreurIdentifiantTacheInconnu);
      }
    });

    it("délègue au dépôt de données le marquage à 'lu' de la tâche", async () => {
      let donneesRecues;
      depotDonnees.tachesDesServices = async (idUtilisateur) =>
        idUtilisateur === 'U1' ? [{ id: 'T1' }] : [];
      depotDonnees.marqueTacheDeServiceLue = async (idTache) => {
        donneesRecues = { idTache };
      };

      await centreDeNotification().marqueTacheDeServiceLue('U1', 'T1');

      expect(donneesRecues.idTache).to.be('T1');
    });
  });
});
