/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax */
import * as adaptateurEnvironnement from '../src/adaptateurs/adaptateurEnvironnement.js';
import * as AdaptateurPostgres from '../src/adaptateurs/adaptateurPostgres.js';
import { fabriqueAdaptateurChiffrement } from '../src/adaptateurs/fabriqueAdaptateurChiffrement.js';
import { fabriqueAdaptateurJWT } from '../src/adaptateurs/adaptateurJWT.js';
import { fabriqueAdaptateurUUID } from '../src/adaptateurs/adaptateurUUID.js';
import * as adaptateurRechercheEntrepriseAPI from '../src/adaptateurs/adaptateurRechercheEntrepriseAPI.js';
import { fabriqueAdaptateurGestionErreur } from '../src/adaptateurs/fabriqueAdaptateurGestionErreur.js';
import { ClientHttpCrm } from '../src/adaptateurs/reportingCrm/clientHttpCrm.js';
import BusEvenements from '../src/bus/busEvenements.js';
import * as DepotDonnees from '../src/depotDonnees.js';
import donneesReferentiel from '../donneesReferentiel.js';
import * as Referentiel from '../src/referentiel.js';
import { fabriqueReferentiel } from '../src/fabriqueReferentiel.js';
import { fabriqueServiceCgu } from '../src/serviceCgu.js';
import Service from '../src/modeles/service.js';

type ErreurPaquet = { paquet: number; raison: string };

type EntiteCrm = { id: string; siret?: string };

type CompteursEntite = {
  nombreDeServices: number;
  nombreDHomologations: number;
};

type MiseAJourEntiteCrm = { id: string } & CompteursEntite;

// Twenty accepte au plus 60 enregistrements par requête batch.
const TAILLE_MAX_PAQUET = 60;

// En lecture, Twenty renvoie au plus 200 enregistrements par page.
const TAILLE_MAX_PAGE_LECTURE = 200;

// Les services d'un lot sont chargés et déchiffrés en entier pour compter leurs dossiers.
const TAILLE_LOT_SIRETS = 100;

// Oui, il y a bien 2 "s" à la fin : Twenty ajoute un "s" au nom des objets pour former leur pluriel.
const ENTITES_UTILISATRICES = 'donneesMssEntitesUtilisatricess';

const decoupe = <T>(elements: T[], taille: number): T[][] =>
  Array.from({ length: Math.ceil(elements.length / taille) }, (_, index) =>
    elements.slice(index * taille, (index + 1) * taille)
  );

export class ConsoleReportingCrm {
  private readonly clientCrm: ClientHttpCrm;

  private readonly depotDonnees: {
    denombreServicesEtUtilisateursParSiret: (
      sirets: string[]
    ) => Promise<Map<string, { nombreServices: number }>>;
    tousLesServicesAvecSirets: (
      sirets: string[]
    ) => Promise<Map<string, Service[]>>;
  };

  constructor() {
    const { crm } = adaptateurEnvironnement;
    this.clientCrm = new ClientHttpCrm(crm().cleApi()!, crm().urlBase());
    const referentiel = Referentiel.creeReferentiel(donneesReferentiel);
    this.depotDonnees = DepotDonnees.creeDepot({
      adaptateurEnvironnement,
      adaptateurChiffrement: fabriqueAdaptateurChiffrement(),
      adaptateurJWT: fabriqueAdaptateurJWT(),
      adaptateurPersistance: AdaptateurPostgres.nouvelAdaptateur({
        knexSurcharge: undefined,
      }),
      adaptateurUUID: fabriqueAdaptateurUUID(),
      referentiel,
      referentielV2: fabriqueReferentiel().v2(),
      adaptateurRechercheEntite: adaptateurRechercheEntrepriseAPI,
      busEvenements: new BusEvenements({
        adaptateurGestionErreur: fabriqueAdaptateurGestionErreur(),
      }),
      serviceCgu: fabriqueServiceCgu({ referentiel }),
    });
  }

  async rattrapeCompteursDesEntites({ simulation = true } = {}) {
    const entitesDuCrm = await this.toutesLesEntitesDuCrm();
    const sansSiret = entitesDuCrm.filter((e) => !e.siret);
    const avecSiret = entitesDuCrm.filter((e) => !!e.siret);

    const compteurs = await this.compteursParSiret([
      ...new Set(avecSiret.map((e) => e.siret!)),
    ]);
    const misesAJour = avecSiret.map(({ id, siret }) => ({
      id,
      ...compteurs.get(siret!)!,
    }));

    if (simulation) {
      ConsoleReportingCrm.afficheSimulation(misesAJour, avecSiret, sansSiret);
      return;
    }

    await this.metsAJourEnPaquets(misesAJour);
  }

