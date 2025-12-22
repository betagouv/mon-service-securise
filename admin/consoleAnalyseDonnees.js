import fs from 'node:fs';
import * as DepotDonnees from '../src/depotDonnees.js';
import { fabriqueAdaptateurChiffrement } from '../src/adaptateurs/fabriqueAdaptateurChiffrement.js';
import { fabriqueAdaptateurJWT } from '../src/adaptateurs/adaptateurJWT.js';
import { fabriqueAdaptateurUUID } from '../src/adaptateurs/adaptateurUUID.js';
import * as adaptateurRechercheEntrepriseAPI from '../src/adaptateurs/adaptateurRechercheEntrepriseAPI.js';
import * as AdaptateurPostgres from '../src/adaptateurs/adaptateurPostgres.js';
import * as Referentiel from '../src/referentiel.js';
import donneesReferentiel from '../donneesReferentiel.js';
import BusEvenements from '../src/bus/busEvenements.js';
import { fabriqueAdaptateurGestionErreur } from '../src/adaptateurs/fabriqueAdaptateurGestionErreur.js';

export class ConsoleAnalyseDonnees {
  constructor(environnementNode = process.env.NODE_ENV || 'development') {
    const adaptateurGestionErreur = fabriqueAdaptateurGestionErreur();
    const busEvenements = new BusEvenements({ adaptateurGestionErreur });

    this.depotDonnees = DepotDonnees.creeDepot({
      adaptateurChiffrement: fabriqueAdaptateurChiffrement(),
      adaptateurJWT: fabriqueAdaptateurJWT(),
      adaptateurPersistance: AdaptateurPostgres.nouvelAdaptateur({
        env: environnementNode,
      }),
      adaptateurUUID: fabriqueAdaptateurUUID(),
      referentiel: Referentiel.creeReferentiel(donneesReferentiel),
      adaptateurRechercheEntite: adaptateurRechercheEntrepriseAPI,
      busEvenements,
    });
  }

  async analyseDesProprietaires(cheminVersFichiersFiltreDomainesEmails) {
    // On attend un fichier avec un domaine par ligne
    const filtre = String(
      fs.readFileSync(cheminVersFichiersFiltreDomainesEmails)
    )
      .toString()
      .split('\n')
      .filter(Boolean); // Ne garde que les lignes non vides

    return this.depotDonnees.analyseDesProprietaires(filtre);
  }
}
