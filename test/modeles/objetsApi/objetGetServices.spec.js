const expect = require('expect.js');

const Service = require('../../../src/modeles/service');
const objetGetServices = require('../../../src/modeles/objetsApi/objetGetServices');

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

  const unAutreService = new Service({
    id: '456',
    descriptionService: { nomService: 'Un autre service', organisationsResponsables: ['Une organisation'] },
    createur: { id: 'A', email: 'email.createur@mail.fr', prenom: 'Jacques' },
    contributeurs: [
      { id: 'B', email: 'email.contributeur1@mail.fr', prenom: 'Jean' },
    ],
  });

  it('fournit les données nécessaires', () => {
    const services = [unService];
    expect(objetGetServices.donnees(services, 'A').services).to.eql(
      [{
        id: '123',
        nomService: 'Un service',
        organisationsResponsables: ['Une organisation'],
        createur: { id: 'A', prenomNom: 'Jacques', initiales: 'J' },
        contributeurs: [
          { id: 'B', prenomNom: 'Jean', initiales: 'J', cguAcceptees: false },
        ],
        indiceCyber: 3.5,
        statutHomologation: { libelle: 'À réaliser', id: 'aSaisir' },
        nombreContributeurs: 1 + 1,
        estCreateur: true,
      }],
    );
  });

  it('fournit les données de résumé des services', () => {
    unService.indiceCyber = () => ({ total: 4 });
    unAutreService.dossiers.statutSaisie = () => 'completes';
    unAutreService.indiceCyber = () => ({ total: 5 });

    const services = [unService, unAutreService];
    expect(objetGetServices.donnees(services).resume).to.eql(
      {
        nombreServices: 2,
        nombreServicesHomologues: 1,
        indiceCyberMoyen: 4.5,
      }
    );
  });

  it('ne compte pas les indice cyber nuls pour calculer la moyenne', () => {
    unService.indiceCyber = () => ({ total: 4 });
    unAutreService.indiceCyber = () => ({ total: 0 });

    const services = [unService, unAutreService];
    expect(objetGetServices.donnees(services).resume).to.eql(
      {
        nombreServices: 2,
        nombreServicesHomologues: 1,
        indiceCyberMoyen: 4,
      }
    );
  });
});
