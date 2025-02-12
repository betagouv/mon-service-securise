const Knex = require('knex');
const config = require('./knexfile');
const adaptateurEnvironnement = require('./src/adaptateurs/adaptateurEnvironnement');
const {
  hacheSha256AvecSel,
} = require('./src/adaptateurs/adaptateurChiffrement');

/* eslint-disable no-console */
class MigrationHash {
  constructor(environnementNode = process.env.NODE_ENV || 'development') {
    const configDuJournal = {
      client: 'pg',
      connection: process.env.URL_SERVEUR_BASE_DONNEES_JOURNAL,
      pool: { min: 0, max: 10 },
    };
    this.knexMSSJournal = Knex(configDuJournal);
    this.knexMSS = Knex(config[environnementNode]);
    const sel = adaptateurEnvironnement.chiffrement().sel();
    if (!sel) {
      throw new Error('Impossible de hacher sans sel');
    }
    const modeMaintenanceActif = adaptateurEnvironnement
      .modeMaintenance()
      .actif();
    if (!modeMaintenanceActif) {
      throw new Error(
        'Vous devez activer le mode maintenance avant de jouer cette migration.'
      );
    }
    this.hache = (chaine) => hacheSha256AvecSel(chaine, sel);
  }

  async migreLesHashDeMss() {
    await this.knexMSS.transaction(async (trx) => {
      const services = await trx('services');

      const majServices = services.map(
        ({
          id,
          siret_hash: siretHacheActuel,
          nom_service_hash: nomServiceHacheActuel,
        }) => {
          const siretHacheDeNouveau = siretHacheActuel
            ? this.hache(siretHacheActuel)
            : null;
          const nomServiceHacheDeNouveau = nomServiceHacheActuel
            ? this.hache(nomServiceHacheActuel)
            : null;

          return trx('services').where({ id }).update({
            siret_hash: siretHacheDeNouveau,
            nom_service_hash: nomServiceHacheDeNouveau,
          });
        }
      );

      const utilisateurs = await trx('utilisateurs');

      const majUtilisateurs = utilisateurs.map(
        ({ id, email_hash: emailHacheActuel }) => {
          const emailHacheDeNouveau = this.hache(emailHacheActuel);

          return trx('utilisateurs')
            .where({ id })
            .update({ email_hash: emailHacheDeNouveau });
        }
      );

      await Promise.all([...majServices, ...majUtilisateurs]);
    });
  }

  async migreLesHashDeLaSupervision() {
    await this.knexMSSJournal.transaction(async (trx) => {
      const superviseurs = await trx('journal_mss.superviseurs');

      const majSuperviseurs = superviseurs.map(
        ({
          id_service: idServiceHacheActuel,
          id_superviseur: idSuperviseurHacheActuel,
          siret_service: siretHacheActuel,
        }) => {
          const idServiceHacheDeNouveau = this.hache(idServiceHacheActuel);
          const idSuperviseurHacheDeNouveau = this.hache(
            idSuperviseurHacheActuel
          );
          const siretHacheDeNouveau = this.hache(siretHacheActuel);

          return trx('journal_mss.superviseurs')
            .where({
              id_service: idServiceHacheActuel,
              id_superviseur: idSuperviseurHacheActuel,
              siret_service: siretHacheActuel,
            })
            .update({
              id_service: idServiceHacheDeNouveau,
              id_superviseur: idSuperviseurHacheDeNouveau,
              siret_service: siretHacheDeNouveau,
            });
        }
      );

      await Promise.all(majSuperviseurs);
    });
  }

  async migreLesEvenementsDuJournal() {
    await this.knexMSSJournal.transaction(async (trx) => {
      const evenements = await trx('journal_mss.evenements');

      const majEvenements = evenements.map(({ id, type, donnees }) => {
        let nouvellesDonnees;

        switch (type) {
          case 'COLLABORATIF_SERVICE_MODIFIE':
            nouvellesDonnees = {
              ...donnees,
              idService: this.hache(donnees.idService),
              autorisations: donnees.autorisations.map((a) => ({
                ...a,
                idUtilisateur: this.hache(a.idUtilisateur),
              })),
            };
            break;
          case 'COMPLETUDE_SERVICE_MODIFIEE':
          case 'NOUVELLE_HOMOLOGATION_CREEE':
          case 'RISQUES_SERVICE_MODIFIES':
          case 'SERVICE_SUPPRIME':
            nouvellesDonnees = {
              ...donnees,
              idService: this.hache(donnees.idService),
            };
            break;
          case 'CONNEXION_UTILISATEUR':
          case 'NOUVEL_UTILISATEUR_INSCRIT':
          case 'PROFIL_UTILISATEUR_MODIFIE':
            nouvellesDonnees = {
              ...donnees,
              idUtilisateur: this.hache(donnees.idUtilisateur),
            };
            break;
          case 'RETOUR_UTILISATEUR_MESURE_RECU':
          case 'NOUVEAU_SERVICE_CREE':
            nouvellesDonnees = {
              ...donnees,
              idUtilisateur: this.hache(donnees.idUtilisateur),
              idService: this.hache(donnees.idService),
            };
            break;
          default:
            nouvellesDonnees = donnees;
        }

        return trx('journal_mss.evenements')
          .where({ id })
          .update({ donnees: nouvellesDonnees });
      });

      await Promise.all(majEvenements);
    });
  }

  async migreTout() {
    console.log('Migration des Hash de MSS (utilisateurs et services)...');
    await this.migreLesHashDeMss();
    console.log('Migration des Hash de la supervision...');
    await this.migreLesHashDeLaSupervision();
    console.log('Migration des Hash des évènements du journal...');
    await this.migreLesEvenementsDuJournal();
    console.log('Migration terminée.');
  }
}

/* eslint-enable no-console */

module.exports = MigrationHash;
