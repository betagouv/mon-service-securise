/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax */
import { crm } from '../src/adaptateurs/adaptateurEnvironnement.js';
import * as AdaptateurPostgres from '../src/adaptateurs/adaptateurPostgres.js';
import { fabriqueAdaptateurChiffrement } from '../src/adaptateurs/fabriqueAdaptateurChiffrement.js';
import { fabriqueAdaptateurJWT } from '../src/adaptateurs/adaptateurJWT.js';
import * as depotDonneesUtilisateurs from '../src/depots/depotDonneesUtilisateurs.js';
import Utilisateur from '../src/modeles/utilisateur.js';
import { ClientHttpCrm } from '../src/adaptateurs/reportingCrm/clientHttpCrm.js';
import { UUID } from '../src/typesBasiques.js';

type ErreurPaquet = { paquet: number; raison: string };

type UtilisateurCrm = { id: string; name: string };

type MiseAJourUtilisateurCrm = {
  id: string;
  nbServicesEnProprietaire: number;
};

// Twenty accepte au plus 60 enregistrements par requête batch.
const TAILLE_MAX_PAQUET = 60;

// En lecture, Twenty renvoie au plus 200 enregistrements par page.
const TAILLE_MAX_PAGE_LECTURE = 200;

// Oui, il y a bien 2 "s" à la fin : Twenty ajoute un "s" au nom des objets pour former leur pluriel.
const UTILISATEURS_INSCRITS = 'donneesMssUtilisateursInscritss';

const enPaquets = <T>(elements: T[]): T[][] =>
  Array.from(
    { length: Math.ceil(elements.length / TAILLE_MAX_PAQUET) },
    (_, index) =>
      elements.slice(index * TAILLE_MAX_PAQUET, (index + 1) * TAILLE_MAX_PAQUET)
  );

export class ConsoleReportingCrm {
  private readonly clientCrm: ClientHttpCrm;

  private readonly persistance: {
    toutesLesAutorisationsDeProprietaire: () => Promise<
      { idService: UUID; idUtilisateur: UUID }[]
    >;
  };

  private readonly depotUtilisateurs: {
    tousUtilisateurs: () => Promise<Utilisateur[]>;
  };

  constructor() {
    this.clientCrm = new ClientHttpCrm(crm().cleApi()!, crm().urlBase());
    this.persistance = AdaptateurPostgres.nouvelAdaptateur({});
    this.depotUtilisateurs = depotDonneesUtilisateurs.creeDepot({
      adaptateurChiffrement: fabriqueAdaptateurChiffrement(),
      adaptateurJWT: fabriqueAdaptateurJWT(),
      adaptateurPersistance: this.persistance,
    });
  }

  async rattrapeNombreDeServicesEnProprietaire({ simulation = true } = {}) {
    const nombreParIdUtilisateur =
      await this.nombreDeServicesEnProprietaireParUtilisateur();
    const idsMssParEmail = new Map(
      (await this.depotUtilisateurs.tousUtilisateurs()).map((u) => [
        u.email,
        u.id,
      ])
    );

    const utilisateursDuCrm = await this.tousLesUtilisateursDuCrm();
    const inconnusDeMss = utilisateursDuCrm.filter(
      ({ name }) => !idsMssParEmail.has(name)
    );
    const misesAJour = utilisateursDuCrm
      .filter(({ name }) => idsMssParEmail.has(name))
      .map(({ id, name }) => ({
        id,
        email: name,
        nbServicesEnProprietaire:
          nombreParIdUtilisateur.get(idsMssParEmail.get(name)!) ?? 0,
      }));

    if (simulation) {
      ConsoleReportingCrm.afficheSimulation(misesAJour, inconnusDeMss);
      return;
    }

    await this.metsAJourEnPaquets(
      misesAJour.map(({ id, nbServicesEnProprietaire }) => ({
        id,
        nbServicesEnProprietaire,
      }))
    );
  }

  private static afficheSimulation(
    misesAJour: (MiseAJourUtilisateurCrm & { email: string })[],
    inconnusDeMss: UtilisateurCrm[]
  ) {
    const avecAuMoinsUnService = misesAJour.filter(
      (m) => m.nbServicesEnProprietaire > 0
    );
    console.log('🧪 Simulation : rien n’est envoyé au CRM');
    console.log(
      `👤 ${misesAJour.length} utilisateurs du CRM à mettre à jour, dont ${avecAuMoinsUnService.length} propriétaires d’au moins un service`
    );
    console.table(
      [...misesAJour]
        .sort((a, b) => b.nbServicesEnProprietaire - a.nbServicesEnProprietaire)
        .slice(0, 20)
        .map(({ email, nbServicesEnProprietaire }) => ({
          email,
          nbServicesEnProprietaire,
        }))
    );
    if (inconnusDeMss.length > 0) {
      console.log(
        `⚠️  ${inconnusDeMss.length} utilisateurs du CRM inconnus de MSS, ignorés`
      );
      console.table(inconnusDeMss.map(({ name }) => ({ email: name })));
    }
    console.log(
      '▶️  Pour envoyer : await crm.rattrapeNombreDeServicesEnProprietaire({ simulation: false })'
    );
  }

  private async nombreDeServicesEnProprietaireParUtilisateur() {
    const autorisations =
      await this.persistance.toutesLesAutorisationsDeProprietaire();
    const nombreParIdUtilisateur = new Map<UUID, number>();
    autorisations.forEach(({ idUtilisateur }) =>
      nombreParIdUtilisateur.set(
        idUtilisateur,
        (nombreParIdUtilisateur.get(idUtilisateur) ?? 0) + 1
      )
    );
    return nombreParIdUtilisateur;
  }

  private async tousLesUtilisateursDuCrm(): Promise<UtilisateurCrm[]> {
    const utilisateurs: UtilisateurCrm[] = [];
    let curseur: string | undefined;
    let page = 0;
    do {
      const reponse = await this.clientCrm.get(
        `/rest/${UTILISATEURS_INSCRITS}`,
        { limit: TAILLE_MAX_PAGE_LECTURE, starting_after: curseur }
      );
      utilisateurs.push(...reponse.data.data[UTILISATEURS_INSCRITS]);
      page += 1;
      process.stdout.write(
        `\r\x1b[K📥 Lecture du CRM : page ${page}, ${utilisateurs.length} utilisateurs lus`
      );
      const { hasNextPage, endCursor } = reponse.data.pageInfo;
      curseur = hasNextPage ? endCursor : undefined;
    } while (curseur);
    console.log();
    return utilisateurs;
  }

  // Avec `upsert=true`, Twenty met à jour chaque enregistrement reconnu par son `id`, avec ses propres valeurs.
  private async metsAJourEnPaquets(misesAJour: MiseAJourUtilisateurCrm[]) {
    const paquets = enPaquets(misesAJour);
    console.log(
      `👤 ${misesAJour.length} utilisateurs à mettre à jour, en ${paquets.length} paquets`
    );

    const erreurs: ErreurPaquet[] = [];
    for (const [index, paquet] of paquets.entries()) {
      process.stdout.write(`\r\x1b[KPaquet ${index + 1}/${paquets.length}`);
      try {
        await this.clientCrm.post(
          `/rest/batch/${UTILISATEURS_INSCRITS}?upsert=true`,
          paquet
        );
      } catch (e) {
        erreurs.push({ paquet: index + 1, raison: String(e) });
      }
    }

    console.log(
      `\n✅ ${paquets.length - erreurs.length}/${paquets.length} paquets mis à jour`
    );
    if (erreurs.length > 0) console.table(erreurs);
  }
}