  private async toutesLesEntitesDuCrm(): Promise<EntiteCrm[]> {
    const entites: EntiteCrm[] = [];
    let curseur: string | undefined;
    let page = 0;
    do {
      const reponse = await this.clientCrm.get(
        `/rest/${ENTITES_UTILISATRICES}`,
        {
          limit: TAILLE_MAX_PAGE_LECTURE,
          ...(curseur && { starting_after: curseur }),
        }
      );
      entites.push(...reponse.data.data[ENTITES_UTILISATRICES]);
      page += 1;
      process.stdout.write(
        `\r\x1b[K📥 Lecture du CRM : page ${page}, ${entites.length} entités lues`
      );
      const { hasNextPage, endCursor } = reponse.data.pageInfo;
      curseur = hasNextPage ? endCursor : undefined;
    } while (curseur);
    console.log();
    return entites;
  }

  private async compteursParSiret(
    sirets: string[]
  ): Promise<Map<string, CompteursEntite>> {
    const compteurs = new Map<string, CompteursEntite>();
    const lots = decoupe(sirets, TAILLE_LOT_SIRETS);

    for (const [index, lot] of lots.entries()) {
      process.stdout.write(
        `\r\x1b[K🧮 Calcul dans MSS : lot ${index + 1}/${lots.length}`
      );
      const denombrements =
        await this.depotDonnees.denombreServicesEtUtilisateursParSiret(lot);
      const servicesParSiret =
        await this.depotDonnees.tousLesServicesAvecSirets(lot);

      lot.forEach((siret) =>
        compteurs.set(siret, {
          nombreDeServices: denombrements.get(siret)!.nombreServices,
          nombreDHomologations: servicesParSiret
            .get(siret)!
            .reduce((total, s) => total + s.nombreDossiers(), 0),
        })
      );
    }
    console.log();
    return compteurs;
  }

  private static afficheSimulation(
    misesAJour: MiseAJourEntiteCrm[],
    avecSiret: EntiteCrm[],
    sansSiret: EntiteCrm[]
  ) {
    const siretParId = new Map(avecSiret.map((e) => [e.id, e.siret]));
    const avecServices = misesAJour.filter((m) => m.nombreDeServices > 0);
    const avecHomologations = misesAJour.filter(
      (m) => m.nombreDHomologations > 0
    );

    console.log('🧪 Simulation : rien n’est envoyé au CRM');
    console.log(
      `🏢 ${misesAJour.length} entités du CRM à mettre à jour, dont ${avecServices.length} avec au moins un service et ${avecHomologations.length} avec au moins une homologation`
    );
    console.table(
      [...misesAJour]
        .sort((a, b) => b.nombreDeServices - a.nombreDeServices)
        .slice(0, 20)
        .map(({ id, nombreDeServices, nombreDHomologations }) => ({
          siret: siretParId.get(id),
          nombreDeServices,
          nombreDHomologations,
        }))
    );
    if (sansSiret.length > 0) {
      console.log(
        `⚠️  ${sansSiret.length} entités du CRM sans SIRET, ignorées`
      );
      console.table(sansSiret.map(({ id }) => ({ id })));
    }
    console.log(
      '▶️  Pour envoyer : await crm.rattrapeCompteursDesEntites({ simulation: false })'
    );
  }

  // Avec `upsert=true`, Twenty met à jour chaque enregistrement reconnu par son `id`, avec ses propres valeurs.
  private async metsAJourEnPaquets(misesAJour: MiseAJourEntiteCrm[]) {
    const paquets = decoupe(misesAJour, TAILLE_MAX_PAQUET);
    console.log(
      `🏢 ${misesAJour.length} entités à mettre à jour, en ${paquets.length} paquets`
    );

    const erreurs: ErreurPaquet[] = [];
    for (const [index, paquet] of paquets.entries()) {
      process.stdout.write(`\r\x1b[KPaquet ${index + 1}/${paquets.length}`);
      try {
        await this.clientCrm.post(
          `/rest/batch/${ENTITES_UTILISATRICES}?upsert=true`,
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
