const expect = require('expect.js');
const {
  ajoutContributeurSurServices,
} = require('../../../src/modeles/autorisations/ajoutContributeurSurServices');
const { depotVide } = require('../../depots/depotVide');
const {
  fabriqueAdaptateurMailMemoire,
} = require('../../../src/adaptateurs/adaptateurMailMemoire');
const {
  fabriqueAdaptateurTrackingMemoire,
} = require('../../../src/adaptateurs/adaptateurTrackingMemoire');
const { EchecAutorisation } = require('../../../src/erreurs');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const { unService } = require('../../constructeurs/constructeurService');

describe("L'ajout d'un contributeur sur des services", () => {
  const unEmetteur = (idUtilisateur) =>
    unUtilisateur().avecId(idUtilisateur).construis();
  const leService = (id) =>
    unService().avecId(id).avecNomService('Nom Service').construis();

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

  it("vérifie que l'utilisateur a le droit d'ajouter un contributeur à *tous* les services demandés", async () => {
    const autorisationsInterrogees = [];
    depotDonnees.autorisationPour = async (idUtilisateur, idHomologation) => {
      autorisationsInterrogees.push({ idUtilisateur, idHomologation });
      return autorisation;
    };

    await ajoutContributeurSurServices({
      depotDonnees,
      adaptateurMail,
      adaptateurTracking,
    }).executer(
      'jean.dupont@mail.fr',
      [leService('123'), leService('888')],
      unEmetteur('456')
    );

    expect(autorisationsInterrogees).to.eql([
      { idUtilisateur: '456', idHomologation: '123' },
      { idUtilisateur: '456', idHomologation: '888' },
    ]);
  });

  it("lève une exception si l'utilisateur n'a pas le droit d'ajouter un contributeur", async () => {
    autorisation.permissionAjoutContributeur = false;
    depotDonnees.autorisationPour = async () => autorisation;

    try {
      await ajoutContributeurSurServices({
        depotDonnees,
        adaptateurMail,
        adaptateurTracking,
      }).executer('jean.dupont@mail.fr', [leService('123')], unEmetteur());

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
          nbServices
        ) => {
          emailEnvoye = { destinataire, prenomNomEmetteur, nbServices };
        };

        await ajoutContributeurSurServices({
          depotDonnees,
          adaptateurMail,
          adaptateurTracking,
        }).executer(
          'jean.dupont@mail.fr',
          [leService('123'), [leService('888')]],
          unEmetteur()
        );

        expect(emailEnvoye.destinataire).to.be('jean.dupont@mail.fr');
        expect(emailEnvoye.prenomNomEmetteur).to.be(
          'jean.dujardin@beta.gouv.com'
        );
        expect(emailEnvoye.nbServices).to.be(2);
      });
    });

    describe('si le contributeur a déjà été invité sur *tous* les services', () => {
      beforeEach(() => {
        depotDonnees.autorisationExiste = async () => true;
      });

      it("n'envoie aucun email au contributeur", async () => {
        const emailEnvoye = { inscription: false, contribution: false };

        adaptateurMail.envoieMessageInvitationContribution = async () => {
          emailEnvoye.contribution = true;
        };
        adaptateurMail.envoieMessageInvitationInscription = async () => {
          emailEnvoye.inscription = true;
        };

        await ajoutContributeurSurServices({
          depotDonnees,
          adaptateurMail,
          adaptateurTracking,
        }).executer('jean.dupont@mail.fr', [leService('123')], unEmetteur());

        expect(emailEnvoye.inscription).to.be(false);
        expect(emailEnvoye.contribution).to.be(false);
      });
    });
  });

  describe('si le contributeur a déjà été invité sur *certains* services', () => {
    it('ajoute le contributeur seulement sur les services manquants', async () => {
      const existePour123MaisPas888 = async (_, idService) =>
        idService === '123';

      depotDonnees.autorisationExiste = existePour123MaisPas888;

      const autorisations = [];
      depotDonnees.ajouteContributeurAHomologation = async (
        nouvelleAutorisation
      ) => {
        autorisations.push(nouvelleAutorisation);
      };

      const deuxServices = [leService('123'), leService('888')];
      await ajoutContributeurSurServices({
        depotDonnees,
        adaptateurMail,
        adaptateurTracking,
      }).executer('jean.dupont@mail.fr', deuxServices, unEmetteur());

      expect(autorisations.length).to.be(1);
      const [a] = autorisations;
      expect(a.idUtilisateur).to.be('999');
      expect(a.idService).to.be('888');
    });

    it('envoie un email ne mentionnant que les nouveaux services ciblés', async () => {
      const existePour123MaisPas888 = async (_, idService) =>
        idService === '123';
      depotDonnees.autorisationExiste = existePour123MaisPas888;

      let nbServicesMentionnes = 0;
      adaptateurMail.envoieMessageInvitationContribution = async (
        _,
        __,
        nbServices
      ) => {
        nbServicesMentionnes = nbServices;
      };

      const deuxServices = [leService('123'), leService('888')];
      await ajoutContributeurSurServices({
        depotDonnees,
        adaptateurMail,
        adaptateurTracking,
      }).executer('jean.dupont@mail.fr', deuxServices, unEmetteur());

      expect(nbServicesMentionnes).to.be(1);
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

      await ajoutContributeurSurServices({
        depotDonnees,
        adaptateurMail,
        adaptateurTracking,
      }).executer('jean.dupont@mail.fr', [leService('123')], unEmetteur());

      expect(emailAjoute).to.be('jean.dupont@mail.fr');
    });

    it('crée un contact email (qui refuse les emails marketing pour le moment)', async () => {
      let contactCree;
      adaptateurMail.creeContact = async (
        destinataire,
        prenom,
        nom,
        bloqueEmails,
        bloqueMarketing
      ) => {
        contactCree = {
          destinataire,
          prenom,
          nom,
          bloqueEmails,
          bloqueMarketing,
        };
      };

      await ajoutContributeurSurServices({
        depotDonnees,
        adaptateurMail,
        adaptateurTracking,
      }).executer('jean.dupont@mail.fr', [leService('123')], unEmetteur());

      expect(contactCree.destinataire).to.be('jean.dupont@mail.fr');
      expect(contactCree.prenom).to.be('');
      expect(contactCree.nom).to.be('');
      expect(contactCree.bloqueEmails).to.be(true);
      expect(contactCree.bloqueMarketing).to.be(true);
    });

    it("envoie un mail d'invitation au contributeur créé", async () => {
      let emailEnvoye;

      adaptateurMail.envoieMessageInvitationInscription = async (
        destinataire,
        prenomNomEmetteur,
        idResetMotDePasse,
        nbServices
      ) => {
        emailEnvoye = {
          destinataire,
          prenomNomEmetteur,
          idResetMotDePasse,
          nbServices,
        };
      };

      await ajoutContributeurSurServices({
        depotDonnees,
        adaptateurMail,
        adaptateurTracking,
      }).executer(
        'jean.dupont@mail.fr',
        [leService('123'), leService('888')],
        unEmetteur()
      );

      expect(emailEnvoye.destinataire).to.be('jean.dupont@mail.fr');
      expect(emailEnvoye.prenomNomEmetteur).to.be(
        'jean.dujardin@beta.gouv.com'
      );
      expect(emailEnvoye.idResetMotDePasse).to.be('reset');
      expect(emailEnvoye.nbServices).to.be(2);
    });
  });

  it("demande au dépôt de données d'ajouter les autorisations", async () => {
    const autorisations = [];
    depotDonnees.ajouteContributeurAHomologation = async (
      nouvelleAutorisation
    ) => {
      autorisations.push(nouvelleAutorisation);
    };

    await ajoutContributeurSurServices({
      depotDonnees,
      adaptateurMail,
      adaptateurTracking,
    }).executer(
      'jean.dupont@mail.fr',
      [leService('123'), leService('888')],
      unEmetteur()
    );

    expect(autorisations.length).to.be(2);
    const [a1, a2] = autorisations;
    expect(a1.idUtilisateur).to.be('999');
    expect(a1.idService).to.be('123');
    expect(a2.idUtilisateur).to.be('999');
    expect(a2.idService).to.be('888');
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

    await ajoutContributeurSurServices({
      depotDonnees,
      adaptateurMail,
      adaptateurTracking,
    }).executer('contributeur@mail.fr', [leService('123')], unEmetteur('888'));

    expect(idEmetteur).to.be('888');
    expect(donneesTracking).to.eql({
      destinataire: 'jean.dujardin@beta.gouv.com',
      donneesEvenement: { nombreMoyenContributeurs: 3 },
    });
  });
});
