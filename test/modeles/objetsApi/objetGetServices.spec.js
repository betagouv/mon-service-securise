const expect = require('expect.js');

const Service = require('../../../src/modeles/service');
const vueEspacePersonnel = require('../../../src/modeles/objetsApi/objetGetServices');

describe("L'objet d'API de `GET /services`", () => {
  const unService = new Service({
    id: '123',
    descriptionService: { nomService: 'Un service', organisationsResponsables: ['Une organisation'] },
    createur: { email: 'email.createur@mail.fr', prenom: 'Jacques' },
    contributeurs: [
      { email: 'email.contributeur1@mail.fr', prenom: 'Jean' },
      { email: 'email.contributeur2@mail.fr', prenom: 'Jean II' },
    ],
  });

  it('fournit les données nécessaires', () => {
    const services = [unService];
    expect(vueEspacePersonnel.donnees(services)).to.eql(
      {
        services: [
          {
            id: '123',
            nomService: 'Un service',
            contributeurs: [
              {
                cguAcceptees: false,
                delegueProtectionDonnees: false,
                departementEntitePublique: '',
                id: undefined,
                initiales: 'J',
                nomEntitePublique: '',
                poste: '',
                prenomNom: 'Jean',
                profilEstComplet: false,
                rssi: false,
                telephone: '',
              },
              {
                cguAcceptees: false,
                delegueProtectionDonnees: false,
                departementEntitePublique: '',
                id: undefined,
                initiales: 'J',
                nomEntitePublique: '',
                poste: '',
                prenomNom: 'Jean II',
                profilEstComplet: false,
                rssi: false,
                telephone: '',
              },
            ],
            createur: {
              cguAcceptees: false,
              delegueProtectionDonnees: false,
              departementEntitePublique: '',
              id: undefined,
              initiales: 'J',
              nomEntitePublique: '',
              poste: '',
              prenomNom: 'Jacques',
              profilEstComplet: false,
              rssi: false,
              telephone: '',
            },
          }],
      }
    );
  });
});
