import { unUUIDRandom } from '../../test/constructeurs/UUID.js';
import * as AdaptateurPersistanceMemoire from './adaptateurPersistanceMemoire.js';
import { VersionService } from '../modeles/versionService.js';
import { uneAutorisation } from '../../test/constructeurs/constructeurAutorisation.js';
import { adaptateurChiffrement } from './adaptateurChiffrement.js';
import * as adaptateurEnvironnement from './adaptateurEnvironnement.js';
import { AdaptateurEnvironnementPourChiffrement } from './adaptateurChiffrement.interface.js';
import { donneesTestsAccessibilite } from '../../test_accessibilite/donneesTestAccessibilite.js';
import { unServiceV2 } from '../../test/constructeurs/constructeurService.js';
import { unDossier } from '../../test/constructeurs/constructeurDossier.js';
import { creeReferentielV2 } from '../referentielV2.js';

export const nouvelAdaptateur = () => {
  const chiffrement = adaptateurChiffrement({
    adaptateurEnvironnement:
      adaptateurEnvironnement as AdaptateurEnvironnementPourChiffrement,
  });

  const persistance = AdaptateurPersistanceMemoire.nouvelAdaptateur();
  const {
    utilisateurLambda,
    entite,
    utilisateurAdmin,
    idServiceV1,
    idServiceV2,
    utilisateurFuturAdmin,
    utilisateurSuperviseur,
  } = donneesTestsAccessibilite;

  persistance.ajouteUtilisateur(
    utilisateurLambda.id,
    utilisateurLambda,
    chiffrement.hacheSha256(utilisateurLambda.email)
  );
  persistance.ajouteUtilisateur(
    utilisateurFuturAdmin.id,
    utilisateurFuturAdmin,
    chiffrement.hacheSha256(utilisateurFuturAdmin.email)
  );

  persistance.ajouteUtilisateur(
    utilisateurAdmin.id,
    utilisateurAdmin,
    chiffrement.hacheSha256(utilisateurAdmin.email)
  );

  persistance.ajouteUtilisateur(
    utilisateurSuperviseur.id,
    utilisateurSuperviseur,
    chiffrement.hacheSha256(utilisateurSuperviseur.email)
  );

  const serviceV2 = unServiceV2()
    .avecId(idServiceV2)
    .avecNomService(`Mon service test ${new Date().getTime()}`)
    .avecDossiers([
      unDossier(creeReferentielV2()).avecAutorite(
        'Autorité',
        'Fonction autorité'
      ).donnees,
    ])
    .avecOrganisationResponsable(entite.toJSON()).donnees;
  persistance.sauvegardeService(
    serviceV2.id,
    serviceV2,
    chiffrement.hacheSha256(serviceV2.descriptionService.nomService),
    chiffrement.hacheSha256(entite.siret),
    VersionService.v2
  );
  persistance.sauvegardeAutorisation(
    unUUIDRandom(),
    uneAutorisation().deProprietaire(utilisateurLambda.id, serviceV2.id).donnees
  );
  persistance.sauvegardeAutorisation(
    unUUIDRandom(),
    uneAutorisation().deContributeur(utilisateurFuturAdmin.id, serviceV2.id)
      .donnees
  );
  persistance.sauvegardeAutorisation(
    unUUIDRandom(),
    uneAutorisation().dAdmin(utilisateurAdmin.id, serviceV2.id).donnees
  );

  const serviceV1 = {
    descriptionService: {
      delaiAvantImpactCritique: 'moinsUneHeure',
      localisationDonnees: 'france',
      nomService: `Mon service test V1 ${new Date().getTime()}`,
      provenanceService: 'developpement',
      statutDeploiement: 'enProjet',
      nombreOrganisationsUtilisatrices: { borneBasse: 1, borneHaute: 5 },
      niveauSecurite: 'niveau3',
      presentation: 'Une présentation',
      donneesCaracterePersonnel: [],
      fonctionnalites: [],
      typeService: ['siteInternet'],
      donneesSensiblesSpecifiques: [],
      fonctionnalitesSpecifiques: [],
      pointsAcces: [],
      organisationResponsable: {
        siret: '13000766900018',
        nom: 'ANSSI',
        departement: '75',
      },
    },
    dossiers: [],
    mesuresGenerales: [],
    mesuresSpecifiques: [],
    risquesGeneraux: [],
    risquesSpecifiques: [],
    rolesResponsabilites: { acteursHomologation: [], partiesPrenantes: [] },
    prochainIdNumeriqueDeRisqueSpecifique: 1,
    versionService: 'v1',
  };

  persistance.sauvegardeService(
    idServiceV1,
    serviceV1,
    chiffrement.hacheSha256(serviceV1.descriptionService.nomService),
    chiffrement.hacheSha256(entite.siret),
    VersionService.v1
  );
  persistance.sauvegardeAutorisation(
    unUUIDRandom(),
    uneAutorisation().deProprietaire(utilisateurLambda.id, idServiceV1).donnees
  );

  return persistance;
};
