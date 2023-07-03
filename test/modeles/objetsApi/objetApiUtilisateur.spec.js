const expect = require('expect.js');

const Utilisateur = require('../../../src/modeles/utilisateur');
const {
  enUtilisateurApi,
} = require('../../../src/modeles/objetsApi/objetApiUtilisateur');

describe("La représentation API d'un Utilisateur", () => {
  it('est un objet de données', () => {
    const utilisateur = new Utilisateur({
      id: '123',
      prenom: 'Jean',
      nom: 'Dupont',
      email: 'jean.dupont@mail.fr',
      telephone: '0100000000',
      motDePasse: 'XXX',
      poste: 'Maire',
      rssi: true,
      delegueProtectionDonnees: false,
      nomEntitePublique: 'Ville de Paris',
      departementEntitePublique: '75',
      infolettreAcceptee: true,
    });

    const donneesApi = enUtilisateurApi(utilisateur);

    expect(donneesApi).to.eql({
      id: '123',
      cguAcceptees: false,
      prenom: 'Jean',
      nom: 'Dupont',
      prenomNom: 'Jean Dupont',
      telephone: '0100000000',
      initiales: 'JD',
      poste: 'Maire',
      posteDetaille: 'RSSI et Maire',
      rssi: true,
      delegueProtectionDonnees: false,
      nomEntitePublique: 'Ville de Paris',
      departementEntitePublique: '75',
      profilEstComplet: true,
      infolettreAcceptee: true,
    });
  });
});
