const expect = require('expect.js');
const {
  relieEntrepriseEtContactBrevo,
} = require('../../../src/bus/abonnements/relieEntrepriseEtContactBrevo');

describe("L'abonnement relie une entreprise et un contact dans Brevo", () => {
  it('délègue au CRM Brevo la création du lien entre utilisateur et entreprise', async () => {
    let utilisateurRecu;
    const crmBrevo = {
      creerLienEntrepriseContact: async (utilisateur) => {
        utilisateurRecu = utilisateur;
      },
    };
    const utilisateur = { id: '123' };

    await relieEntrepriseEtContactBrevo({ crmBrevo })({ utilisateur });

    expect(utilisateurRecu.id).to.eql('123');
  });
});
