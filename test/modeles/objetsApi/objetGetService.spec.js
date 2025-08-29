import expect from 'expect.js';
import * as objetGetService from '../../../src/modeles/objetsApi/objetGetService.js';
import * as Referentiel from '../../../src/referentiel.js';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import {
  Rubriques,
  Permissions,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { unDossier } from '../../constructeurs/constructeurDossier.js';
import { dateEnFrancais } from '../../../src/utilitaires/date.js';
import Mesures from '../../../src/modeles/mesures.js';

const { HOMOLOGUER, DECRIRE, SECURISER } = Rubriques;
const { LECTURE, ECRITURE } = Permissions;

describe("L'objet d'API de `GET /service`", () => {
  const referentiel = Referentiel.creeReferentiel({
    statutsHomologation: {
      nonRealisee: { libelle: 'Non réalisée', ordre: 1 },
    },
    echeancesRenouvellement: {
      unAn: { nbMoisDecalage: 12, nbMoisBientotExpire: 3 },
    },
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
    expect(objetGetService.donnees(service, autorisation, referentiel)).to.eql({
      id: '123',
      nomService: 'Un service',
      organisationResponsable: 'Une organisation',
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
      documentsPdfDisponibles: ['syntheseSecurite'],
      permissions: { gestionContributeurs: false },
      aUneSuggestionAction: true,
      actionRecommandee: { id: 'mettreAJour', autorisee: true },
      niveauSecurite: 'niveau1',
      pourcentageCompletude: 0.5,
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
      referentiel
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
      referentiel
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
      referentiel
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
      referentiel
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
          autorisation,
          referentiel
        ).permissions
      ).to.eql({ gestionContributeurs: false });
    });
  });
});
