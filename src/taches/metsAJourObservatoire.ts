import type { Knex } from 'knex';
import type { DepotDonnees } from '../depotDonnees.interface.js';
import type { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';
import type { AdaptateurRechercheEntreprise } from '../adaptateurs/adaptateurRechercheEntreprise.interface.js';

// Les mois sont manipulés en chaînes 'YYYY-MM-01' (UTC) pour éviter les décalages de fuseau.
// Une ligne datée du 1er novembre porte la valeur de fin octobre.
type Mois = string;

type ValeurDuMois = { idHashService: string; mois: Mois; valeur: number };

const TABLE_EXECUTIONS = 'observatoire_mss_executions';
const TABLE_SERVICES = 'observatoire_mss_services_crees';
const TABLE_MESURES = 'observatoire_mss_mesures_faites';
const TABLE_HOMOLOGATIONS = 'observatoire_mss_homologations_realisees';

const LIBELLES_NIVEAUX: Record<string, string> = {
  niveau1: 'Élémentaires',
  niveau2: 'Modérés',
  niveau3: 'Importants',
};

const debutDeMois = (date: Date): Mois =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-01`;

const moisSuivant = (mois: Mois): Mois => {
  const date = new Date(`${mois}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + 1);
  return debutDeMois(date);
};

const moisEntre = (premier: Mois, dernier: Mois): Mois[] => {
  const tous: Mois[] = [];
  for (let mois = premier; mois <= dernier; mois = moisSuivant(mois))
    tous.push(mois);
  return tous;
};

const parMois = (valeurs: ValeurDuMois[]) => {
  const groupes = new Map<Mois, ValeurDuMois[]>();
  valeurs.forEach((v) =>
    groupes.set(v.mois, [...(groupes.get(v.mois) ?? []), v])
  );
  return groupes;
};

export class MiseAJourObservatoire {
  private readonly knexMSS: Knex;
  private readonly knexJournal: Knex;
  private readonly depotDonnees: DepotDonnees;
  private readonly adaptateurChiffrement: AdaptateurChiffrement;
  private readonly adaptateurRechercheEntreprise: AdaptateurRechercheEntreprise;

  constructor({
    knexMSS,
    knexJournal,
    depotDonnees,
    adaptateurChiffrement,
    adaptateurRechercheEntreprise,
  }: {
    knexMSS: Knex;
    knexJournal: Knex;
    depotDonnees: DepotDonnees;
    adaptateurChiffrement: AdaptateurChiffrement;
    adaptateurRechercheEntreprise: AdaptateurRechercheEntreprise;
  }) {
    this.knexMSS = knexMSS;
    this.knexJournal = knexJournal;
    this.depotDonnees = depotDonnees;
    this.adaptateurChiffrement = adaptateurChiffrement;
    this.adaptateurRechercheEntreprise = adaptateurRechercheEntreprise;
  }

  async execute(): Promise<string[]> {
    const trace: string[] = [];
    const dateExecution = new Date();
    const derniereExecution = await this.dateDerniereExecution();
    trace.push(
      derniereExecution
        ? `📅 Dernière exécution réussie : ${derniereExecution.toISOString()}`
        : '📅 Aucune exécution précédente : calcul complet'
    );

    const nouveauxServices = await this.metsAJourServices();
    trace.push(`🆕 ${nouveauxServices} nouveau(x) service(s)`);

    const premierMois = derniereExecution
      ? debutDeMois(derniereExecution)
      : await this.premierMoisDuJournal();
    const dernierMois = debutDeMois(dateExecution);

    if (premierMois) {
      const mois = moisEntre(premierMois, dernierMois);
      trace.push(`🔁 Mois recalculés : ${mois[0]} → ${mois.at(-1)}`);

      const lignesMesures = await this.metsAJourMesuresFaites(
        mois,
        dateExecution
      );
      trace.push(`🛡️ ${lignesMesures} ligne(s) de mesures faites écrites`);

      const lignesHomologations = await this.metsAJourHomologations(
        mois,
        dateExecution
      );
      trace.push(`📜 ${lignesHomologations} ligne(s) d'homologations écrites`);
    }

    await this.knexMSS(TABLE_EXECUTIONS).insert({
      date_execution: dateExecution,
    });
    return trace;
  }

  private async dateDerniereExecution(): Promise<Date | undefined> {
    const [{ derniere }] = await this.knexMSS(TABLE_EXECUTIONS).max(
      'date_execution as derniere'
    );
    return derniere ? new Date(derniere) : undefined;
  }

  private async premierMoisDuJournal(): Promise<Mois | undefined> {
    const [{ premiere }] = await this.knexJournal('journal_mss.evenements')
      .whereIn('type', [
        'COMPLETUDE_SERVICE_MODIFIEE',
        'NOUVELLE_HOMOLOGATION_CREEE',
      ])
      .min('date as premiere');
    return premiere ? debutDeMois(new Date(premiere)) : undefined;
  }

  private async idsHashServicesConnus(): Promise<Set<string>> {
    const lignes = await this.knexMSS(TABLE_SERVICES).select('id_hash');
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

    const lignes = await Promise.all(
      services.map(async (service) => {
        const idHash = this.adaptateurChiffrement.hacheSha256(service.id);
        const niveauSecurite =
          LIBELLES_NIVEAUX[service.descriptionService.niveauSecurite];

        if (idsConnus.has(idHash))
          return { id_hash: idHash, niveau_securite: niveauSecurite };

        const organisation =
          await this.adaptateurRechercheEntreprise.recupereDetailsOrganisation(
            service.descriptionService.organisationResponsable.siret
          );
        return {
          id_hash: idHash,
          date_creation: dateCreationParIdHash.get(idHash) ?? new Date(),
          niveau_securite: niveauSecurite,
          departement: organisation?.departement,
          region: organisation?.region,
          secteur_activite: organisation?.sectionActivitePrincipale,
          type_organisation: organisation?.trancheEffectifSalarie,
        };
      })
    );

    await this.upsert(TABLE_SERVICES, lignes, ['id_hash'], ['niveau_securite']);
    return lignes.filter((l) => !idsConnus.has(l.id_hash)).length;
  }

  private async metsAJourMesuresFaites(
    mois: Mois[],
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
    mois: Mois[],
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
    mois: Mois[];
    valeursDuJournal: ValeurDuMois[];
    combine: (precedente: number | undefined, duMois: number) => number;
  }): Promise<number> {
    const idsConnus = await this.idsHashServicesConnus();
    const valeursCourantes = new Map<string, number>(
      (
        await this.knexMSS(table)
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
          date: moisSuivant(unMois),
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
    await this.knexMSS.transaction(async (trx) => {
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
