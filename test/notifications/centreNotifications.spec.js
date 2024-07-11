const expect = require('expect.js');
const CentreNotifications = require('../../src/notifications/centreNotifications');
const Referentiel = require('../../src/referentiel');
const { creeDepot } = require('../../src/depotDonnees');
const { ErreurIdentifiantNouveauteInconnu } = require('../../src/erreurs');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');
const adaptateurHorloge = require('../../src/adaptateurs/adaptateurHorloge');
const { unService } = require('../constructeurs/constructeurService');

describe('Le centre de notifications', () => {
  let referentiel;
  let depotDonnees;

  beforeEach(() => {
    referentiel = Referentiel.creeReferentiel({
      nouvellesFonctionnalites: [
        { id: 'N1', dateDeDeploiement: '2024-01-01' },
        { id: 'N2', dateDeDeploiement: '2024-02-02' },
      ],
    });
    depotDonnees = creeDepot();
  });

  it("jette une erreur s'il n'est pas instancié avec les bonnes dépendances", () => {
    expect(() => new CentreNotifications({})).to.throwError((e) => {
      expect(e.message).to.be(
        "Impossible d'instancier le centre de notifications sans ses dépendances"
      );
    });
  });

  it('trie toutes les notifications retournées', async () => {
    const enJanvier = '2024-01-01';
    referentiel = Referentiel.creeReferentiel({
      nouvellesFonctionnalites: [{ id: 'N1', dateDeDeploiement: enJanvier }],
    });

    const enFevrier = '2024-02-02';
    depotDonnees.tachesDesServices = async () => [
      { id: 'T1', dateCreation: new Date(enFevrier) },
    ];

    const centre = new CentreNotifications({
      referentiel,
      depotDonnees,
      adaptateurHorloge,
    });

    const notifications = await centre.toutesNotifications('U1');

    expect(notifications[0].id).to.be('T1');
    expect(notifications[1].id).to.be('N1');
  });

  describe('concernant les nouveautés', () => {
    it("retourne les nouveautés, dans l'ordre antéchronologique", async () => {
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
        adaptateurHorloge,
      });

      const notifications = await centreNotifications.toutesNotifications('U1');

      expect(notifications.length).to.be(2);
      expect(notifications[0].id).to.be('N2');
    });

    it("ajoute le statut 'lu' à la notification si elle l'est", async () => {
      let donneesRecues;
      depotDonnees.nouveautesPourUtilisateur = async (idUtilisateur) => {
        donneesRecues = { idUtilisateur };
        return ['N2'];
      };
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
        adaptateurHorloge,
      });

      const notifications = await centreNotifications.toutesNotifications('U1');

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
  });

  describe('sur marquage de nouveauté lue', () => {
    it("jette une erreur si l'identifiant de nouveauté n'est pas présent dans le référentiel", async () => {
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
        adaptateurHorloge,
      });

      try {
        await centreNotifications.marqueNouveauteLue(
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
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
        adaptateurHorloge,
      });

      await centreNotifications.marqueNouveauteLue('U1', 'N1');

      expect(donneesRecues.idUtilisateur).to.be('U1');
      expect(donneesRecues.idNouveaute).to.be('N1');
    });
  });

  describe('concernant les tâches liées aux services', () => {
    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        nouvellesFonctionnalites: [],
        naturesTachesService: { n1: {} },
      });
    });

    const centreDeNotification = () =>
      new CentreNotifications({
        referentiel,
        depotDonnees,
        adaptateurHorloge,
      });

    it('retourne les tâches', async () => {
      depotDonnees.tachesDesServices = async (idUtilisateur) =>
        idUtilisateur === 'U1' ? [{ id: 'T1', nature: 'n1' }] : [];

      const notifs = await centreDeNotification().toutesNotifications('U1');

      expect(notifs.length).to.be(1);
      expect(notifs[0].id).to.be('T1');
      expect(notifs[0].type).to.be('tache');
    });

    it('complète les informations depuis le référentiel', async () => {
      depotDonnees.tachesDesServices = async (_) => [
        { nature: 'niveauRetrograde', service: { nomService: () => '' } },
      ];
      referentiel = Referentiel.creeReferentiel({
        nouvellesFonctionnalites: [],
        naturesTachesService: {
          niveauRetrograde: {
            entete: 'Le besoin de sécurité a été modifié',
            titreCta: 'Voir le changement',
            titre:
              'Votre service [XXX] a désormais des besoins de sécurité modérés.',
          },
        },
      });

      const notifs = await centreDeNotification().toutesNotifications('U1');

      expect(notifs[0].entete).to.be('Le besoin de sécurité a été modifié');
      expect(notifs[0].titreCta).to.be('Voir le changement');
      expect(notifs[0].titre).to.be(
        'Votre service [XXX] a désormais des besoins de sécurité modérés.'
      );
    });

    it('complète le titre avec les informations liées au service', async () => {
      depotDonnees.tachesDesServices = async (_) => [
        {
          titre: '--%NOM_SERVICE%--',
          service: unService(Referentiel.creeReferentielVide())
            .avecNomService('toto')
            .construis(),
        },
      ];

      const notifs = await centreDeNotification().toutesNotifications('U1');

      expect(notifs[0].titre).to.be('--toto--');
    });

    it('complète le titre avec les informations des données de la tâche', async () => {
      depotDonnees.tachesDesServices = async (_) => [
        {
          titre: '--%nouveauxBesoins%--',
          service: { nomService: () => '' },
          donnees: {
            nouveauxBesoins: 'petits',
          },
        },
      ];
      const notifs = await centreDeNotification().toutesNotifications('U1');

      expect(notifs[0].titre).to.be('--petits--');
    });

    it("peut utiliser n'importe quelle donnée de la tâche pour complèter le titre", async () => {
      depotDonnees.tachesDesServices = async (_) => [
        {
          titre: '--%nimportequoi%--',
          service: { nomService: () => '' },
          donnees: {
            nimportequoi: 'nimportequi',
          },
        },
      ];
      const notifs = await centreDeNotification().toutesNotifications('U1');

      expect(notifs[0].titre).to.be('--nimportequi--');
    });
  });

  describe("concernant les tâches liées à l'utilisateur", () => {
    it("utilise le dépôt de données pour récupérer l'utilisateur", async () => {
      let idRecu;
      depotDonnees.utilisateur = async (idUtilisateur) => {
        idRecu = idUtilisateur;
      };
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
        adaptateurHorloge,
      });

      await centreNotifications.toutesNotifications('U1');

      expect(idRecu).to.be('U1');
    });

    it("reste robuste si l'utilisateur est introuvable", async () => {
      depotDonnees.utilisateur = async () => undefined;
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
        adaptateurHorloge,
      });

      const taches = await centreNotifications.toutesNotifications('U1');

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
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
        adaptateurHorloge,
      });

      const taches = await centreNotifications.toutesNotifications('U1');

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
        const centreNotifications = new CentreNotifications({
          referentiel,
          depotDonnees,
          adaptateurHorloge,
        });

        const taches = await centreNotifications.toutesNotifications('U1');

        expect(taches.length).to.be(1);
        expect(taches[0].titre).to.be('Titre tâche');
        expect(taches[0].statutLecture).to.be('nonLue');
      });

      it("reste robuste si les données d'une tâche sont absentes du référentiel", async () => {
        referentiel = Referentiel.creeReferentiel({
          tachesCompletudeProfil: [],
        });
        const centreNotifications = new CentreNotifications({
          referentiel,
          depotDonnees,
          adaptateurHorloge,
        });

        const taches = await centreNotifications.toutesNotifications('U1');

        expect(taches.length).to.be(0);
      });
    });

    describe("lorsque l'utilisateur est invité'", () => {
      it('renvoie uniquement la notification de profil', async () => {
        depotDonnees.utilisateur = async () =>
          unUtilisateur().quiEstInvite().construis();
        referentiel = Referentiel.creeReferentiel({
          tachesCompletudeProfil: [
            { id: 'profil', titre: 'Titre tâche' },
            { id: 'siret', titre: 'Titre tâche' },
          ],
        });
        const centreNotifications = new CentreNotifications({
          referentiel,
          depotDonnees,
          adaptateurHorloge,
        });

        const taches = await centreNotifications.toutesNotifications('U1');

        expect(taches.length).to.be(1);
        expect(taches[0].id).to.be('profil');
      });
    });
  });

  describe('sur demande de toutes les notifications', () => {
    let centreNotifications;

    beforeEach(() => {
      depotDonnees.utilisateur = async () =>
        unUtilisateur().quiSAppelle('Jean Valjean').construis();
      referentiel = Referentiel.creeReferentiel({
        tachesCompletudeProfil: [{ id: 'siret', titre: 'Titre tâche' }],
        nouvellesFonctionnalites: [
          { id: 'N1', dateDeDeploiement: '2024-01-01' },
        ],
      });
      centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
        adaptateurHorloge,
      });
    });

    it('renvoie les tâches en attente en premier, puis les nouveautés', async () => {
      const notifications = await centreNotifications.toutesNotifications('U1');

      expect(notifications.length).to.be(2);
      expect(notifications[0].id).to.be('siret');
      expect(notifications[1].id).to.be('N1');
    });

    it('ajoute le "type" de notifications', async () => {
      const notifications = await centreNotifications.toutesNotifications('U1');

      expect(notifications[0].type).to.be('tache');
      expect(notifications[1].type).to.be('nouveaute');
    });
  });
});
