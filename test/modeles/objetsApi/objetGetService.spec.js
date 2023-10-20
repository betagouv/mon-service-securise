const expect = require('expect.js');

const objetGetService = require('../../../src/modeles/objetsApi/objetGetService');
const Referentiel = require('../../../src/referentiel');
const {
  uneAutorisation,
} = require('../../constructeurs/constructeurAutorisation');
const {
  Rubriques: { HOMOLOGUER },
  Permissions: { LECTURE },
} = require('../../../src/modeles/autorisations/gestionDroits');
const { unService } = require('../../constructeurs/constructeurService');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');

describe("L'objet d'API de `GET /service`", () => {
  const referentiel = Referentiel.creeReferentiel({
    statutsHomologation: {
      nonRealisee: { libelle: 'Non réalisée', ordre: 1 },
    },
  });
  const lectureSurHomologuer = uneAutorisation()
    .avecDroits({ [HOMOLOGUER]: LECTURE })
    .construis();

  const service = unService()
    .avecId('123')
    .avecNomService('Un service')
    .avecOrganisationResponsable('Une organisation')
    .ajouteUnProprietaire(
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

  it('fournit les données nécessaires', () => {
    expect(
      objetGetService.donnees(service, lectureSurHomologuer, 'A', referentiel)
    ).to.eql({
      id: '123',
      nomService: 'Un service',
      organisationsResponsables: ['Une organisation'],
      contributeurs: [
        {
          id: 'A',
          prenomNom: 'Jean Dupont',
          initiales: 'JD',
          poste: 'RSSI',
          estProprietaire: true,
        },
        {
          id: 'B',
          prenomNom: 'Pierre Lecoux',
          initiales: 'PL',
          poste: 'Maire',
          estProprietaire: false,
        },
      ],
      statutHomologation: {
        enCoursEdition: false,
        libelle: 'Non réalisée',
        id: 'nonRealisee',
        ordre: 1,
      },
      nombreContributeurs: 1 + 1,
      estProprietaire: true,
      documentsPdfDisponibles: [],
      permissions: { gestionContributeurs: false },
    });
  });

  it("masque le statut d'homologation si l'utilisateur n'a pas la permission", () => {
    const autorisationSansHomologuer = uneAutorisation()
      .avecDroits({})
      .construis();
    const donnees = objetGetService.donnees(
      service,
      autorisationSansHomologuer,
      'A',
      referentiel
    );
    expect(donnees.statutHomologation).to.be(undefined);
  });

  describe('sur demande des permissions', () => {
    it("autorise la gestion de contributeurs si l'utilisateur est propriétaire", () => {
      const unServiceDontAestCreateur = unService()
        .avecId('123')
        .avecNomService('Un service')
        .ajouteUnProprietaire(
          unUtilisateur().avecId('A').avecEmail('email.proprietaire@mail.fr')
            .donnees
        )
        .construis();

      expect(
        objetGetService.donnees(
          unServiceDontAestCreateur,
          uneAutorisation().deCreateurDeService('A', '123').construis(),
          'A',
          referentiel
        ).permissions
      ).to.eql({ gestionContributeurs: true });
    });

    it("n'autorise pas la gestion de contributeurs si l'utilisateur est contributeur", () => {
      const unServiceDontAestCreateur = unService()
        .avecId('123')
        .avecNomService('Un service')
        .ajouteUnProprietaire(
          unUtilisateur().avecId('A').avecEmail('email.proprietaire@mail.fr')
            .donnees
        )
        .construis();
      const idUtilisateur = 'un autre ID';
      expect(
        objetGetService.donnees(
          unServiceDontAestCreateur,
          lectureSurHomologuer,
          idUtilisateur,
          referentiel
        ).permissions
      ).to.eql({ gestionContributeurs: false });
    });
  });
});
