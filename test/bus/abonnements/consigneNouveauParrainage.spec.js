const expect = require('expect.js');
const {
  consigneNouveauParrainage,
} = require('../../../src/bus/abonnements/consigneNouveauParrainage');
const EvenementInvitationUtilisateurEnvoyee = require('../../../src/bus/evenementInvitationUtilisateurEnvoyee');

describe('L’abonnement qui consigne les nouveaux parrainages', () => {
  it('utilise le dépôt sauvegarder le parrainage', async () => {
    let donneesRecues;
    const depotDonnees = {
      ajouteParrainage: (donnees) => {
        donneesRecues = donnees;
      },
    };

    const abonnement = consigneNouveauParrainage({ depotDonnees });
    await abonnement(
      new EvenementInvitationUtilisateurEnvoyee({
        idUtilisateurDestinataire: 'D1',
        idUtilisateurEmetteur: 'E1',
      })
    );

    expect(donneesRecues.idUtilisateurFilleul).to.be('D1');
    expect(donneesRecues.idUtilisateurParrain).to.be('E1');
    expect(donneesRecues.filleulAFinaliseCompte).to.be(false);
  });
});
