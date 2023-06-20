const expect = require('expect.js');

const Service = require('../../../src/modeles/service');
const objetGetServices = require('../../../src/modeles/objetsApi/objetGetServices');
const Referentiel = require('../../../src/referentiel');

describe("L'objet d'API de `GET /services`", () => {
  const referentiel = Referentiel.creeReferentiel({
    statutsHomologation: {
      aRealiser: { libelle: 'À réaliser', ordre: 1 },
    },
  });

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
    expect(
      objetGetServices.donnees(services, 'A', referentiel).services
    ).to.eql([
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
        statutHomologation: {
          libelle: 'À réaliser',
          id: 'aRealiser',
          ordre: 1,
        },
        nombreContributeurs: 1 + 1,
        estCreateur: true,
        documentsPdfDisponibles: ['annexes', 'syntheseSecurite'],
        permissions: {
          suppressionContributeur: true,
        },
      },
    ]);
  });

  it('fournit les données de résumé des services', () => {
    unAutreService.dossiers.statutSaisie = () => 'completes';

    const services = [unService, unAutreService];
    expect(objetGetServices.donnees(services, 'A', referentiel).resume).to.eql({
      nombreServices: 2,
      nombreServicesHomologues: 1,
    });
  });

  describe('sur demande des permissions', () => {
    it("autorise la suppression de contributeur si l'utilisateur est créateur", () => {
      const unServiceDontAestCreateur = new Service({
        id: '123',
        descriptionService: { nomService: 'Un service' },
        createur: { id: 'A', email: 'email.createur@mail.fr' },
      });
      const services = [unServiceDontAestCreateur];
      expect(
        objetGetServices.donnees(services, 'A', referentiel).services[0]
          .permissions
      ).to.eql({
        suppressionContributeur: true,
      });
    });

    it("n'autorise pas la suppression de contributeur si l'utilisateur est contributeur", () => {
      const unServiceDontAestCreateur = new Service({
        id: '123',
        descriptionService: { nomService: 'Un service' },
        createur: { id: 'A', email: 'email.createur@mail.fr' },
      });
      const idUtilisateur = 'un autre ID';
      const services = [unServiceDontAestCreateur];
      expect(
        objetGetServices.donnees(services, idUtilisateur, referentiel)
          .services[0].permissions
      ).to.eql({
        suppressionContributeur: false,
      });
    });
  });
});
