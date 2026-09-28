import Knex from 'knex';
import { adaptateurChiffrement } from '../src/adaptateurs/adaptateurChiffrement.js';
import * as adaptateurEnvironnement from '../src/adaptateurs/adaptateurEnvironnement.js';
import { creeDepot } from '../src/depots/depotDonneesSelsDeHachage.js';
import * as AdaptateurPostgres from '../src/adaptateurs/adaptateurPostgres.js';
import { knexMSS } from '../src/bdd/knex.js';

const tenteDeHacherAvecUnNouveauSel = (
  chaine,
  version,
  sel,
  fonctionDeHashage,
  versionPrecedenteAttendue
) => {
  if (!chaine) return undefined;
  const [versionActuelle, hashActuel] = chaine.split(':');
  if (versionActuelle !== versionPrecedenteAttendue) {
    return chaine;
  }
  const nouvelleVersion = `${versionActuelle}-v${version}`;
  const chaineHachee = fonctionDeHashage(hashActuel, sel);
  return `${nouvelleVersion}:${chaineHachee}`;
};

/* eslint-disable no-console */
class MigrationHash {
  constructor() {
    const configDuJournal = {
      client: 'pg',
      connection: process.env.URL_SERVEUR_BASE_DONNEES_JOURNAL,
      pool: {
        min: 0,
        max: adaptateurEnvironnement.journalMSS().poolMaximumConnexion(),
      },
    };
    this.knexMSSJournal = Knex(configDuJournal);
    this.knexMSS = knexMSS;
    if (!adaptateurEnvironnement.modeMaintenance().actif()) {
      throw new Error(
        `La migration des hash requiert que l'application soit en mode maintenance !`
      );
    }
    this.adaptateurChiffrement = adaptateurChiffrement({
      adaptateurEnvironnement,
    });
    this.depotDonneesSelsDeHachage = creeDepot({
      adaptateurPersistance: AdaptateurPostgres.nouvelAdaptateur({}),
      adaptateurEnvironnement,
      adaptateurChiffrement: this.adaptateurChiffrement,
    });
  }

  async migreLesHashDeMss(fonctionDeMigration) {
    await this.knexMSS.transaction(async (trx) => {
      const services = await trx('services');

      const majServices = services.map(
        ({
          id,
          siret_hash: siretHacheActuel,
          nom_service_hash: nomServiceHacheActuel,
        }) => {
          const siretHacheV1 = siretHacheActuel
            ? fonctionDeMigration(siretHacheActuel)
            : null;
          const nomServiceHacheV1 = nomServiceHacheActuel
            ? fonctionDeMigration(nomServiceHacheActuel)
            : null;

          return trx('services').where({ id }).update({
            siret_hash: siretHacheV1,
            nom_service_hash: nomServiceHacheV1,
          });
        }
      );

      const utilisateurs = await trx('utilisateurs');

      const majUtilisateurs = utilisateurs.map(
        ({ id, email_hash: emailHacheActuel }) => {
          const emailHacheV1 = fonctionDeMigration(emailHacheActuel);

          return trx('utilisateurs')
            .where({ id })
            .update({ email_hash: emailHacheV1 });
        }
      );

      const admins = await trx('admins_organisations');

      const majAdmins = admins.map(
        ({ id_utilisateur: idUtilisateur, siret_hash: siretHacheActuel }) =>
          trx('admins_organisations')
            .where({
              id_utilisateur: idUtilisateur,
              siret_hash: siretHacheActuel,
            })
            .update({
              siret_hash: fonctionDeMigration(siretHacheActuel),
            })
      );

      const auditAdmins = await trx('admins_organisations_audit');

      const majAuditAdmins = auditAdmins.map(
        ({
          id,
          email_acteur_hash: emailActeurHacheActuel,
          email_utilisateur_cible_hash: emailUtilisateurCibleHacheActuel,
          siret_hash: siretHacheActuel,
        }) =>
          trx('admins_organisations_audit')
            .where({ id })
            .update({
              email_acteur_hash: fonctionDeMigration(emailActeurHacheActuel),
              email_utilisateur_cible_hash: fonctionDeMigration(
                emailUtilisateurCibleHacheActuel
              ),
              siret_hash: fonctionDeMigration(siretHacheActuel),
            })
      );

      const superviseurs = await trx('superviseurs');

      const majSuperviseurs = superviseurs.map(
        ({ id_superviseur: idSuperviseur, siret_hash: siretHacheActuel }) =>
          trx('superviseurs')
            .where({
              id_superviseur: idSuperviseur,
              siret_hash: siretHacheActuel,
            })
            .update({
              siret_hash: fonctionDeMigration(siretHacheActuel),
            })
      );

      const clesApi = await trx('cles_api');

      const majClesApi = clesApi.map(({ id, empreinte }) =>
        trx('cles_api')
          .where({ id })
          .update({
            empreinte: fonctionDeMigration(empreinte),
          })
      );

      await Promise.all([
        ...majServices,
        ...majUtilisateurs,
        ...majAdmins,
        ...majAuditAdmins,
        ...majSuperviseurs,
        ...majClesApi,
      ]);
    });
  }

