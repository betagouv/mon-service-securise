const expect = require('expect.js');
const {
  relieEntrepriseEtContactBrevo,
} = require('../../../src/bus/abonnements/relieEntrepriseEtContactBrevo');
const {
  fabriqueAdaptateurMailMemoire,
} = require('../../../src/adaptateurs/adaptateurMailMemoire');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const fauxAdaptateurRechercheEntreprise = require('../../mocks/adaptateurRechercheEntreprise');

describe("L'abonnement relie une entreprise et un contact dans Brevo", () => {
  let adaptateurMail;
  let adaptateurRechercheEntreprise;

  beforeEach(() => {
    adaptateurMail = fabriqueAdaptateurMailMemoire();
    adaptateurRechercheEntreprise = fauxAdaptateurRechercheEntreprise();
  });

  it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
    try {
      await relieEntrepriseEtContactBrevo({
        adaptateurMail,
        adaptateurRechercheEntreprise,
      })({
        utilisateur: null,
      });
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

    await relieEntrepriseEtContactBrevo({
      adaptateurMail,
      adaptateurRechercheEntreprise,
    })({
      utilisateur,
    });
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

      await relieEntrepriseEtContactBrevo({
        adaptateurMail,
        adaptateurRechercheEntreprise,
      })({
        utilisateur,
      });
      expect(emailRecu).to.be('jean.dujardin@beta.gouv.com');
    });

    it("vérifie si l'entreprise existe déjà sur Brevo via son SIRET", async () => {
      let siretRecu;

      adaptateurMail.recupereEntreprise = async (siret) => {
        siretRecu = siret;
      };

      await relieEntrepriseEtContactBrevo({
        adaptateurMail,
        adaptateurRechercheEntreprise,
      })({
        utilisateur,
      });
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
        adaptateurMail.creeEntreprise = async (siret, nom, natureJuridique) => {
          donneesRecuesCreationEntreprise = { siret, nom, natureJuridique };
          return 'E1';
        };

        await relieEntrepriseEtContactBrevo({
          adaptateurMail,
          adaptateurRechercheEntreprise,
        })({
          utilisateur,
        });
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

      await relieEntrepriseEtContactBrevo({ adaptateurMail })({
        utilisateur,
      });
      expect(donneesRecues.idContact).to.be('C1');
      expect(donneesRecues.idEntreprise).to.be('E1');
    });
  });
});
