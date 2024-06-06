const expect = require('expect.js');
const CentreNotifications = require('../../src/notifications/centreNotifications');
const Referentiel = require('../../src/referentiel');
const { creeDepot } = require('../../src/depotDonnees');
const { ErreurIdentifiantNouveauteInconnu } = require('../../src/erreurs');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');

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

  describe('sur demande des nouveautés', () => {
    it("retourne les nouveautés, dans l'ordre antéchronologique", async () => {
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
      });

      const notifications = await centreNotifications.toutesNouveautes('U1');

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
      });

      const notifications = await centreNotifications.toutesNouveautes('U1');

      expect(donneesRecues.idUtilisateur).to.be('U1');

      expect(notifications[0].id).to.be('N2');
      expect(notifications[0].statutLecture).to.be('lue');
      expect(notifications[1].id).to.be('N1');
      expect(notifications[1].statutLecture).to.be('nonLue');
    });
  });

  describe('sur marquage de nouveauté lue', () => {
    it("jette une erreur si l'identifiant de nouveauté n'est pas présent dans le référentiel", async () => {
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
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
      });

      await centreNotifications.marqueNouveauteLue('U1', 'N1');

      expect(donneesRecues.idUtilisateur).to.be('U1');
      expect(donneesRecues.idNouveaute).to.be('N1');
    });
  });

  describe('sur demande des tâches en attente', () => {
    it("utilise le dépôt de données pour récupérer l'utilisateur", async () => {
      let idRecu;
      depotDonnees.utilisateur = async (idUtilisateur) => {
        idRecu = idUtilisateur;
      };
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
      });

      await centreNotifications.toutesTachesEnAttente('U1');

      expect(idRecu).to.be('U1');
    });

    it("reste robuste si l'utilisateur est introuvable", async () => {
      depotDonnees.utilisateur = async () => undefined;
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
      });

      const taches = await centreNotifications.toutesTachesEnAttente('U1');

      expect(taches).to.be.an(Array);
    });

    it("renvoie un tableau vide si le profil de l'utilisateur est complet", async () => {
      depotDonnees.utilisateur = async () =>
        unUtilisateur()
          .quiSAppelle('Jean Valjean')
          .quiTravaillePourUneEntiteAvecSiret('12345')
          .construis();
      const centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
      });

      const taches = await centreNotifications.toutesTachesEnAttente('U1');

      expect(taches.length).to.be(0);
    });

    describe("lorsque le nom de l'utilisateur est manquant", () => {
      beforeEach(() => {
        depotDonnees.utilisateur = async () =>
          unUtilisateur()
            .quiTravaillePourUneEntiteAvecSiret('12345')
            .construis();
      });

      it('renvoie la notification correspondant au champ non renseigné du profil', async () => {
        referentiel = Referentiel.creeReferentiel({
          tachesCompletudeProfil: [{ id: 'nom', titre: 'Titre tâche' }],
        });
        const centreNotifications = new CentreNotifications({
          referentiel,
          depotDonnees,
        });

        const taches = await centreNotifications.toutesTachesEnAttente('U1');

        expect(taches.length).to.be(1);
        expect(taches[0].titre).to.be('Titre tâche');
      });

      it("reste robuste si les données d'une tâche sont absentes du référentiel", async () => {
        referentiel = Referentiel.creeReferentiel({
          tachesCompletudeProfil: [],
        });
        const centreNotifications = new CentreNotifications({
          referentiel,
          depotDonnees,
        });

        const taches = await centreNotifications.toutesTachesEnAttente('U1');

        expect(taches.length).to.be(0);
      });
    });
  });

  describe('sur demande de toutes les notifications', () => {
    let centreNotifications;

    beforeEach(() => {
      depotDonnees.utilisateur = async () =>
        unUtilisateur().quiTravaillePourUneEntiteAvecSiret('12345').construis();
      referentiel = Referentiel.creeReferentiel({
        tachesCompletudeProfil: [{ id: 'nom', titre: 'Titre tâche' }],
        nouvellesFonctionnalites: [
          { id: 'N1', dateDeDeploiement: '2024-01-01' },
        ],
      });
      centreNotifications = new CentreNotifications({
        referentiel,
        depotDonnees,
      });
    });

    it('renvoie les tâches en attente en premier, puis les nouveautés', async () => {
      const notifications = await centreNotifications.toutesNotifications('U1');

      expect(notifications.length).to.be(2);
      expect(notifications[0].id).to.be('nom');
      expect(notifications[1].id).to.be('N1');
    });

    it('ajoute le "type" de notifications', async () => {
      const notifications = await centreNotifications.toutesNotifications('U1');

      expect(notifications[0].type).to.be('tache');
      expect(notifications[1].type).to.be('nouveaute');
    });
  });
});