  async migreLesHashDeLaSupervision(fonctionDeMigration) {
    await this.knexMSSJournal.transaction(async (trx) => {
      const superviseurs = await trx('journal_mss.superviseurs');

      const majSuperviseurs = superviseurs.map(
        ({
          id_service: idServiceHacheActuel,
          id_superviseur: idSuperviseurHacheActuel,
          siret_service: siretHacheActuel,
        }) => {
          const idServiceHacheV1 = fonctionDeMigration(idServiceHacheActuel);
          const idSuperviseurHacheV1 = fonctionDeMigration(
            idSuperviseurHacheActuel
          );
          const siretHacheV1 = fonctionDeMigration(siretHacheActuel);

          return trx('journal_mss.superviseurs')
            .where({
              id_service: idServiceHacheActuel,
              id_superviseur: idSuperviseurHacheActuel,
              siret_service: siretHacheActuel,
            })
            .update({
              id_service: idServiceHacheV1,
              id_superviseur: idSuperviseurHacheV1,
              siret_service: siretHacheV1,
            });
        }
      );

      await Promise.all(majSuperviseurs);
    });
  }

  async migreLesEvenementsDuJournal(fonctionDeMigration) {
    await this.knexMSSJournal.transaction(async (trx) => {
      const evenements = await trx('journal_mss.evenements');
      process.stdout.write('\n');
      let compteur = 0;

      const majEvenements = evenements.map(({ id, type, donnees }, index) => {
        process.stdout.write(
          `\rConstruction des données: ${(
            (index / (evenements.length - 1)) *
            100.0
          ).toFixed(2)}% (${index}/${evenements.length - 1})`
        );

        let nouvellesDonnees;

        switch (type) {
          case 'COLLABORATIF_SERVICE_MODIFIE':
            nouvellesDonnees = {
              ...donnees,
              idService: fonctionDeMigration(donnees.idService),
              autorisations: donnees.autorisations.map((a) => ({
                ...a,
                idUtilisateur: fonctionDeMigration(a.idUtilisateur),
              })),
            };
            break;
          case 'COMPLETUDE_SERVICE_MODIFIEE':
          case 'NOUVELLE_HOMOLOGATION_CREEE':
          case 'RISQUES_SERVICE_MODIFIES':
          case 'SERVICE_RATTACHE_A_PRESTATAIRE':
          case 'SERVICE_SUPPRIME':
          case 'SIMULATION_MIGRATION_REFERENTIEL_CREEE':
            nouvellesDonnees = {
              ...donnees,
              idService: fonctionDeMigration(donnees.idService),
            };
            break;
          case 'CGU_ACCEPTEES':
          case 'CONNEXION_UTILISATEUR':
          case 'NOUVEL_UTILISATEUR_INSCRIT':
          case 'PROFIL_UTILISATEUR_MODIFIE':
          case 'SERVICES_IMPORTES':
          case 'MESURE_MODIFIEE_EN_MASSE':
          case 'MODELES_MESURE_SPECIFIQUE_IMPORTES':
            nouvellesDonnees = {
              ...donnees,
              idUtilisateur: fonctionDeMigration(donnees.idUtilisateur),
            };
            break;
          case 'RETOUR_UTILISATEUR_MESURE_RECU':
          case 'SERVICE_V1_MIGRE_EN_V2':
          case 'NOUVEAU_SERVICE_CREE':
            nouvellesDonnees = {
              ...donnees,
              idUtilisateur: fonctionDeMigration(donnees.idUtilisateur),
              idService: fonctionDeMigration(donnees.idService),
            };
            break;
          case 'ACCES_UTILISATEUR_ADMINISTRE_RETIRES':
          case 'ROLE_UTILISATEUR_ADMINISTRE_ATTRIBUE':
            nouvellesDonnees = {
              ...donnees,
              idAdmin: fonctionDeMigration(donnees.idAdmin),
              idUtilisateurAdministre: fonctionDeMigration(
                donnees.idUtilisateurAdministre
              ),
              idsServices: donnees.idsServices.map(fonctionDeMigration),
            };
            break;
          case 'ADMIN_NOMME_SUR_ORGANISATION':
          case 'ADMIN_RETIRE_DE_ORGANISATION':
            nouvellesDonnees = {
              ...donnees,
              idActeur: fonctionDeMigration(donnees.idActeur),
              idCible: fonctionDeMigration(donnees.idCible),
              siret: fonctionDeMigration(donnees.siret),
            };
            break;
          case 'CLE_API_CREEE':
          case 'CLE_API_REVOQUEE':
            nouvellesDonnees = {
              ...donnees,
              idUtilisateur: fonctionDeMigration(donnees.idUtilisateur),
              idCle: fonctionDeMigration(donnees.idCle),
            };
            break;
          case 'NOTIFICATION_TRANSACTIONNELLE_MODIFIEE':
            nouvellesDonnees = {
              ...donnees,
              idNotification: fonctionDeMigration(donnees.idNotification),
              idActeur: fonctionDeMigration(donnees.idActeur),
              idDestinataire: fonctionDeMigration(donnees.idDestinataire),
              idService: fonctionDeMigration(donnees.idService),
            };
            break;
          case 'RISQUES_V2_SERVICE_MODIFIES':
            nouvellesDonnees = {
              ...donnees,
              idService: fonctionDeMigration(donnees.idService),
              risquesSpecifiques: donnees.risquesSpecifiques.map((rs) => ({
                ...rs,
                id: fonctionDeMigration(rs.id),
              })),
            };
            break;
          default:
            nouvellesDonnees = donnees;
        }

        return trx('journal_mss.evenements')
          .where({ id })
          .update({ donnees: nouvellesDonnees })
          .then(() => {
            compteur += 1;
            process.stdout.write(
              `\rExécution des promesses: ${(
                (compteur / (evenements.length - 1)) *
                100.0
              ).toFixed(2)}% (${compteur}/${evenements.length - 1})`
            );
          });
      });

      process.stdout.write('\n');
      await Promise.all(majEvenements);
      process.stdout.write('\n');
    });
  }

