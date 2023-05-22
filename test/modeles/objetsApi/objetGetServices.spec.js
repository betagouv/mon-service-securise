const expect = require('expect.js');

const Service = require('../../../src/modeles/service');
const objetGetServices = require('../../../src/modeles/objetsApi/objetGetServices');
const { unDossier } = require('../../constructeurs/constructeurDossier');

describe("L'objet d'API de `GET /services`", () => {
  const unService = new Service({
    id: '123',
    descriptionService: {
      nomService: 'Un service',
      organisationsResponsables: ['Une organisation'],
    },
    createur: {
      id: 'A',
      email: 'email.createur@mail.fr',
      prenom: 'Jacques',
      poste: 'RSSI',
    },
    contributeurs: [
      {
        id: 'B',
        email: 'email.contributeur1@mail.fr',
        prenom: 'Jean',
        poste: 'Maire',
      },
    ],
  });
  unService.dossierCourant = () => unDossier().construit();

  const unAutreService = new Service({
    id: '456',
    descriptionService: {
      nomService: 'Un autre service',
      organisationsResponsables: ['Une organisation'],
    },
    createur: { id: 'A', email: 'email.createur@mail.fr', prenom: 'Jacques' },
    contributeurs: [
      { id: 'B', email: 'email.contributeur1@mail.fr', prenom: 'Jean' },
    ],
  });

  it('fournit les données nécessaires', () => {
    const services = [unService];
    expect(objetGetServices.donnees(services, 'A').services).to.eql([
      {
        id: '123',
        nomService: 'Un service',
        organisationsResponsables: ['Une organisation'],
        createur: {
          id: 'A',
          prenomNom: 'Jacques',
          initiales: 'J',
          poste: 'RSSI',
        },
        contributeurs: [
          {
            id: 'B',
            prenomNom: 'Jean',
            initiales: 'J',
            cguAcceptees: false,
            poste: 'Maire',
          },
        ],
        statutHomologation: { libelle: 'À réaliser', id: 'aSaisir' },
        nombreContributeurs: 1 + 1,
        estCreateur: true,
        documentsPdfDisponibles: [
          'annexes',
          'syntheseSecurite',
          'dossierDecision',
        ],
      },
    ]);
  });

  it('fournit les données de résumé des services', () => {
    unAutreService.dossiers.statutSaisie = () => 'completes';

    const services = [unService, unAutreService];
    expect(objetGetServices.donnees(services, 'A').resume).to.eql({
      nombreServices: 2,
      nombreServicesHomologues: 1,
    });
  });
});
