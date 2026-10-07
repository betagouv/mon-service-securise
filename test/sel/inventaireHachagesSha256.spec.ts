import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

type Couverture =
  | 'migreLesHashDeMss'
  | 'migreLesHashDeLaSupervision'
  | 'migreLesEvenementsDuJournal'
  | 'aucun hash persisté';

const inventaire: Record<
  string,
  { occurrences: number; couvertPar: Couverture }
> = {
  'src/adaptateurs/adaptateurAuditAdminOrganisationsPostgres.ts': {
    occurrences: 3,
    couvertPar: 'migreLesHashDeMss',
  },
  'src/adaptateurs/adaptateurPostgresTS.ts': {
    occurrences: 4,
    couvertPar: 'migreLesHashDeMss',
  },
  'src/depots/depotDonneesClesApi.ts': {
    occurrences: 2,
    couvertPar: 'migreLesHashDeMss',
  },
  'src/depots/depotDonneesServices.js': {
    occurrences: 4,
    couvertPar: 'migreLesHashDeMss',
  },
  'src/depots/depotDonneesUtilisateurs.js': {
    occurrences: 3,
    couvertPar: 'migreLesHashDeMss',
  },
  'src/adaptateurs/adaptateurSupervisionMetabase.ts': {
    occurrences: 1,
    couvertPar: 'migreLesHashDeLaSupervision',
  },
  'src/adaptateurs/serviceStatistiquesAdmin.ts': {
    occurrences: 4,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementAccesUtilisateurAdministreRetires.ts': {
    occurrences: 3,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementAdminNommeSurOrganisation.ts': {
    occurrences: 3,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementAdminRetireDeOrganisation.ts': {
    occurrences: 3,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementCguAcceptees.js': {
    occurrences: 1,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementCleApiCreee.ts': {
    occurrences: 2,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementCleApiRevoquee.ts': {
    occurrences: 2,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementCollaboratifServiceModifie.js': {
    occurrences: 2,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementCompletudeServiceModifiee.commun.ts': {
    occurrences: 1,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementConnexionUtilisateur.ts': {
    occurrences: 1,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementGroupeServicesCree.ts': {
    occurrences: 2,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementGroupeServicesSupprime.ts': {
    occurrences: 2,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementMesureModifieeEnMasse.js': {
    occurrences: 1,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementModelesMesureSpecifiqueImportes.js': {
    occurrences: 1,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementNotificationTransactionnelleModifiee.ts': {
    occurrences: 4,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementNouveauServiceCree.ts': {
    occurrences: 2,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementNouvelUtilisateurInscrit.js': {
    occurrences: 1,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementNouvelleHomologationCreee.js': {
    occurrences: 1,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementProfilUtilisateurModifie.js': {
    occurrences: 1,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementRetourUtilisateurMesure.js': {
    occurrences: 2,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementRisquesServiceModifies.ts': {
    occurrences: 1,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementRisquesV2ServiceModifies.ts': {
    occurrences: 2,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementRoleUtilisateurAdministreAttribue.ts': {
    occurrences: 3,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementServiceMigreEnV2.js': {
    occurrences: 2,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementServiceRattacheAPrestataire.js': {
    occurrences: 1,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementServiceSupprime.js': {
    occurrences: 1,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementServicesDuGroupeModifies.ts': {
    occurrences: 2,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementServicesImportes.ts': {
    occurrences: 1,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/modeles/journalMSS/evenementSimulationMigrationReferentielCreee.ts': {
    occurrences: 1,
    couvertPar: 'migreLesEvenementsDuJournal',
  },
  'src/adaptateurs/adaptateurChiffrement.ts': {
    occurrences: 1,
    couvertPar: 'aucun hash persisté',
  },
  'src/adaptateurs/adaptateurChiffrement.interface.ts': {
    occurrences: 1,
    couvertPar: 'aucun hash persisté',
  },
  'src/adaptateurs/adaptateurChiffrementChaCha20.ts': {
    occurrences: 2,
    couvertPar: 'aucun hash persisté',
  },
  'src/adaptateurs/adaptateurPersistanceMemoireTestsAccessibilite.ts': {
    occurrences: 9,
    couvertPar: 'aucun hash persisté',
  },
};

const racineDuProjet = fileURLToPath(new URL('../../', import.meta.url));
const appelHacheSha256 = /hacheSha256(?![A-Za-z])/g;

const fichiersSources = (dossier: string) =>
  readdirSync(dossier, { recursive: true, encoding: 'utf8' })
    .filter((chemin) => /\.(js|ts)$/.test(chemin))
    .map((chemin) => join(dossier, chemin));

const occurrencesParFichier = () =>
  Object.fromEntries(
    fichiersSources(join(racineDuProjet, 'src'))
      .map((fichier) => {
        const occurrences =
          readFileSync(fichier, 'utf8').match(appelHacheSha256)?.length ?? 0;
        return [relative(racineDuProjet, fichier), occurrences] as const;
      })
      .filter(([, occurrences]) => occurrences > 0)
  );

describe("L'inventaire des usages de hacheSha256", () => {
  it("correspond au code : tout nouvel usage doit être couvert par une migration d'admin/migrationHash.js", () => {
    const occurrencesInventoriees = Object.fromEntries(
      Object.entries(inventaire).map(([fichier, { occurrences }]) => [
        fichier,
        occurrences,
      ])
    );

    expect(occurrencesParFichier()).toEqual(occurrencesInventoriees);
  });
});