  async ajouteVersionDansTableDesSels(version, sel) {
    const empreinte = await this.adaptateurChiffrement.hacheBCrypt(sel);
    await this.knexMSS('sels_de_hachage').insert({
      version,
      empreinte,
    });
  }

  async migreToutEnVersionV1() {
    const ajouteVersion1 = (chaine) => {
      if (!chaine) return undefined;
      return chaine.startsWith('v1:') ? chaine : `v1:${chaine}`;
    };
    console.log('Migration des Hash de MSS (utilisateurs et services)...');
    await this.migreLesHashDeMss(ajouteVersion1);
    console.log('Migration des Hash de la supervision...');
    await this.migreLesHashDeLaSupervision(ajouteVersion1);
    console.log('Migration des Hash des évènements du journal...');
    await this.migreLesEvenementsDuJournal(ajouteVersion1);
    console.log('Ajout de la version dans la table sels_de_hachage...');
    await this.ajouteVersionDansTableDesSels(1, '');
    console.log('Migration terminée.');
  }

  async migreTout(version, sel) {
    await this.depotDonneesSelsDeHachage.verifieLaCoherenceDesSelsAvantMigration(
      version,
      sel
    );

    console.log('Configuration des sels cohérente');

    const versionPrecedenteAttendue = adaptateurEnvironnement
      .chiffrement()
      .tousLesSelsDeHachage()
      .filter(({ version: numVersion }) => numVersion !== version)
      .map(({ version: numVersion }) => `v${numVersion}`)
      .join('-');

    console.log(
      `Version précédente de sel attendue pour les données à migrer : ${versionPrecedenteAttendue}`
    );
    console.log(
      `Nouvelle version après migration : ${versionPrecedenteAttendue}-v${version}`
    );

    const appliqueNouveauSel = (chaine) =>
      tenteDeHacherAvecUnNouveauSel(
        chaine,
        version,
        sel,
        this.adaptateurChiffrement.hacheSha256AvecUnSeulSel,
        versionPrecedenteAttendue
      );

    console.log('Migration des Hash de MSS (utilisateurs et services)...');
    await this.migreLesHashDeMss(appliqueNouveauSel);
    console.log('Migration des Hash de la supervision...');
    await this.migreLesHashDeLaSupervision(appliqueNouveauSel);
    console.log('Migration des Hash des évènements du journal...');
    await this.migreLesEvenementsDuJournal(appliqueNouveauSel);
    console.log(
      `Ajout de la version ${version} dans la table sels_de_hachage...`
    );
    await this.ajouteVersionDansTableDesSels(version, sel);
    console.log('Migration terminée.');
  }
}

/* eslint-enable no-console */

export { MigrationHash, tenteDeHacherAvecUnNouveauSel };
