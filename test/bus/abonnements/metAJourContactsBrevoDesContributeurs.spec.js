const expect = require('expect.js');
const {
  metAJourContactsBrevoDesContributeurs,
} = require('../../../src/bus/abonnements/metAJourContactsBrevoDesContributeurs');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const {
  uneAutorisation,
} = require('../../constructeurs/constructeurAutorisation');

describe("L'abonnement qui met à jour les contacts Brevo des contributeurs", () => {
  let utilisateur;
  let utilisateur2;
  let depotDonnees;
  let crmBrevo;

  beforeEach(() => {
    utilisateur = unUtilisateur()
      .avecId('1')
      .avecEmail('jean.dujardin@beta.gouv.com')
      .construis();
    utilisateur2 = unUtilisateur()
      .avecId('2')
      .avecEmail('jean.dujardin2@beta.gouv.com')
      .construis();
    depotDonnees = {
      autorisations: async () => [],
      utilisateur: async () => {},
    };
    crmBrevo = {
      metAJourContact: async () => {},
    };
  });
  it("lève une exception s'il ne reçoit pas d'autorisation en paramètre", async () => {
    try {
      await metAJourContactsBrevoDesContributeurs({
        crmBrevo,
        depotDonnees,
      })({
        autorisations: null,
      });

      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible d'envoyer à Brevo le nombre de services des contributeurs sans avoir les autorisations en paramètre."
      );
    }
  });

  it('met à jour les contacts Brevo avec le nombre de services de chaque contributeur', async () => {
    const autorisationsUtilisateur1 = [
      uneAutorisation().deProprietaire('1', '1').construis(),
      uneAutorisation().deContributeur('1', '2').construis(),
      uneAutorisation().deProprietaire('1', '3').construis(),
    ];
    const autorisationsUtilisateur2 = [
      uneAutorisation().deContributeur('2', '1').construis(),
    ];
    depotDonnees.autorisations = async (idUtilisateur) =>
      idUtilisateur === '1'
        ? autorisationsUtilisateur1
        : autorisationsUtilisateur2;
    depotDonnees.utilisateur = async (idUtilisateur) =>
      idUtilisateur === '1' ? utilisateur : utilisateur2;
    const utilisateurRecu = [];
    const autorisationsRecues = [];
    crmBrevo.metAJourContact = async (u, a) => {
      utilisateurRecu.push(u);
      autorisationsRecues.push(a);
    };

    await metAJourContactsBrevoDesContributeurs({
      crmBrevo,
      depotDonnees,
    })({
      autorisations: [{ idUtilisateur: '1' }, { idUtilisateur: '2' }],
    });

    expect(utilisateurRecu[0]).to.eql(utilisateur);
    expect(utilisateurRecu[1]).to.eql(utilisateur2);
    expect(autorisationsRecues[0]).to.eql(autorisationsUtilisateur1);
    expect(autorisationsRecues[1]).to.eql(autorisationsUtilisateur2);
  });

  it('reste robuste si un des appels échoue', async () => {
    depotDonnees.utilisateur = async (idUtilisateur) => {
      if (idUtilisateur === '1') {
        return utilisateur;
      }
      throw new Error('oups');
    };
    const utilisateurRecu = [];
    crmBrevo.metAJourContact = async (u) => {
      utilisateurRecu.push(u);
    };

    await metAJourContactsBrevoDesContributeurs({
      crmBrevo,
      depotDonnees,
    })({
      autorisations: [{ idUtilisateur: '1' }, { idUtilisateur: '2' }],
    });

    expect(utilisateurRecu.length).to.equal(1);
    expect(utilisateurRecu[0]).to.eql(utilisateur);
  });
});
