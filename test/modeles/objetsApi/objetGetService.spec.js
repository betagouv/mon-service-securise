import expect from 'expect.js';
import * as objetGetService from '../../../src/modeles/objetsApi/objetGetService.js';
import * as Referentiel from '../../../src/referentiel.js';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import {
  unService,
  unServiceV2,
} from '../../constructeurs/constructeurService.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { unDossier } from '../../constructeurs/constructeurDossier.js';
import { dateEnFrancais } from '../../../src/utilitaires/date.js';
import Mesures from '../../../src/modeles/mesures.js';

const { HOMOLOGUER, DECRIRE, SECURISER } = Rubriques;
const { LECTURE, ECRITURE } = Permissions;

const unAdaptateurEnvironnement = ({
  avecSupportCommissionPptx = false,
} = {}) => ({
  featureFlag: () => ({
    avecSupportCommissionPptx: () => avecSupportCommissionPptx,
  }),
});

describe("L'objet d'API de `GET /service`", () => {
  const referentiel = Referentiel.creeReferentiel({
    statutsHomologation: { nonRealisee: { libelle: 'Non réalisée', ordre: 1 } },
    echeancesRenouvellement: {
      unAn: { nbMoisDecalage: 12, nbMoisBientotExpire: 3 },
    },
    statutsAvisDossierHomologation: { favorable: {} },
    etapesParcoursHomologation: [
      { numero: 1, libelle: 'Autorité', id: 'autorite' },
    ],
    naturesSuggestionsActions: {
      'siret-a-renseigner': {
        lien: '/service',
        permissionRequise: { rubrique: 'DECRIRE', niveau: 2 },
      },
    },
    categoriesMesures: { gouvernance: {} },
    statutsMesures: { fait: {}, enCours: {}, nonFait: {} },
    mesures: { mesureA: {} },
  });
  const autorisation = uneAutorisation()
    .avecDroits({
      [HOMOLOGUER]: LECTURE,
      [DECRIRE]: ECRITURE,
      [SECURISER]: ECRITURE,
    })
    .construis();

  const service = unService(referentiel)
    .avecId('123')
    .avecNomService('Un service')
    .avecOrganisationResponsable({ nom: 'Une organisation', siret: 'SIRET' })
    .ajouteUnContributeur({
      ...unUtilisateur()
        .avecId('A')
        .avecEmail('email.proprietaire@mail.fr')
        .quiSAppelle('Jean Dupont')
        .avecPostes(['RSSI']).donnees,
      estProprietaire: false,
      estAdmin: false,
      estSuperviseur: false,
    })
    .ajouteUnContributeur({
      ...unUtilisateur()
        .avecId('B')
        .avecEmail('email.contributeur1@mail.fr')
        .quiSAppelle('Pierre Lecoux')
        .avecPostes(['Maire']).donnees,
      estProprietaire: true,
      estAdmin: false,
      estSuperviseur: false,
    })
    .avecDossiers([
      unDossier(referentiel).quiEstComplet().quiEstNonFinalise().donnees,
    ])
    .avecMesures(
      new Mesures(
        { mesuresGenerales: [{ id: 'mesureA', statut: 'fait' }] },
        referentiel,
        {
          mesureA: { categorie: 'gouvernance' },
          mesureB: { categorie: 'gouvernance' },
        }
      )
    )
    .avecSuggestionAction({ nature: 'siret-a-renseigner' })
    .construis();

  it('fournit les données nécessaires', () => {
    expect(
      objetGetService.donnees(
        service,
        autorisation,
        referentiel,
        unAdaptateurEnvironnement()
      )
    ).to.eql({
      id: '123',
      nomService: 'Un service',
      organisationResponsable: 'Une organisation',
      siretOrganisationResponsable: 'SIRET',
      contributeurs: [
        {
          id: 'A',
          prenomNom: 'Jean Dupont',
          initiales: 'JD',
          poste: 'RSSI',
          estUtilisateurCourant: false,
          estProprietaire: false,
          estAdmin: false,
          estSuperviseur: false,
        },
        {
          id: 'B',
          prenomNom: 'Pierre Lecoux',
          initiales: 'PL',
          poste: 'Maire',
          estUtilisateurCourant: false,
          estProprietaire: true,
          estAdmin: false,
          estSuperviseur: false,
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
      estAdmin: false,
      estSuperviseur: false,
      documentsPdfDisponibles: ['syntheseSecurite'],
      supportCommissionPptxDisponible: false,
      permissions: { gestionContributeurs: false },
      aUneSuggestionAction: true,
      actionRecommandee: { id: 'simulerReferentielV2', autorisee: true },
      niveauSecurite: 'niveau1',
      pourcentageCompletude: 0.5,
      version: 'v1',
    });
  });

  describe('concernant le support de commission PowerPoint', () => {
    const serviceV2AvecDossierEnCours = () =>
      unServiceV2()
        .avecDossiers([unDossier(referentiel).donnees])
        .construis();

    it('indique qu’il est disponible quand la fonctionnalité est active et que le service le permet', () => {
      const donnees = objetGetService.donnees(
        serviceV2AvecDossierEnCours(),
        autorisation,
        referentiel,
        unAdaptateurEnvironnement({ avecSupportCommissionPptx: true })
      );

      expect(donnees.supportCommissionPptxDisponible).to.be(true);
    });

    it('indique qu’il n’est pas disponible quand la fonctionnalité n’est pas active', () => {
      const donnees = objetGetService.donnees(
        serviceV2AvecDossierEnCours(),
        autorisation,
        referentiel,
        unAdaptateurEnvironnement()
      );

      expect(donnees.supportCommissionPptxDisponible).to.be(false);
    });
  });

  it("ajoute la date d'expiration du dossier en cours lorsqu'il est bientôt expiré", () => {
    const unServiceAvecDossierBientotExpire = unService(referentiel)
      .avecDossiers([
        unDossier(referentiel).quiEstComplet().quiVaExpirer(3, 'unAn').donnees,
      ])
      .construis();

    const donnees = objetGetService.donnees(
      unServiceAvecDossierBientotExpire,
      autorisation,
      referentiel,
      unAdaptateurEnvironnement()
    );

    const dans3jours = dateEnFrancais(
      new Date().setDate(new Date().getDate() + 3)
    );
    expect(donnees.statutHomologation.dateExpiration).to.equal(dans3jours);
  });

  it("masque le statut d'homologation si l'utilisateur n'a pas la permission", () => {
    const autorisationSansHomologuer = uneAutorisation()
      .avecDroits({})
      .construis();

    const donnees = objetGetService.donnees(
      service,
      autorisationSansHomologuer,
      referentiel,
      unAdaptateurEnvironnement()
    );

    expect(donnees.statutHomologation).to.be(undefined);
  });

  it("masque les besoins de sécurité si l'utilisateur n'a pas la permission", () => {
    const autorisationSansDecrire = uneAutorisation()
      .avecDroits({})
      .construis();

    const donnees = objetGetService.donnees(
      service,
      autorisationSansDecrire,
      referentiel,
      unAdaptateurEnvironnement()
    );

    expect(donnees.niveauSecurite).to.be(undefined);
  });

  it("masque la complétude si l'utilisateur n'a pas la permission", () => {
    const autorisationSansSecuriser = uneAutorisation()
      .avecDroits({})
      .construis();

    const donnees = objetGetService.donnees(
      service,
      autorisationSansSecuriser,
      referentiel,
      unAdaptateurEnvironnement()
    );

    expect(donnees.pourcentageCompletude).to.be(undefined);
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
      categoriesMesures: {},
      statutsMesures: {},
    });

    const serviceAvecDossierFinalise = unService(referentielDeuxEtapes)
      .avecId('123')
      .avecDossiers([
        unDossier(referentiel).quiEstComplet().quiEstNonFinalise().donnees,
      ])
      .construis();

    const donnees = objetGetService.donnees(
      serviceAvecDossierFinalise,
      autorisation,
      referentielDeuxEtapes,
      unAdaptateurEnvironnement()
    );

    expect(donnees.statutHomologation.etapeCourante).to.be('autorite');
  });

  describe('concernant les contributeurs admin', () => {
    const serviceAvecAdminA = unService(referentiel)
      .ajouteUnContributeur({
        ...unUtilisateur().avecId('ADMIN').quiSAppelle('Jean Dupont').donnees,
        estAdmin: true,
      })
      .construis();

    it('masque leurs informations, dans un soucis de confidentialité', () => {
      const pointDeVueDuNonAdmin = objetGetService.donnees(
        serviceAvecAdminA,
        uneAutorisation().deProprietaire('B', '123').construis(),
        referentiel,
        unAdaptateurEnvironnement()
      );

      const [admin] = pointDeVueDuNonAdmin.contributeurs;
      expect(admin).to.eql({
        estAdmin: true,
        estSuperviseur: false,
        estProprietaire: true,
        estUtilisateurCourant: false,
        id: 'ADMIN',
        initiales: 'A',
        poste: '',
        prenomNom: 'Administrateur',
      });
    });

    it("donne quand même les informations de l'admin s'il s'agit de l'utilisateur courant", () => {
      const pointDeVueDeAdminLuiMeme = objetGetService.donnees(
        serviceAvecAdminA,
        uneAutorisation().dAdmin('ADMIN', '123').construis(),
        referentiel,
        unAdaptateurEnvironnement()
      );

      const [admin] = pointDeVueDeAdminLuiMeme.contributeurs;
      expect(admin.id).to.be('ADMIN');
      expect(admin.prenomNom).to.be('Jean Dupont');
    });
  });

  describe('concernant les contributeurs superviseurs', () => {
    const serviceAvecSuperviseurS = unService(referentiel)
      .ajouteUnContributeur({
        ...unUtilisateur().avecId('SUPERVISEUR').quiSAppelle('Jean Dupont')
          .donnees,
        estSuperviseur: true,
      })
      .construis();

    it('masque leurs informations, dans un soucis de confidentialité', () => {
      const pointDeVueDuNonSuperviseur = objetGetService.donnees(
        serviceAvecSuperviseurS,
        uneAutorisation().deProprietaire('B', '123').construis(),
        referentiel,
        unAdaptateurEnvironnement()
      );

      const [superviseur] = pointDeVueDuNonSuperviseur.contributeurs;
      expect(superviseur).to.eql({
        estAdmin: false,
        estSuperviseur: true,
        estProprietaire: true,
        estUtilisateurCourant: false,
        id: 'SUPERVISEUR',
        initiales: 'S',
        poste: '',
        prenomNom: 'Superviseur',
      });
    });

    it("indique que l'utilisateur courant est superviseur du service", () => {
      const pointDeVueDuSuperviseur = objetGetService.donnees(
        serviceAvecSuperviseurS,
        uneAutorisation().deSuperviseur('SUPERVISEUR', '123').construis(),
        referentiel,
        unAdaptateurEnvironnement()
      );

      expect(pointDeVueDuSuperviseur.estSuperviseur).to.be(true);
    });

    it("donne quand même les informations du superviseur s'il s'agit de l'utilisateur courant", () => {
      const pointDeVueDuSuperviseurLuiMeme = objetGetService.donnees(
        serviceAvecSuperviseurS,
        uneAutorisation().deSuperviseur('SUPERVISEUR', '123').construis(),
        referentiel,
        unAdaptateurEnvironnement()
      );

      const [superviseur] = pointDeVueDuSuperviseurLuiMeme.contributeurs;
      expect(superviseur.prenomNom).to.be('Jean Dupont');
      expect(superviseur.estSuperviseur).to.be(true);
    });
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
          referentiel,
          unAdaptateurEnvironnement()
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
          autorisation,
          referentiel,
          unAdaptateurEnvironnement()
        ).permissions
      ).to.eql({ gestionContributeurs: false });
    });
  });
});
