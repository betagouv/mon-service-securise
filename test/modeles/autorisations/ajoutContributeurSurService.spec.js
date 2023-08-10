const expect = require('expect.js');
const {
  ajoutContributeurSurService,
} = require('../../../src/modeles/autorisations/ajoutContributeurSurService');
const { depotVide } = require('../../depots/depotVide');
const {
  fabriqueAdaptateurMailMemoire,
} = require('../../../src/adaptateurs/adaptateurMailMemoire');
const {
  fabriqueAdaptateurTrackingMemoire,
} = require('../../../src/adaptateurs/adaptateurTrackingMemoire');
const {
  ErreurAutorisationExisteDeja,
  EchecAutorisation,
} = require('../../../src/erreurs');

describe("L'ajout d'un contributeur sur un service", () => {
  const autorisation = { id: '111' };
  const utilisateur = {
    id: '999',
    genereToken: () => 'un token',
    accepteCGU: () => true,
  };

  let depotDonnees;
  let adaptateurMail;
  let adaptateurTracking;

  beforeEach(async () => {
    autorisation.permissionAjoutContributeur = true;

    depotDonnees = await depotVide();
    depotDonnees.autorisationExiste = async () => false;
    depotDonnees.autorisationPour = async () => autorisation;
    depotDonnees.utilisateurAvecEmail = async () => utilisateur;
    depotDonnees.ajouteContributeurAHomologation = async () => {};

    const utilisateurCourant = { prenomNom: () => '' };
    depotDonnees.utilisateur = async () => utilisateurCourant;

    const homologation = { nomService: () => '' };
    depotDonnees.homologation = async () => homologation;

    adaptateurMail = fabriqueAdaptateurMailMemoire();
    adaptateurMail.envoieMessageInvitationContribution = async () => {};

    adaptateurTracking = fabriqueAdaptateurTrackingMemoire();
  });

  it("vérifie que l'utilisateur a le droit d'ajouter un contributeur", async () => {
    let autorisationInterrogee = false;
    depotDonnees.autorisationPour = async (idUtilisateur, idHomologation) => {
      autorisationInterrogee = { idUtilisateur, idHomologation };
      return autorisation;
    };

    await ajoutContributeurSurService({
      depotDonnees,
      adaptateurMail,
      adaptateurTracking,
    }).executer('456', 'jean.dupont@mail.fr', '123');

    expect(autorisationInterrogee.idUtilisateur).to.be('456');
    expect(autorisationInterrogee.idHomologation).to.be('123');
  });

  it("lève une exception si l'utilisateur n'a pas le droit d'ajouter un contributeur", async () => {
    autorisation.permissionAjoutContributeur = false;
    depotDonnees.autorisationPour = async () => autorisation;

    try {
      await ajoutContributeurSurService({
        depotDonnees,
        adaptateurMail,
        adaptateurTracking,
      }).executer('', 'jean.dupont@mail.fr', '123');

      expect().to.fail("L'ajout aurait dû lever une exception");
    } catch (e) {
      expect(e).to.be.an(EchecAutorisation);
    }
  });

  describe('si le contributeur existe déjà', () => {
    beforeEach(() => {
      const contributeur = { email: 'jean.dupont@mail.fr' };
      const utilisateurCourant = { prenomNom: () => 'Utilisateur Courant' };
      const homologation = { id: '123', nomService: () => 'Nom Service' };

      depotDonnees.utilisateurAvecEmail = async () => contributeur;
      depotDonnees.utilisateur = async () => utilisateurCourant;
      depotDonnees.homologation = async () => homologation;
    });

    describe("si le contributeur n'a pas déjà été invité", () => {
      it('envoie un email de notification au contributeur', async () => {
        let emailEnvoye = false;
        adaptateurMail.envoieMessageInvitationContribution = async (
          destinataire,
          prenomNomEmetteur,
          nomService,
          idHomologation
        ) => {
          emailEnvoye = {
            destinataire,
            prenomNomEmetteur,
            nomService,
            idHomologation,
          };
        };

        await ajoutContributeurSurService({
          depotDonnees,
          adaptateurMail,
          adaptateurTracking,
        }).executer('', 'jean.dupont@mail.fr', '123');

        expect(emailEnvoye.destinataire).to.be('jean.dupont@mail.fr');
        expect(emailEnvoye.prenomNomEmetteur).to.be('Utilisateur Courant');
        expect(emailEnvoye.nomService).to.be('Nom Service');
        expect(emailEnvoye.idHomologation).to.be('123');
      });
    });

    describe('si le contributeur a déjà été invité', () => {
      beforeEach(() => {
        depotDonnees.autorisationExiste = async () => true;
      });

      it("n'envoie pas d'email d'invitation à contribuer", async () => {
        let emailEnvoye = false;

        adaptateurMail.envoieMessageInvitationContribution = async () => {
          emailEnvoye = true;
        };

        try {
          await ajoutContributeurSurService({
            depotDonnees,
            adaptateurMail,
            adaptateurTracking,
          }).executer('', 'jean.dupont@mail.fr', '123');

          expect().to.fail('Le serveur aurait dû lever une exception');
        } catch (e) {
          expect(emailEnvoye).to.be(false);
        }
      });

      it("n'envoie pas d'email d'invitation à s'inscrire", async () => {
        let emailEnvoye = false;

        adaptateurMail.envoieMessageInvitationInscription = async () => {
          emailEnvoye = true;
        };

        try {
          await ajoutContributeurSurService({
            depotDonnees,
            adaptateurMail,
            adaptateurTracking,
          }).executer('', 'jean.dupont@mail.fr', '123');

          expect().to.fail('Le serveur aurait dû lever une exception');
        } catch (e) {
          expect(emailEnvoye).to.be(false);
        }
      });

      it("renvoie une erreur explicite à propos de l'invitation déjà envoyée", async () => {
        try {
          await ajoutContributeurSurService({
            depotDonnees,
            adaptateurMail,
            adaptateurTracking,
          }).executer('', 'jean.dupont@mail.fr', '123');

          expect().to.fail('Le serveur aurait dû lever une exception');
        } catch (e) {
          expect(e).to.be.an(ErreurAutorisationExisteDeja);
        }
      });
    });
  });

  describe("si le contributeur n'existe pas déjà", () => {
    let contributeurCree;

    beforeEach(() => {
      let utilisateurInexistant;
      depotDonnees.utilisateurAvecEmail = async () => utilisateurInexistant;
      contributeurCree = {
        id: '789',
        email: 'jean.dupont@mail.fr',
        idResetMotDePasse: 'reset',
      };
      depotDonnees.nouvelUtilisateur = async () => contributeurCree;
    });

    it('demande au dépôt de le créer', async () => {
      let emailAjoute;

      depotDonnees.nouvelUtilisateur = async (donneesUtilisateur) => {
        emailAjoute = donneesUtilisateur.email;
        return {
          id: '789',
          email: 'jean.dupont@mail.fr',
          idResetMotDePasse: 'reset',
        };
      };

      await ajoutContributeurSurService({
        depotDonnees,
        adaptateurMail,
        adaptateurTracking,
      }).executer('', 'jean.dupont@mail.fr', '123');

      expect(emailAjoute).to.be('jean.dupont@mail.fr');
    });

    it('crée un contact email', async () => {
      let contactCree;
      adaptateurMail.creeContact = async (
        destinataire,
        prenom,
        nom,
        bloqueEmails
      ) => {
        contactCree = { destinataire, prenom, nom, bloqueEmails };
      };

      await ajoutContributeurSurService({
        depotDonnees,
        adaptateurMail,
        adaptateurTracking,
      }).executer('', 'jean.dupont@mail.fr', '123');

      expect(contactCree.destinataire).to.be('jean.dupont@mail.fr');
      expect(contactCree.prenom).to.be('');
      expect(contactCree.nom).to.be('');
      expect(contactCree.bloqueEmails).to.be(true);
    });

    it("envoie un mail d'invitation au contributeur créé", async () => {
      let idEmetteur;
      let idService;
      let emailEnvoye;

      depotDonnees.utilisateur = async (id) => {
        idEmetteur = id;
        return { prenomNom: () => 'Utilisateur Courant' };
      };

      depotDonnees.homologation = async (id) => {
        idService = id;
        return { nomService: () => 'Nom Service' };
      };

      adaptateurMail.envoieMessageInvitationInscription = async (
        destinataire,
        prenomNomEmetteur,
        nomService,
        idResetMotDePasse
      ) => {
        emailEnvoye = {
          destinataire,
          prenomNomEmetteur,
          nomService,
          idResetMotDePasse,
        };
      };

      await ajoutContributeurSurService({
        depotDonnees,
        adaptateurMail,
        adaptateurTracking,
      }).executer('888', 'jean.dupont@mail.fr', '123');

      expect(idEmetteur).to.be('888');
      expect(idService).to.be('123');
      expect(emailEnvoye.destinataire).to.be('jean.dupont@mail.fr');
      expect(emailEnvoye.prenomNomEmetteur).to.be('Utilisateur Courant');
      expect(emailEnvoye.nomService).to.be('Nom Service');
      expect(emailEnvoye.idResetMotDePasse).to.be('reset');
    });
  });

  it("demande au dépôt de données d'ajouter l'autorisation", async () => {
    let nouvelleAutorisation;
    depotDonnees.ajouteContributeurAHomologation = async (
      idContributeur,
      idHomologation
    ) => {
      nouvelleAutorisation = { idContributeur, idHomologation };
    };

    await ajoutContributeurSurService({
      depotDonnees,
      adaptateurMail,
      adaptateurTracking,
    }).executer('', 'jean.dupont@mail.fr', '123');

    expect(nouvelleAutorisation.idContributeur).to.be('999');
  });

  it("envoie un événement d'invitation contributeur via l'adaptateur de tracking", async () => {
    let idEmetteur;
    let donneesTracking;

    depotDonnees.homologations = async (idUtilisateur) => {
      idEmetteur = idUtilisateur;
      const serviceBouchon3Contributeurs = { contributeurs: ['a', 'b', 'c'] };
      return [serviceBouchon3Contributeurs];
    };

    adaptateurTracking.envoieTrackingInvitationContributeur = async (
      destinataire,
      donneesEvenement
    ) => {
      donneesTracking = { destinataire, donneesEvenement };
    };

    await ajoutContributeurSurService({
      depotDonnees,
      adaptateurMail,
      adaptateurTracking,
    }).executer('888', 'jean.dupont@mail.fr', '123');

    expect(idEmetteur).to.be('888');
    expect(donneesTracking).to.eql({
      destinataire: 'jean.dupont@mail.fr',
      donneesEvenement: { nombreMoyenContributeurs: 3 },
    });
  });
});
