const readline = require('readline');
const { parse } = require('papaparse');
const DepotDonnees = require('../../src/depotDonnees');
const {
  fabriqueAdaptateurChiffrement,
} = require('../../src/adaptateurs/fabriqueAdaptateurChiffrement');
const {
  fabriqueAdaptateurJWT,
} = require('../../src/adaptateurs/adaptateurJWT');
const {
  fabriqueAdaptateurUUID,
} = require('../../src/adaptateurs/adaptateurUUID');
const adaptateurRechercheEntrepriseAPI = require('../../src/adaptateurs/adaptateurRechercheEntrepriseAPI');
const BusEvenements = require('../../src/bus/busEvenements');
const {
  fabriqueAdaptateurGestionErreur,
} = require('../../src/adaptateurs/fabriqueAdaptateurGestionErreur');
const Referentiel = require('../../src/referentiel');
const donneesReferentiel = require('../../donneesReferentiel');
const AdaptateurPostgres = require('../../src/adaptateurs/adaptateurPostgres');
const { fabriqueProcedures } = require('../../src/routes/procedures');
const adaptateurMail = require('../../src/adaptateurs/adaptateurMailSendinblue');
const fabriqueAdaptateurTracking = require('../../src/adaptateurs/fabriqueAdaptateurTracking');
const {
  EvenementServiceRattacheAPrestataire,
} = require('../../src/bus/evenementServiceRattacheAPrestataire');
const { cableTousLesAbonnes } = require('../../src/bus/cablage');
const {
  fabriqueAdaptateurHorloge,
} = require('../../src/adaptateurs/adaptateurHorloge');
const fabriqueAdaptateurJournalMSS = require('../../src/adaptateurs/fabriqueAdaptateurJournalMSS');
const fabriqueAdaptateurSupervision = require('../../src/adaptateurs/fabriqueAdaptateurSupervision');

const log = {
  jaune: (txt) => process.stdout.write(`\x1b[33m${txt}\x1b[0m`),
  cyan: (txt) => process.stdout.write(`\x1b[36m${txt}\x1b[0m`),
  vert: (txt) => process.stdout.write(`\x1b[92m${txt}\x1b[0m`),
  rouge: (txt) => process.stdout.write(`\x1b[31m${txt}\x1b[0m`),
};

/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */

const lisEntreeTapeeDansLaConsole = async () => {
  log.cyan(
    'Copier/Coller le contenu CSV du fichier de clonage et appuyer sur Ctrl+D (ou "Entrée" deux fois) :'
  );

  let donnees = '';
  let derniereLigneVide = false;

  const lecteurStdin = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  for await (const ligne of lecteurStdin) {
    if (ligne.trim() === '') {
      if (derniereLigneVide) {
        break;
      }
      derniereLigneVide = true;
    } else {
      derniereLigneVide = false;
      donnees += `${ligne}\n`;
    }
  }
  lecteurStdin.close();

  return donnees;
};

const transformeEntreeEnTableau = (donnees) => {
  log.cyan('\nTransformation du CSV…');

  const options = { header: true, skipEmptyLines: true, delimiter: ';' };
  const donneesFinales = parse(donnees, options).data.map((d) => ({
    ...d,
    PROPRIETAIRE: d.PROPRIETAIRE.split(',').map((p) => p.trim()),
  }));

  log.vert(' OK\n');

  return donneesFinales;
};

