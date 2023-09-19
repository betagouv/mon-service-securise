const expect = require('expect.js');

const Service = require('../../../src/modeles/service');
const objetGetServices = require('../../../src/modeles/objetsApi/objetGetServices');
const Referentiel = require('../../../src/referentiel');
const Dossiers = require('../../../src/modeles/dossiers');
const {
  uneAutorisation,
} = require('../../constructeurs/constructeurAutorisation');
const {
  Rubriques,
  Permissions,
} = require('../../../src/modeles/autorisations/gestionDroits');

const { HOMOLOGUER } = Rubriques;
const { LECTURE } = Permissions;

describe("L'objet d'API de `GET /services`", () => {
  const referentiel = Referentiel.creeReferentiel({
    statutsHomologation: {
      nonRealisee: { libelle: 'Non réalisée', ordre: 1 },
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
      postes: ['RSSI'],
    },
    contributeurs: [
      {
        id: 'B',
        email: 'email.contributeur1@mail.fr',
        prenom: 'Jean',
        postes: ['Maire'],
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
    const autorisationComplete = uneAutorisation()
      .deCreateurDeService('456', '123')
      .avecDroits({
        [HOMOLOGUER]: LECTURE,
      })
      .construis();
    expect(
      objetGetServices.donnees(
        services,
        [autorisationComplete],
        'A',
        referentiel
      ).services
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
            poste: 'Maire',
          },
        ],
        statutHomologation: {
          enCoursEdition: false,
          libelle: 'Non réalisée',
          id: 'nonRealisee',
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
    unService.dossiers.statutHomologation = () => Dossiers.BIENTOT_EXPIREE;
    unAutreService.dossiers.statutHomologation = () => Dossiers.ACTIVEE;

    const autorisationPourUnService = uneAutorisation()
      .deCreateurDeService('999', unService.id)
      .avecDroits({
        [HOMOLOGUER]: LECTURE,
      })
      .construis();

    const autorisationPourUnAutreService = uneAutorisation()
      .deCreateurDeService('999', unAutreService.id)
      .avecDroits({
        [HOMOLOGUER]: LECTURE,
      })
      .construis();

    const services = [unService, unAutreService];
    expect(
      objetGetServices.donnees(
        services,
        [autorisationPourUnService, autorisationPourUnAutreService],
        'A',
        referentiel
      ).resume
    ).to.eql({
      nombreServices: 2,
      nombreServicesHomologues: 2,
    });
  });

  it("ne considère pas les services dont le statut d'homologation est masqué pour le calcul du nombre de services homologués", () => {
    unService.dossiers.statutHomologation = () => Dossiers.ACTIVEE;
    unAutreService.dossiers.statutHomologation = () => Dossiers.ACTIVEE;

    const autorisationPourUnService = uneAutorisation()
      .deCreateurDeService('999', '123')
      .avecDroits({
        [HOMOLOGUER]: LECTURE,
      })
      .construis();

    const autorisationSansHomologuerPourUnAutreService = uneAutorisation()
      .deCreateurDeService('999', '456')
      .avecDroits({})
      .construis();

    const services = [unService, unAutreService];
    const donnees = objetGetServices.donnees(
      services,
      [autorisationPourUnService, autorisationSansHomologuerPourUnAutreService],
      'A',
      referentiel
    );
    expect(donnees.resume.nombreServices).to.equal(2);
    expect(donnees.resume.nombreServicesHomologues).to.equal(1);
  });
});
