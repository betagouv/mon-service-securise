const readline = require('readline');
const { parse } = require('papaparse');
const DepotDonnees = require('../src/depotDonnees');
const {
  fabriqueAdaptateurChiffrement,
} = require('../src/adaptateurs/fabriqueAdaptateurChiffrement');
const { fabriqueAdaptateurJWT } = require('../src/adaptateurs/adaptateurJWT');
const { fabriqueAdaptateurUUID } = require('../src/adaptateurs/adaptateurUUID');
const adaptateurRechercheEntrepriseAPI = require('../src/adaptateurs/adaptateurRechercheEntrepriseAPI');
const BusEvenements = require('../src/bus/busEvenements');
const {
  fabriqueAdaptateurGestionErreur,
} = require('../src/adaptateurs/fabriqueAdaptateurGestionErreur');
const Referentiel = require('../src/referentiel');
const donneesReferentiel = require('../donneesReferentiel');
const AdaptateurPostgres = require('../src/adaptateurs/adaptateurPostgres');
const { fabriqueProcedures } = require('../src/routes/procedures');
const adaptateurMail = require('../src/adaptateurs/adaptateurMailSendinblue');
const fabriqueAdaptateurTracking = require('../src/adaptateurs/fabriqueAdaptateurTracking');

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

  log.vert('OK');

  return donneesFinales;
};

class DuplicationEnMasseDeServices {
  constructor(environnementNode = process.env.NODE_ENV || 'development') {
    this.adaptateurPersistance = AdaptateurPostgres.nouvelAdaptateur({
      env: environnementNode,
    });

    this.referentiel = Referentiel.creeReferentiel(donneesReferentiel);

    const busEvenements = new BusEvenements({
      adaptateurGestionErreur: fabriqueAdaptateurGestionErreur(),
    });

    this.depotDonnees = DepotDonnees.creeDepot({
      adaptateurChiffrement: fabriqueAdaptateurChiffrement(),
      adaptateurJWT: fabriqueAdaptateurJWT(),
      adaptateurPersistance: this.adaptateurPersistance,
      adaptateurUUID: fabriqueAdaptateurUUID(),
      referentiel: this.referentiel,
      adaptateurRechercheEntite: adaptateurRechercheEntrepriseAPI,
      busEvenements,
    });

    this.procedures = fabriqueProcedures({
      depotDonnees: this.depotDonnees,
      adaptateurMail,
      adaptateurTracking: fabriqueAdaptateurTracking(),
      busEvenements,
    });
  }

  async dupliqueSelonCsvInputDansConsole(
    emailProprietaireDuModele,
    idServiceModele
  ) {
    const proprietaire = await this.depotDonnees.utilisateurAvecEmail(
      emailProprietaireDuModele
    );

    if (!proprietaire) {
      log.rouge(
        `Impossible de trouver le propriétaire avec email ${emailProprietaireDuModele}\n`
      );
      return;
    }

    const donnees = await lisEntreeTapeeDansLaConsole();
    const donneesFormatees = transformeEntreeEnTableau(donnees);

    log.cyan('\nDémarrage de la duplication…');

    for (const serviceADupliquer of donneesFormatees) {
      const idNouveauService = await this.depotDonnees.dupliqueService(
        idServiceModele,
        proprietaire.id,
        {
          nomService: serviceADupliquer.ENTITE,
          siret: serviceADupliquer.SIRET,
        }
      );
      for (const emailUtilisateurAInviter of serviceADupliquer.PROPRIETAIRE) {
        await this.procedures.ajoutContributeurSurServices(
          emailUtilisateurAInviter,
          [{ id: idNouveauService }],
          { estProprietaire: true },
          proprietaire
        );
      }
    }

    log.vert('\nDuplication terminée avec succès !\n');
  }
}

module.exports = DuplicationEnMasseDeServices;
