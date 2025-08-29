import expect from 'expect.js';
import { modifieLienEntrepriseEtContactBrevo } from '../../../src/bus/abonnements/modifieLienEntrepriseEtContactBrevo.js';

describe("L'abonnement aui modifie le lien entre une entreprise et un contact dans Brevo", () => {
  let crmBrevo;
  beforeEach(() => {
    crmBrevo = {
      creerLienEntrepriseContact: async () => ({}),
      supprimerLienEntrepriseContact: async () => ({}),
    };
  });

  it('délègue au CRM Brevo la suppression du lien existant entre utilisateur et entreprise', async () => {
    let utilisateurRecu;
    crmBrevo.supprimerLienEntrepriseContact = async (utilisateur) => {
      utilisateurRecu = utilisateur;
    };
    const utilisateur = { id: '123' };

    await modifieLienEntrepriseEtContactBrevo({ crmBrevo })({ utilisateur });

    expect(utilisateurRecu.id).to.eql('123');
  });

  it('délègue au CRM Brevo la création du lien entre utilisateur et entreprise', async () => {
    let utilisateurRecu;
    crmBrevo.creerLienEntrepriseContact = async (utilisateur) => {
      utilisateurRecu = utilisateur;
    };
    const utilisateur = { id: '123' };

    await modifieLienEntrepriseEtContactBrevo({ crmBrevo })({ utilisateur });

    expect(utilisateurRecu.id).to.eql('123');
  });
});
