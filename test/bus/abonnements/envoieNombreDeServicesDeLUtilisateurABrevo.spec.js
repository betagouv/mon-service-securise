const expect = require('expect.js');
const {
  envoieNombreDeServicesDeLUtilisateurABrevo,
} = require('../../../src/bus/abonnements/envoieNombreDeServicesDeLUtilisateurABrevo');
const {
  fabriqueAdaptateurMailMemoire,
} = require('../../../src/adaptateurs/adaptateurMailMemoire');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const {
  uneAutorisation,
} = require('../../constructeurs/constructeurAutorisation');

describe("L'abonnement qui envoie à Brevo le nombre de services auxquels contribue le propriétaire d'un service", () => {
  let adaptateurMail;
  let utilisateur;
  let depotDonnees;

  beforeEach(() => {
    utilisateur = unUtilisateur()
      .avecEmail('jean.dujardin@beta.gouv.com')
      .construis();
    adaptateurMail = fabriqueAdaptateurMailMemoire();
    depotDonnees = {
      autorisations: async () => [],
    };
  });

  it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
    try {
      await envoieNombreDeServicesDeLUtilisateurABrevo({
        adaptateurMail,
        depotDonnees,
      })({
        utilisateur: null,
      });

      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible d'envoyer à Brevo le nombre de services de l'utilisateur sans avoir l'utilisateur en paramètre."
      );
    }
  });

  it('met à jour le contact Brevo avec le nombre de services dont le propriétaire du service est propriétaire ou contributeur', async () => {
    depotDonnees.autorisations = async (idUtilisateur) => [
      uneAutorisation().deProprietaire(idUtilisateur, '1').construis(),
      uneAutorisation().deContributeur(idUtilisateur, '2').construis(),
      uneAutorisation().deProprietaire(idUtilisateur, '3').construis(),
    ];
    let destinataireRecu;
    let donneesRecues;
    adaptateurMail.metAJourDonneesContact = async (destinataire, donnees) => {
      destinataireRecu = destinataire;
      donneesRecues = donnees;
    };

    await envoieNombreDeServicesDeLUtilisateurABrevo({
      adaptateurMail,
      depotDonnees,
    })({
      utilisateur,
    });

    expect(destinataireRecu).to.eql('jean.dujardin@beta.gouv.com');
    expect(donneesRecues.nombreServicesProprietaire).to.eql(2);
    expect(donneesRecues.nombreServicesContributeur).to.eql(1);
  });
});
