const expect = require('expect.js');

const Service = require('../../../src/modeles/service');
const vueEspacePersonnel = require('../../../src/modeles/objetsApi/objetGetServices');

describe("L'objet d'API de `GET /services`", () => {
  const unService = new Service({
    id: '123',
    descriptionService: { nomService: 'Un service', organisationsResponsables: ['Une organisation'] },
    createur: { id: 'A', email: 'email.createur@mail.fr', prenom: 'Jacques' },
    contributeurs: [
      { id: 'B', email: 'email.contributeur1@mail.fr', prenom: 'Jean' },
    ],
  });
  unService.indiceCyber = () => ({ total: 3.51 });

  it('fournit les données nécessaires', () => {
    const services = [unService];
    expect(vueEspacePersonnel.donnees(services)).to.eql(
      {
        services: [
          {
            id: '123',
            nomService: 'Un service',
            organisationsResponsables: ['Une organisation'],
            createur: { id: 'A', prenomNom: 'Jacques', initiales: 'J' },
            contributeurs: [
              { id: 'B', prenomNom: 'Jean', initiales: 'J', cguAcceptees: false },
            ],
            indiceCyber: 3.5,
            statutHomologation: 'aSaisir',
          }],
      }
    );
  });
});
