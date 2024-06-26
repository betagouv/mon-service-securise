const expect = require('expect.js');
const CrmBrevo = require('../../src/crm/crmBrevo');
const {
  fabriqueAdaptateurMailMemoire,
} = require('../../src/adaptateurs/adaptateurMailMemoire');
const fauxAdaptateurRechercheEntreprise = require('../mocks/adaptateurRechercheEntreprise');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');
const {
  uneAutorisation,
} = require('../constructeurs/constructeurAutorisation');

describe('Le CRM Brevo', () => {
  let adaptateurMail;
  let adaptateurRechercheEntreprise;
  let crmBrevo;

  beforeEach(() => {
    adaptateurMail = fabriqueAdaptateurMailMemoire();
    adaptateurRechercheEntreprise = fauxAdaptateurRechercheEntreprise();
    crmBrevo = new CrmBrevo({
      adaptateurRechercheEntreprise,
      adaptateurMail,
    });
  });

  it("jette une erreur s'il n'est pas instancié avec les bons adaptateurs", () => {
    expect(() => new CrmBrevo({})).to.throwError((e) => {
      expect(e.message).to.be(
        "Impossible d'instancier le CRM sans adaptateurs"
      );
    });
  });
  describe('sur demande de création du lien entre un utilisateur et son entreprise', () => {
    it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
      try {
        await crmBrevo.creerLienEntrepriseContact(null);

        expect().fail("L'instanciation aurait dû lever une exception.");
      } catch (e) {
        expect(e.message).to.be(
          "Impossible de relier une entreprise et un contact sans avoir l'utilisateur en paramètre."
        );
      }
    });

    it("ne fait rien si l'utilisateur n'a pas de SIRET", async () => {
      let adaptateurAppele = false;

      adaptateurMail.recupereIdentifiantContact = async () => {
        adaptateurAppele = true;
      };

      const utilisateur = unUtilisateur()
        .quiTravaillePourUneEntiteAvecSiret('')
        .construis();

      await crmBrevo.creerLienEntrepriseContact(utilisateur);

      expect(adaptateurAppele).to.be(false);
    });

    describe("si l'utilisateur a un SIRET", () => {
      let utilisateur;

      beforeEach(() => {
        utilisateur = unUtilisateur()
          .avecEmail('jean.dujardin@beta.gouv.com')
          .quiTravaillePourUneEntiteAvecSiret('1234')
          .avecNomEntite('MonServiceSécurisé')
          .construis();
        adaptateurMail.recupereIdentifiantContact = async () => 'C1';
      });

      it("recupère l'identifiant Brevo de l'utilisateur via son email", async () => {
        let emailRecu;

        adaptateurMail.recupereIdentifiantContact = async (email) => {
          emailRecu = email;
        };

        await crmBrevo.creerLienEntrepriseContact(utilisateur);

        expect(emailRecu).to.be('jean.dujardin@beta.gouv.com');
      });

      it("vérifie si l'entreprise existe déjà sur Brevo via son SIRET", async () => {
        let siretRecu;

        adaptateurMail.recupereEntreprise = async (siret) => {
          siretRecu = siret;
        };

        await crmBrevo.creerLienEntrepriseContact(utilisateur);

        expect(siretRecu).to.be('1234');
      });

      describe("si l'entreprise n'existe pas", () => {
        it("créé l'entreprise", async () => {
          let donneesRecuesCreationEntreprise;

          adaptateurRechercheEntreprise.recupereDetailsOrganisation =
            async () => ({
              natureJuridique: 'NatureJuridique',
            });
          adaptateurMail.recupereEntreprise = async () => null;
          adaptateurMail.creeEntreprise = async (
            siret,
            nom,
            natureJuridique
          ) => {
            donneesRecuesCreationEntreprise = { siret, nom, natureJuridique };
            return 'E1';
          };

          await crmBrevo.creerLienEntrepriseContact(utilisateur);

          expect(donneesRecuesCreationEntreprise).to.eql({
            siret: '1234',
            nom: 'MonServiceSécurisé',
            natureJuridique: 'NatureJuridique',
          });
        });
      });

      it("relie l'utilisateur à l'entreprise", async () => {
        let donneesRecues;

        adaptateurMail.recupereEntreprise = async () => 'E1';
        adaptateurMail.relieContactAEntreprise = async (
          idContact,
          idEntreprise
        ) => {
          donneesRecues = { idContact, idEntreprise };
        };

        await crmBrevo.creerLienEntrepriseContact(utilisateur);

        expect(donneesRecues.idContact).to.be('C1');
        expect(donneesRecues.idEntreprise).to.be('E1');
      });
    });
  });
  describe('sur demande de suppression de lien entre un utilisateur et son entreprise', () => {
    let utilisateur;

    beforeEach(() => {
      utilisateur = unUtilisateur()
        .avecEmail('jean.dujardin@beta.gouv.com')
        .construis();
    });
    it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
      try {
        await crmBrevo.supprimerLienEntrepriseContact(null);

        expect().fail("L'instanciation aurait dû lever une exception.");
      } catch (e) {
        expect(e.message).to.be(
          "Impossible de relier une entreprise et un contact sans avoir l'utilisateur en paramètre."
        );
      }
    });
    it("recupère l'identifiant Brevo de l'utilisateur via son email", async () => {
      let emailRecu;
      adaptateurMail.recupereIdentifiantContact = async (email) => {
        emailRecu = email;
      };

      await crmBrevo.supprimerLienEntrepriseContact(utilisateur);

      expect(emailRecu).to.be('jean.dujardin@beta.gouv.com');
    });
    it("recupère l'entreprise liée à l'utilisateur", async () => {
      let idRecu;
      adaptateurMail.recupereIdentifiantContact = async () => 'C1';
      adaptateurMail.recupereEntrepriseDuContact = async (id) => {
        idRecu = id;
      };

      await crmBrevo.supprimerLienEntrepriseContact(utilisateur);

      expect(idRecu).to.be('C1');
    });
    it("supprime le lien s'il existe", async () => {
      let idEntrepriseRecu;
      let idContactRecu;
      adaptateurMail.recupereIdentifiantContact = async () => 'C1';
      adaptateurMail.recupereEntrepriseDuContact = async () => 'E1';
      adaptateurMail.supprimeLienEntreContactEtEntreprise = async (
        idContact,
        idEntreprise
      ) => {
        idContactRecu = idContact;
        idEntrepriseRecu = idEntreprise;
      };

      await crmBrevo.supprimerLienEntrepriseContact(utilisateur);

      expect(idContactRecu).to.be('C1');
      expect(idEntrepriseRecu).to.be('E1');
    });
    it('ne supprime pas de lien inexistant', async () => {
      let suppressionAppelee = false;
      adaptateurMail.recupereIdentifiantContact = async () => 'C1';
      adaptateurMail.recupereEntrepriseDuContact = async () => undefined;
      adaptateurMail.supprimeLienEntreContactEtEntreprise = async () => {
        suppressionAppelee = true;
      };

      await crmBrevo.supprimerLienEntrepriseContact(utilisateur);

      expect(suppressionAppelee).to.be(false);
    });
  });

  describe('sur demande de mise à jour du nombre de contributions du contact', () => {
    const utilisateur = unUtilisateur()
      .avecEmail('jean.valjean@beta.gouv.fr')
      .construis();

    it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
      try {
        await crmBrevo.metAJourNombresContributionsContact(null, []);

        expect().fail("L'instanciation aurait dû lever une exception.");
      } catch (e) {
        expect(e.message).to.be(
          "Impossible d'envoyer à Brevo le nombre de services de l'utilisateur sans avoir l'utilisateur en paramètre."
        );
      }
    });

    it("lève une exception s'il ne reçoit pas d'autorisations", async () => {
      try {
        await crmBrevo.metAJourNombresContributionsContact(utilisateur, null);

        expect().fail("L'instanciation aurait dû lever une exception.");
      } catch (e) {
        expect(e.message).to.be(
          "Impossible d'envoyer à Brevo le nombre de services de l'utilisateur sans avoir les autorisations en paramètre."
        );
      }
    });

    it('met à jour le contact Brevo avec le nombre de services dont le propriétaire du service est propriétaire ou contributeur', async () => {
      const autorisations = [
        uneAutorisation().deProprietaire(utilisateur.id, '1').construis(),
        uneAutorisation().deContributeur(utilisateur.id, '2').construis(),
        uneAutorisation().deProprietaire(utilisateur.id, '3').construis(),
      ];
      let destinataireRecu;
      let donneesRecues;
      adaptateurMail.metAJourDonneesContact = async (destinataire, donnees) => {
        destinataireRecu = destinataire;
        donneesRecues = donnees;
      };

      await crmBrevo.metAJourNombresContributionsContact(
        utilisateur,
        autorisations
      );

      expect(destinataireRecu).to.eql('jean.valjean@beta.gouv.fr');
      expect(donneesRecues.sync_mss_nb_services_proprietaire).to.eql(2);
      expect(donneesRecues.sync_mss_nb_services_contributeur).to.eql(1);
    });
  });

  describe("sur demande de mise à jour de l'estimation du nombre de services du contact", () => {
    const utilisateur = unUtilisateur()
      .avecEmail('jean.valjean@beta.gouv.fr')
      .avecEstimationNombreServices(1, 10)
      .construis();

    it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
      try {
        await crmBrevo.metAJourEstimationNombreServicesContact(null);

        expect().fail("L'instanciation aurait dû lever une exception.");
      } catch (e) {
        expect(e.message).to.be(
          "Impossible d'envoyer à Brevo l'estimation du nombre de services de l'utilisateur sans avoir l'utilisateur en paramètre."
        );
      }
    });

    it("ne fait rien si l'utilisateur n'a pas d'estimation de nombre de services, en cas d'invitation", async () => {
      const utilisateurSansEstimation = unUtilisateur()
        .avecEmail('jean.valjean@beta.gouv.fr')
        .construis();
      utilisateurSansEstimation.estimationNombreServices = undefined;

      let adaptateurAppele = false;
      adaptateurMail.metAJourDonneesContact = async () => {
        adaptateurAppele = true;
      };

      await crmBrevo.metAJourEstimationNombreServicesContact(
        utilisateurSansEstimation
      );

      expect(adaptateurAppele).to.be(false);
    });

    it('met à jour le contact Brevo avec son estimation du nombre de services', async () => {
      let destinataireRecu;
      let donneesRecues;
      adaptateurMail.metAJourDonneesContact = async (destinataire, donnees) => {
        destinataireRecu = destinataire;
        donneesRecues = donnees;
      };

      await crmBrevo.metAJourEstimationNombreServicesContact(utilisateur);

      expect(destinataireRecu).to.eql('jean.valjean@beta.gouv.fr');
      expect(donneesRecues.sync_mss_estimation_nb_services_borne_basse).to.eql(
        1
      );
      expect(donneesRecues.sync_mss_estimation_nb_services_borne_haute).to.eql(
        10
      );
    });
  });

  describe('sur demande de mise à jour du contact', () => {
    const utilisateur = unUtilisateur()
      .quiSAppelle('Jean Valjean')
      .avecEmail('jean.valjean@beta.gouv.fr')
      .avecTelephone('0100000000')
      .construis();

    it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
      try {
        await crmBrevo.metAJourProfilContact(null);

        expect().fail("L'instanciation aurait dû lever une exception.");
      } catch (e) {
        expect(e.message).to.be(
          "Impossible de mettre à jour le contact sans l'utilisateur en paramètre."
        );
      }
    });

    it('met à jour les nom, prenom et téléphone du contact Brevo', async () => {
      let destinataireRecu;
      let prenomRecu;
      let nomRecu;
      let telephoneRecu;
      adaptateurMail.metAJourContact = async (
        destinataire,
        prenom,
        nom,
        telephone
      ) => {
        destinataireRecu = destinataire;
        prenomRecu = prenom;
        nomRecu = nom;
        telephoneRecu = telephone;
      };

      await crmBrevo.metAJourProfilContact(utilisateur);

      expect(destinataireRecu).to.eql('jean.valjean@beta.gouv.fr');
      expect(prenomRecu).to.eql('Jean');
      expect(nomRecu).to.eql('Valjean');
      expect(telephoneRecu).to.eql('0100000000');
    });
  });
});
