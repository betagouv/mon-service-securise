import type { Knex } from 'knex';
import { tailleEntite, typeEntite } from '@lab-anssi/lib';
import type { DepotDonnees } from '../depotDonnees.interface.js';
import type { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';
import type { AdaptateurRechercheEntreprise } from '../adaptateurs/adaptateurRechercheEntreprise.interface.js';
import { debutDeMois, premierJourMoisSuivant } from '../utilitaires/date.js';
import { enCadence } from '../utilitaires/pThrottle.js';

type ValeurDuMois = { idHashService: string; mois: string; valeur: number };

const SCHEMA = 'mss';
const TABLE_EXECUTIONS = `${SCHEMA}.executions`;
const TABLE_SERVICES = `${SCHEMA}.services_crees`;
const TABLE_MESURES = `${SCHEMA}.mesures_faites`;
const TABLE_HOMOLOGATIONS = `${SCHEMA}.homologations_realisees`;

const INTERVALLE_APPELS_RECHERCHE_ENTREPRISE_EN_MS = 25;
const PAS_AFFICHAGE_PROGRESSION = 100;

const affiche = (ligne: string) => {
  // eslint-disable-next-line no-console
  console.log(ligne);
};

const LIBELLES_NIVEAUX: Record<string, string> = {
  niveau1: 'Élémentaires',
  niveau2: 'Modérés',
  niveau3: 'Importants',
};

const moisEntre = (premier: string, dernier: string): string[] => {
  const tous: string[] = [];
  for (let mois = premier; mois <= dernier; mois = premierJourMoisSuivant(mois))
    tous.push(mois);
  return tous;
};

const parMois = (valeurs: ValeurDuMois[]) => {
  const groupes = new Map<string, ValeurDuMois[]>();
  valeurs.forEach((v) =>
    groupes.set(v.mois, [...(groupes.get(v.mois) ?? []), v])
  );
  return groupes;
};

export class MiseAJourObservatoire {
  private readonly knexObservatoire: Knex;
  private readonly knexJournal: Knex;
  private readonly depotDonnees: DepotDonnees;
  private readonly adaptateurChiffrement: AdaptateurChiffrement;
  private readonly adaptateurRechercheEntreprise: AdaptateurRechercheEntreprise;

  constructor({
    knexObservatoire,
    knexJournal,
    depotDonnees,
    adaptateurChiffrement,
    adaptateurRechercheEntreprise,
  }: {
    knexObservatoire: Knex;
    knexJournal: Knex;
    depotDonnees: DepotDonnees;
    adaptateurChiffrement: AdaptateurChiffrement;
    adaptateurRechercheEntreprise: AdaptateurRechercheEntreprise;
  }) {
    this.knexObservatoire = knexObservatoire;
    this.knexJournal = knexJournal;
    this.depotDonnees = depotDonnees;
    this.adaptateurChiffrement = adaptateurChiffrement;
    this.adaptateurRechercheEntreprise = adaptateurRechercheEntreprise;
  }

  async execute(): Promise<string[]> {
    const trace: string[] = [];
    const etape = (ligne: string) => {
      affiche(ligne);
      trace.push(ligne);
    };
    const dateExecution = new Date();
    const derniereExecution = await this.dateDerniereExecution();
    etape(
      derniereExecution
        ? `📅 Dernière exécution réussie : ${derniereExecution.toISOString()}`
        : '📅 Aucune exécution précédente : calcul complet'
    );

    const nouveauxServices = await this.metsAJourServices();
    etape(`🆕 ${nouveauxServices} nouveau(x) service(s)`);

    const premierMois = derniereExecution
      ? debutDeMois(derniereExecution)
      : await this.premierMoisDuJournal();
    const dernierMois = debutDeMois(dateExecution);

    if (premierMois) {
      const mois = moisEntre(premierMois, dernierMois);
      etape(`🔁 Mois recalculés : ${mois[0]} → ${mois.at(-1)}`);

      const lignesMesures = await this.metsAJourMesuresFaites(
        mois,
        dateExecution
      );
      etape(`🛡️ ${lignesMesures} ligne(s) de mesures faites écrites`);

      const lignesHomologations = await this.metsAJourHomologations(
        mois,
        dateExecution
      );
      etape(`📜 ${lignesHomologations} ligne(s) d'homologations écrites`);
    }

    await this.knexObservatoire(TABLE_EXECUTIONS).insert({
      date_execution: dateExecution,
    });
    return trace;
  }

  private async dateDerniereExecution(): Promise<Date | undefined> {
    const [{ derniere }] = await this.knexObservatoire(TABLE_EXECUTIONS).max(
      'date_execution as derniere'
    );
    return derniere ? new Date(derniere) : undefined;
  }

  private async premierMoisDuJournal(): Promise<string | undefined> {
    const [{ premiere }] = await this.knexJournal('journal_mss.evenements')
      .whereIn('type', [
        'COMPLETUDE_SERVICE_MODIFIEE',
        'NOUVELLE_HOMOLOGATION_CREEE',
      ])
      .min('date as premiere');
    return premiere ? debutDeMois(new Date(premiere)) : undefined;
  }

  private async idsHashServicesConnus(): Promise<Set<string>> {
    const lignes =
      await this.knexObservatoire(TABLE_SERVICES).select('id_hash');
    return new Set(lignes.map(({ id_hash: idHash }) => idHash));
  }

  private async metsAJourServices(): Promise<number> {
    const idsConnus = await this.idsHashServicesConnus();
    const services = await this.depotDonnees.tousLesServices();

    const dateCreationParIdHash = new Map<string, Date>(
      (
        await this.knexJournal('journal_mss.evenements')
          .select(
            this.knexJournal.raw(`donnees->>'idService' AS id_hash`),
            'date'
          )
          .where({ type: 'NOUVEAU_SERVICE_CREE' })
      ).map(({ id_hash: idHash, date }) => [idHash, date])
    );

    const servicesHaches = services.map((service) => ({
      idHash: this.adaptateurChiffrement.hacheSha256(service.id),
      niveauSecurite:
        LIBELLES_NIVEAUX[service.descriptionService.niveauSecurite],
      siret: service.descriptionService.organisationResponsable.siret,
    }));
    const servicesNouveaux = servicesHaches.filter(
      ({ idHash }) => !idsConnus.has(idHash)
    );
    const organisationParSiret = await this.recupereOrganisations(
      servicesNouveaux.map(({ siret }) => siret)
    );

    const lignes = servicesHaches.map(({ idHash, niveauSecurite, siret }) => {
      if (idsConnus.has(idHash))
        return { id_hash: idHash, niveau_securite: niveauSecurite };

      const organisation = organisationParSiret.get(siret);
      return {
        id_hash: idHash,
        date_creation: dateCreationParIdHash.get(idHash) ?? new Date(),
        niveau_securite: niveauSecurite,
        departement: organisation?.departement,
        region: organisation?.region,
        secteur_activite: organisation?.sectionActivitePrincipale,
        type_organisation: organisation ? typeEntite(organisation) : null,
        taille_organisation: organisation ? tailleEntite(organisation) : null,
      };
    });

    await this.upsert(TABLE_SERVICES, lignes, ['id_hash'], ['niveau_securite']);
    return servicesNouveaux.length;
  }

  private async recupereOrganisations(sirets: string[]) {
    const siretsUniques = [...new Set(sirets)];
    const total = siretsUniques.length;
    affiche(
      `🏢 ${total} organisation(s) à rechercher dans l'API Recherche Entreprise`
    );

    let nombreRecuperees = 0;
    const recupereEnCadence = enCadence(
      INTERVALLE_APPELS_RECHERCHE_ENTREPRISE_EN_MS,
      async (siret: string) => {
        const organisation =
          await this.adaptateurRechercheEntreprise.recupereDetailsOrganisation(
            siret
          );
        nombreRecuperees += 1;
        if (
          nombreRecuperees % PAS_AFFICHAGE_PROGRESSION === 0 ||
          nombreRecuperees === total
        )
          affiche(
            `   ↳ ${nombreRecuperees}/${total} organisation(s) récupérée(s)`
          );
        return organisation;
      }
    );

    const organisations = await Promise.all(
      siretsUniques.map((siret) => recupereEnCadence(siret))
    );
    return new Map(
      siretsUniques.map((siret, index) => [siret, organisations[index]])
    );
  }

  private async metsAJourMesuresFaites(
    mois: string[],
    dateExecution: Date
  ): Promise<number> {
    const { rows: derniereValeurParMois } = await this.knexJournal.raw(
      `
        SELECT DISTINCT ON (donnees->>'idService', date_trunc('month', date AT TIME ZONE 'UTC'))
               donnees->>'idService' AS "idHashService",
               to_char(date_trunc('month', date AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS mois,
               (SELECT COUNT(*)
                FROM jsonb_array_elements(COALESCE((donnees->'detailMesures')::jsonb, '[]'::jsonb)) AS mesure
                WHERE mesure->>'statut' = 'fait')::int AS valeur
        FROM journal_mss.evenements
        WHERE type = 'COMPLETUDE_SERVICE_MODIFIEE'
          AND date >= (:premierMois::timestamp AT TIME ZONE 'UTC')
          AND date <= :dateExecution
        ORDER BY donnees->>'idService', date_trunc('month', date AT TIME ZONE 'UTC'), date DESC
      `,
      { premierMois: mois[0], dateExecution }
    );

    return this.ecritValeursMensuelles({
      table: TABLE_MESURES,
      colonneValeur: 'total_faites',
      mois,
      valeursDuJournal: derniereValeurParMois,
      combine: (_precedente, duMois) => duMois,
    });
  }

  private async metsAJourHomologations(
    mois: string[],
    dateExecution: Date
  ): Promise<number> {
    const { rows: nombreParMois } = await this.knexJournal.raw(
      `
        SELECT donnees->>'idService' AS "idHashService",
               to_char(date_trunc('month', date AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS mois,
               COUNT(*)::int AS valeur
        FROM journal_mss.evenements
        WHERE type = 'NOUVELLE_HOMOLOGATION_CREEE'
          AND COALESCE((donnees->>'refusee')::boolean, false) = false
          AND date >= (:premierMois::timestamp AT TIME ZONE 'UTC')
          AND date <= :dateExecution
        GROUP BY 1, 2
      `,
      { premierMois: mois[0], dateExecution }
    );

    return this.ecritValeursMensuelles({
      table: TABLE_HOMOLOGATIONS,
      colonneValeur: 'total_realisees',
      mois,
      valeursDuJournal: nombreParMois,
      combine: (precedente, duMois) => (precedente ?? 0) + duMois,
    });
  }

  // Repart de la valeur connue en fin de mois précédent (ligne datée du premier mois),
  // applique les valeurs du journal mois par mois, et reporte la valeur sur les mois sans événement.
  private async ecritValeursMensuelles({
    table,
    colonneValeur,
    mois,
    valeursDuJournal,
    combine,
  }: {
    table: string;
    colonneValeur: string;
    mois: string[];
    valeursDuJournal: ValeurDuMois[];
    combine: (precedente: number | undefined, duMois: number) => number;
  }): Promise<number> {
    const idsConnus = await this.idsHashServicesConnus();
    const valeursCourantes = new Map<string, number>(
      (
        await this.knexObservatoire(table)
          .select('id_hash_service', colonneValeur)
          .where({ date: mois[0] })
      ).map((ligne) => [ligne.id_hash_service, ligne[colonneValeur]])
    );
    const valeursParMois = parMois(valeursDuJournal);

    const lignes = mois.flatMap((unMois) => {
      (valeursParMois.get(unMois) ?? []).forEach(({ idHashService, valeur }) =>
        valeursCourantes.set(
          idHashService,
          combine(valeursCourantes.get(idHashService), valeur)
        )
      );
      return [...valeursCourantes.entries()]
        .filter(([idHashService]) => idsConnus.has(idHashService))
        .map(([idHashService, valeur]) => ({
          id_hash_service: idHashService,
          date: premierJourMoisSuivant(unMois),
          [colonneValeur]: valeur,
        }));
    });

    await this.upsert(
      table,
      lignes,
      ['id_hash_service', 'date'],
      [colonneValeur]
    );
    return lignes.length;
  }

  private async upsert(
    table: string,
    lignes: Record<string, unknown>[],
    colonnesConflit: string[],
    colonnesAMettreAJour: string[]
  ) {
    const taillePaquet = 1000;
    await this.knexObservatoire.transaction(async (trx) => {
      for (let i = 0; i < lignes.length; i += taillePaquet) {
        // eslint-disable-next-line no-await-in-loop
        await trx(table)
          .insert(lignes.slice(i, i + taillePaquet))
          .onConflict(colonnesConflit)
          .merge(colonnesAMettreAJour);
      }
    });
  }
}