class DuplicationEnMasseDeServices {
  constructor(
    environnementNode = process.env.NODE_ENV || 'development',
    modeDryRun = true,
    codePrestataire = ''
  ) {
    this.modeDryRun = modeDryRun;

    if (!codePrestataire) throw new Error('Le code prestataire est requis');
    this.codePrestataire = codePrestataire;

    this.adaptateurPersistance = AdaptateurPostgres.nouvelAdaptateur({
      env: environnementNode,
    });

    this.referentiel = Referentiel.creeReferentiel(donneesReferentiel);

    this.busEvenements = new BusEvenements({
      adaptateurGestionErreur: fabriqueAdaptateurGestionErreur(),
    });

    this.depotDonnees = DepotDonnees.creeDepot({
      adaptateurChiffrement: fabriqueAdaptateurChiffrement(),
      adaptateurJWT: fabriqueAdaptateurJWT(),
      adaptateurPersistance: this.adaptateurPersistance,
      adaptateurUUID: fabriqueAdaptateurUUID(),
      referentiel: this.referentiel,
      adaptateurRechercheEntite: adaptateurRechercheEntrepriseAPI,
      busEvenements: this.busEvenements,
    });

    const adaptateurTracking = fabriqueAdaptateurTracking();
    const adaptateurJournal = fabriqueAdaptateurJournalMSS();
    const adaptateurSupervision = fabriqueAdaptateurSupervision();
    const adaptateurHorloge = fabriqueAdaptateurHorloge();

    this.procedures = fabriqueProcedures({
      depotDonnees: this.depotDonnees,
      adaptateurMail,
      adaptateurTracking,
      busEvenements: this.busEvenements,
    });

    cableTousLesAbonnes(this.busEvenements, {
      adaptateurHorloge,
      adaptateurTracking,
      adaptateurJournal,
      adaptateurRechercheEntreprise: adaptateurRechercheEntrepriseAPI,
      adaptateurMail,
      adaptateurSupervision,
      depotDonnees: this.depotDonnees,
      referentiel: this.referentiel,
    });
  }

  async dupliqueSelonCsvInputDansConsole(
    emailProprietaireDuModele,
    idServiceModele
  ) {
    if (this.modeDryRun) {
      log.cyan('🧪 Mode dryRun actif\n');
    }
    const proprietaire = await this.depotDonnees.utilisateurAvecEmail(
      emailProprietaireDuModele
    );

    if (!proprietaire) {
      log.rouge(
        `💥 Impossible de trouver le propriétaire avec email ${emailProprietaireDuModele}\n`
      );
      return;
    }

    const donnees = await lisEntreeTapeeDansLaConsole();
    const donneesFormatees = transformeEntreeEnTableau(donnees);
    const total = donneesFormatees.length;

    log.cyan(
      `📑 ${total} lignes à traiter pour le prestataire ${this.codePrestataire}.\n`
    );

    if (this.modeDryRun) {
      log.cyan("🧪 Mode dryRun actif: on s'arrête là.\n");
      return;
    }

    log.cyan('\n🚚 Démarrage de la duplication…\n');

    for (let i = 0; i < total; i += 1) {
      const progression = `[${(i + 1).toString().padStart(4, ' ')}/${total}]`;
      try {
        const { ENTITE, PROPRIETAIRE, SIRET } = donneesFormatees[i];

        log.cyan(
          `${progression} Duplication du service. ${ENTITE} - ${SIRET}…`
        );

        const idNouveauService = await this.depotDonnees.dupliqueService(
          idServiceModele,
          proprietaire.id,
          { nomService: ENTITE, siret: SIRET }
        );

        log.vert(` OK\n`);

        await this.busEvenements.publie(
          new EvenementServiceRattacheAPrestataire({
            idService: idNouveauService,
            codePrestataire: this.codePrestataire,
          })
        );

        for (const emailUtilisateurAInviter of PROPRIETAIRE) {
          log.cyan(`${progression} Invitation de ${emailUtilisateurAInviter}…`);

          try {
            await this.procedures.ajoutContributeurSurServices(
              emailUtilisateurAInviter,
              [{ id: idNouveauService }],
              { estProprietaire: true },
              proprietaire
            );
          } catch (e) {
            log.rouge(
              `\n${progression} 💥💥 Erreur pour ${emailUtilisateurAInviter}: ${e.message}\n${e.stack}\n`
            );
          }

          log.vert(` OK\n`);
        }
      } catch (e) {
        log.rouge(`\n${progression} 💥💥 Erreur: ${e.message}\n${e.stack}\n`);
      }
    }

    log.vert('\n🎉🎉🎉 Duplication terminée !\n');
  }
}

module.exports = { DuplicationEnMasseDeServices };
