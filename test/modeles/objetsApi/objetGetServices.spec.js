const expect = require('expect.js');

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
const { unService } = require('../../constructeurs/constructeurService');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');

const { HOMOLOGUER } = Rubriques;
const { LECTURE } = Permissions;

describe("L'objet d'API de `GET /services`", () => {
  const referentiel = Referentiel.creeReferentiel({
    statutsHomologation: {
      nonRealisee: { libelle: 'Non réalisée', ordre: 1 },
    },
  });

  const service = unService()
    .avecId('123')
    .avecNomService('Un service')
    .avecOrganisationResponsable({ nom: 'Une organisation' })
    .ajouteUnContributeur(
      unUtilisateur()
        .avecId('A')
        .avecEmail('email.proprietaire@mail.fr')
        .quiSAppelle('Jean Dupont')
        .avecPostes(['RSSI']).donnees
    )
    .ajouteUnContributeur(
      unUtilisateur()
        .avecId('B')
        .avecEmail('email.contributeur1@mail.fr')
        .quiSAppelle('Pierre Lecoux')
        .avecPostes(['Maire']).donnees
    )
    .construis();

  const unAutreService = unService()
    .avecId('456')
    .avecNomService('Un autre service')
    .construis();

  const unTroisiemeService = unService()
    .avecId('789')
    .avecNomService('Un troisième service')
    .construis();

  it('fournit les données des services', () => {
    const autorisationComplete = uneAutorisation()
      .deProprietaire('A', '123')
      .construis();

    const { services } = objetGetServices.donnees(
      [service],
      [autorisationComplete],
      referentiel
    );
    expect(services.length).to.be(1);
    expect(services[0].id).to.be('123');
  });

  it('fournit les données de résumé des services', () => {
    service.dossiers.statutHomologation = () => Dossiers.EXPIREE;
    unAutreService.dossiers.statutHomologation = () => Dossiers.ACTIVEE;
    unTroisiemeService.dossiers.statutHomologation = () =>
      Dossiers.BIENTOT_EXPIREE;

    const autorisationPourUnService = uneAutorisation()
      .deProprietaire('999', service.id)
      .avecDroits({
        [HOMOLOGUER]: LECTURE,
      })
      .construis();

    const autorisationPourUnAutreService = uneAutorisation()
      .deProprietaire('999', unAutreService.id)
      .avecDroits({
        [HOMOLOGUER]: LECTURE,
      })
      .construis();

    const autorisationPourUnTroisiemeService = uneAutorisation()
      .deProprietaire('999', unTroisiemeService.id)
      .avecDroits({
        [HOMOLOGUER]: LECTURE,
      })
      .construis();

    const services = [service, unAutreService, unTroisiemeService];
    expect(
      objetGetServices.donnees(
        services,
        [
          autorisationPourUnService,
          autorisationPourUnAutreService,
          autorisationPourUnTroisiemeService,
        ],
        referentiel
      ).resume
    ).to.eql({
      nombreServices: 3,
      nombreServicesHomologues: 2,
      nombreHomologationsExpirees: 1,
    });
  });

  it("ne considère pas les services dont le statut d'homologation est masqué pour l'utilisateur pour le calcul du nombre de services homologués", () => {
    service.dossiers.statutHomologation = () => Dossiers.ACTIVEE;
    unAutreService.dossiers.statutHomologation = () => Dossiers.ACTIVEE;

    const autorisationPourUnService = uneAutorisation()
      .deContributeur('999', '123')
      .avecDroits({
        [HOMOLOGUER]: LECTURE,
      })
      .construis();

    const autorisationSansHomologuerPourUnAutreService = uneAutorisation()
      .deContributeur('999', '456')
      .avecDroits({})
      .construis();

    const services = [service, unAutreService];
    const donnees = objetGetServices.donnees(
      services,
      [autorisationPourUnService, autorisationSansHomologuerPourUnAutreService],
      referentiel
    );
    expect(donnees.resume.nombreServices).to.equal(2);
    expect(donnees.resume.nombreServicesHomologues).to.equal(1);
  });

  it("ne considère pas les services dont le statut d'homologation est masqué pour l'utilisateur pour le calcul du nombre de services expirés", () => {
    unAutreService.dossiers.statutHomologation = () => Dossiers.EXPIREE;

    const autorisationSansHomologuerPourUnAutreService = uneAutorisation()
      .deContributeur('999', '456')
      .avecDroits({})
      .construis();

    const services = [unAutreService];
    const donnees = objetGetServices.donnees(
      services,
      [autorisationSansHomologuerPourUnAutreService],
      referentiel
    );
    expect(donnees.resume.nombreServices).to.equal(1);
    expect(donnees.resume.nombreHomologationsExpirees).to.equal(0);
  });
});
