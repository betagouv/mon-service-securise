/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax */
import { crm } from '../src/adaptateurs/adaptateurEnvironnement.js';
import { ClientHttpCrm } from '../src/adaptateurs/reportingCrm/adaptateurReportingCrm.twentyRest.js';
import { IdEntiteCRM } from '../src/adaptateurs/reportingCrm/adaptateurReportingCrm.interface.js';
import * as AdaptateurPostgres from '../src/adaptateurs/adaptateurPostgres.js';
import { fabriqueAdaptateurChiffrement } from '../src/adaptateurs/fabriqueAdaptateurChiffrement.js';
import { fabriqueAdaptateurJWT } from '../src/adaptateurs/adaptateurJWT.js';
import * as depotDonneesUtilisateurs from '../src/depots/depotDonneesUtilisateurs.js';
import Utilisateur from '../src/modeles/utilisateur.js';

type ErreurPaquet = { paquet: number; raison: string };

type EntiteCrm = { id: IdEntiteCRM; siret: string };

// Twenty accepte au plus 60 enregistrements par requête batch.
const TAILLE_MAX_PAQUET = 60;

const enPaquets = <T>(elements: T[]): T[][] =>
  Array.from(
    { length: Math.ceil(elements.length / TAILLE_MAX_PAQUET) },
    (_, index) =>
      elements.slice(index * TAILLE_MAX_PAQUET, (index + 1) * TAILLE_MAX_PAQUET)
  );

export class ConsoleReportingCrm {
  private readonly clientCrm: ClientHttpCrm;

  private readonly depotUtilisateurs: {
    tousUtilisateurs: () => Promise<Utilisateur[]>;
  };

  constructor() {
    this.clientCrm = new ClientHttpCrm(crm().cleApi()!, crm().urlBase());
    this.depotUtilisateurs = depotDonneesUtilisateurs.creeDepot({
      adaptateurChiffrement: fabriqueAdaptateurChiffrement(),
      adaptateurJWT: fabriqueAdaptateurJWT(),
      adaptateurPersistance: AdaptateurPostgres.nouvelAdaptateur({}),
    });
  }

  async rattrapeUtilisateurs() {
    const tousUtilisateurs = await this.depotUtilisateurs.tousUtilisateurs();
    const inscrits = tousUtilisateurs.filter((u) => !u.estUnInvite());

    const idsEntitesParSiret = await this.creeEntites(inscrits);
    await this.creeUtilisateurs(inscrits, idsEntitesParSiret);
  }

  private async creeEntites(
    inscrits: Utilisateur[]
  ): Promise<Map<string, IdEntiteCRM>> {
    const nomsEntitesParSiret = new Map<string, string | undefined>();
    for (const { entite } of inscrits) {
      const estNouvelleEntite =
        !!entite?.siret && !nomsEntitesParSiret.has(entite.siret);
      if (estNouvelleEntite) nomsEntitesParSiret.set(entite.siret, entite.nom);
    }
    const entites = [...nomsEntitesParSiret].map(([siret, nom]) => ({
      siret,
      name: nom,
    }));

    const idsEntitesParSiret = new Map<string, IdEntiteCRM>();
    await this.envoieEnPaquets(
      '🏢 entités',
      // Oui, il y a bien 2 "s" à la fin
      '/rest/batch/donneesMssEntitesUtilisatricess',
      entites,
      (reponse) => {
        const entitesCreees: EntiteCrm[] =
          reponse.data.data.createDonneesMssEntitesUtilisatricess;
        entitesCreees.forEach((e) => idsEntitesParSiret.set(e.siret, e.id));
      }
    );
    return idsEntitesParSiret;
  }

  private async creeUtilisateurs(
    inscrits: Utilisateur[],
    idsEntitesParSiret: Map<string, IdEntiteCRM>
  ) {
    const siret = (u: Utilisateur) => u.entite?.siret;
    const aUneEntiteNonCreee = (u: Utilisateur) =>
      !!siret(u) && !idsEntitesParSiret.has(siret(u));

    const ecartes = inscrits.filter(aUneEntiteNonCreee);
    if (ecartes.length > 0) {
      console.log(
        `⚠️  ${ecartes.length} utilisateurs écartés : leur entité n'a pas pu être créée`
      );
      console.table(ecartes.map((u) => ({ email: u.email, siret: siret(u) })));
    }

    const utilisateurs = inscrits
      .filter((u) => !aUneEntiteNonCreee(u))
      .map((u) => ({
        name: u.email,
        entiteId: siret(u) ? idsEntitesParSiret.get(siret(u)) : undefined,
      }));

    await this.envoieEnPaquets(
      '👤 utilisateurs',
      // Oui, il y a bien 2 "s" à la fin
      '/rest/batch/donneesMssUtilisateursInscritss',
      utilisateurs,
      () => {}
    );
  }

  private async envoieEnPaquets<T>(
    libelle: string,
    chemin: string,
    enregistrements: T[],
    traiteReponse: (reponse: Awaited<ReturnType<ClientHttpCrm['post']>>) => void
  ): Promise<ErreurPaquet[]> {
    const paquets = enPaquets(enregistrements);
    console.log(
      `${libelle} : ${enregistrements.length} à créer, en ${paquets.length} paquets`
    );

    const erreurs: ErreurPaquet[] = [];
    for (const [index, paquet] of paquets.entries()) {
      process.stdout.write(`\r\x1b[KPaquet ${index + 1}/${paquets.length}`);
      try {
        traiteReponse(await this.clientCrm.post(chemin, paquet));
      } catch (e) {
        erreurs.push({ paquet: index + 1, raison: String(e) });
      }
    }

    console.log(
      `\n✅ ${paquets.length - erreurs.length}/${paquets.length} paquets de ${libelle} créés`
    );
    if (erreurs.length > 0) console.table(erreurs);

    return erreurs;
  }
}
