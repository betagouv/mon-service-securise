const Knex = require('knex');
const config = require('./knexfile');
const {
  adaptateurChiffrement,
} = require('./src/adaptateurs/adaptateurChiffrement');
const { journalMSS } = require('./src/adaptateurs/adaptateurEnvironnement');

/* eslint-disable no-console */
class MigrationHash {
  constructor(environnementNode = process.env.NODE_ENV || 'development') {
    const configDuJournal = {
      client: 'pg',
      connection: process.env.URL_SERVEUR_BASE_DONNEES_JOURNAL,
      pool: { min: 0, max: journalMSS().poolMaximumConnexion() },
    };
    this.knexMSSJournal = Knex(configDuJournal);
    this.knexMSS = Knex(config[environnementNode]);
    this.ajouteVersion1 = (chaine) => {
      if (!chaine) return undefined;
      return chaine.startsWith('v1:') ? chaine : `v1:${chaine}`;
    };
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
          const siretHacheV1 = siretHacheActuel
            ? this.ajouteVersion1(siretHacheActuel)
            : null;
          const nomServiceHacheV1 = nomServiceHacheActuel
            ? this.ajouteVersion1(nomServiceHacheActuel)
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
          const emailHacheV1 = this.ajouteVersion1(emailHacheActuel);

          return trx('utilisateurs')
            .where({ id })
            .update({ email_hash: emailHacheV1 });
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
          const idServiceHacheV1 = this.ajouteVersion1(idServiceHacheActuel);
          const idSuperviseurHacheV1 = this.ajouteVersion1(
            idSuperviseurHacheActuel
          );
          const siretHacheV1 = this.ajouteVersion1(siretHacheActuel);

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

  async migreLesEvenementsDuJournal() {
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
              idService: this.ajouteVersion1(donnees.idService),
              autorisations: donnees.autorisations.map((a) => ({
                ...a,
                idUtilisateur: this.ajouteVersion1(a.idUtilisateur),
              })),
            };
            break;
          case 'COMPLETUDE_SERVICE_MODIFIEE':
          case 'NOUVELLE_HOMOLOGATION_CREEE':
          case 'RISQUES_SERVICE_MODIFIES':
          case 'SERVICE_SUPPRIME':
            nouvellesDonnees = {
              ...donnees,
              idService: this.ajouteVersion1(donnees.idService),
            };
            break;
          case 'CONNEXION_UTILISATEUR':
          case 'NOUVEL_UTILISATEUR_INSCRIT':
          case 'PROFIL_UTILISATEUR_MODIFIE':
            nouvellesDonnees = {
              ...donnees,
              idUtilisateur: this.ajouteVersion1(donnees.idUtilisateur),
            };
            break;
          case 'RETOUR_UTILISATEUR_MESURE_RECU':
          case 'NOUVEAU_SERVICE_CREE':
            nouvellesDonnees = {
              ...donnees,
              idUtilisateur: this.ajouteVersion1(donnees.idUtilisateur),
              idService: this.ajouteVersion1(donnees.idService),
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

  async ajouteVersion1DansTableDesSels() {
    const empreinte = await adaptateurChiffrement().hacheBCrypt('');
    await this.knexMSS('sels_de_hachage').insert({
      version: 1,
      empreinte,
    });
  }

  async migreTout() {
    console.log('Migration des Hash de MSS (utilisateurs et services)...');
    await this.migreLesHashDeMss();
    console.log('Migration des Hash de la supervision...');
    await this.migreLesHashDeLaSupervision();
    console.log('Migration des Hash des évènements du journal...');
    await this.migreLesEvenementsDuJournal();
    console.log('Ajout de la version dans la table sels_de_hachage...');
    await this.ajouteVersion1DansTableDesSels();
    console.log('Migration terminée.');
  }
}

/* eslint-enable no-console */

module.exports = MigrationHash;
