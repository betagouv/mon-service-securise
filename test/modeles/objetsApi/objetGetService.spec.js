const expect = require('expect.js');

const objetGetService = require('../../../src/modeles/objetsApi/objetGetService');
const Referentiel = require('../../../src/referentiel');
const {
  uneAutorisation,
} = require('../../constructeurs/constructeurAutorisation');
const {
  Rubriques: { HOMOLOGUER },
  Permissions: { LECTURE },
  Rubriques,
  Permissions,
} = require('../../../src/modeles/autorisations/gestionDroits');
const { unService } = require('../../constructeurs/constructeurService');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const { unDossier } = require('../../constructeurs/constructeurDossier');

describe("L'objet d'API de `GET /service`", () => {
  const referentiel = Referentiel.creeReferentiel({
    statutsHomologation: {
      nonRealisee: { libelle: 'Non réalisée', ordre: 1 },
    },
    echeancesRenouvellement: { unAn: {} },
    statutsAvisDossierHomologation: { favorable: {} },
    etapesParcoursHomologation: [
      {
        numero: 1,
        libelle: 'Autorité',
        id: 'autorite',
      },
    ],
    naturesSuggestionsActions: {
      'siret-a-renseigner': {
        lien: '/service',
        permissionRequise: { rubrique: 'DECRIRE', niveau: 2 },
      },
    },
  });
  const lectureSurHomologuer = uneAutorisation()
    .avecDroits({ [HOMOLOGUER]: LECTURE })
    .construis();

  const service = unService(referentiel)
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
    .avecDossiers([
      unDossier(referentiel).quiEstComplet().quiEstNonFinalise().donnees,
    ])
    .avecSuggestionAction({ nature: 'siret-a-renseigner' })
    .construis();

  it('fournit les données nécessaires', () => {
    expect(
      objetGetService.donnees(service, lectureSurHomologuer, referentiel)
    ).to.eql({
      id: '123',
      nomService: 'Un service',
      organisationResponsable: 'Une organisation',
      statutSaisieDescription: 'aCompleter',
      contributeurs: [
        {
          id: 'A',
          prenomNom: 'Jean Dupont',
          initiales: 'JD',
          poste: 'RSSI',
          estUtilisateurCourant: false,
        },
        {
          id: 'B',
          prenomNom: 'Pierre Lecoux',
          initiales: 'PL',
          poste: 'Maire',
          estUtilisateurCourant: false,
        },
      ],
      statutHomologation: {
        enCoursEdition: true,
        etapeCourante: 'autorite',
        libelle: 'Non réalisée',
        id: 'nonRealisee',
        ordre: 1,
      },
      nombreContributeurs: 1 + 1,
      estProprietaire: false,
      documentsPdfDisponibles: [],
      permissions: { gestionContributeurs: false },
      suggestionActionPrioritaire: {
        nature: 'siret-a-renseigner',
        lien: '/service',
        permissionRequise: {
          rubrique: Rubriques.DECRIRE,
          niveau: Permissions.ECRITURE,
        },
      },
    });
  });

  it("masque le statut d'homologation si l'utilisateur n'a pas la permission", () => {
    const autorisationSansHomologuer = uneAutorisation()
      .avecDroits({})
      .construis();
    const donnees = objetGetService.donnees(
      service,
      autorisationSansHomologuer,
      referentiel
    );
    expect(donnees.statutHomologation).to.be(undefined);
  });

  it("montre la dernière étape disponible si l'utilisateur n'a pas le droit d'homologuer", () => {
    const referentielDeuxEtapes = Referentiel.creeReferentiel({
      echeancesRenouvellement: { unAn: {} },
      statutsAvisDossierHomologation: { favorable: {} },
      statutsHomologation: {
        nonRealisee: { libelle: 'Non réalisée', ordre: 1 },
      },
      etapesParcoursHomologation: [
        { numero: 1, libelle: 'Autorité', id: 'autorite' },
        {
          numero: 2,
          libelle: 'Avis',
          id: 'avis',
          reserveePeutHomologuer: true,
        },
      ],
    });

    const serviceAvecDossierFinalise = unService(referentielDeuxEtapes)
      .avecId('123')
      .avecDossiers([
        unDossier(referentiel).quiEstComplet().quiEstNonFinalise().donnees,
      ])
      .construis();

    const donnees = objetGetService.donnees(
      serviceAvecDossierFinalise,
      lectureSurHomologuer,
      referentielDeuxEtapes
    );
    expect(donnees.statutHomologation.etapeCourante).to.be('autorite');
  });

  describe('sur demande des permissions', () => {
    it("autorise la gestion de contributeurs si l'utilisateur est propriétaire", () => {
      const unServiceDontAestCreateur = unService()
        .avecId('123')
        .avecNomService('Un service')
        .ajouteUnContributeur(
          unUtilisateur().avecId('A').avecEmail('email.proprietaire@mail.fr')
            .donnees
        )
        .construis();

      expect(
        objetGetService.donnees(
          unServiceDontAestCreateur,
          uneAutorisation().deProprietaire('A', '123').construis(),
          referentiel
        ).permissions
      ).to.eql({ gestionContributeurs: true });
    });

    it("n'autorise pas la gestion de contributeurs si l'utilisateur n'a pas les droits requis", () => {
      const unServiceDontAestCreateur = unService()
        .avecId('123')
        .avecNomService('Un service')
        .ajouteUnContributeur(
          unUtilisateur().avecId('A').avecEmail('email.proprietaire@mail.fr')
            .donnees
        )
        .construis();
      expect(
        objetGetService.donnees(
          unServiceDontAestCreateur,
          lectureSurHomologuer,
          referentiel
        ).permissions
      ).to.eql({ gestionContributeurs: false });
    });
  });
});
