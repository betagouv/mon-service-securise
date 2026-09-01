import Knex from 'knex';
import { DonneesAdminOrganisations } from '../modeles/gestionOrganisations/adminOrganisations.js';
import { DonneesEntite } from '../modeles/entite.js';
import { DonneesSuperviseur } from '../modeles/superviseur.js';
import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';
import { PersistanceTS } from './persistanceTS.interface.js';
import { DonneesNotificationTransactionnelle } from '../modeles/notificationsTransactionnelles/notificationTransactionnelle.js';
import { DonneesChiffrees, UUID } from '../typesBasiques.js';

enum TABLES {
  ADMINS_ORGANISATIONS = 'admins_organisations',
  SUPERVISEURS = 'superviseurs',
  NOTIFICATIONS_TRANSACTIONNELLES = 'notifications_transactionnelles',
}

export class AdaptateurPostgresTS implements PersistanceTS {
  private readonly knex: Knex.Knex;
  private readonly chiffrement: AdaptateurChiffrement;

  constructor({
    knex,
    chiffrement,
  }: {
    knex: Knex.Knex;
    chiffrement: AdaptateurChiffrement;
  }) {
    this.knex = knex;
    this.chiffrement = chiffrement;
  }

  async sauvegardeAdminOrganisations(donnees: DonneesAdminOrganisations) {
    if (donnees.entitesAdministrees.length === 0) {
      await this.knex(TABLES.ADMINS_ORGANISATIONS)
        .where('id_utilisateur', donnees.idUtilisateur)
        .delete();
      return;
    }

    const donneesAInserer = await Promise.all(
      donnees.entitesAdministrees.map(async (d) => ({
        id_utilisateur: donnees.idUtilisateur,
        siret_hash: this.chiffrement.hacheSha256(d.siret),
        donnees: await this.chiffrement.chiffre(d),
      }))
    );
    const siretsHashAConserver = donneesAInserer.map((d) => d.siret_hash);
    await this.knex(TABLES.ADMINS_ORGANISATIONS)
      .whereNotIn('siret_hash', siretsHashAConserver)
      .where('id_utilisateur', donnees.idUtilisateur)
      .delete();
    await this.knex(TABLES.ADMINS_ORGANISATIONS)
      .insert(donneesAInserer)
      .onConflict()
      .ignore();
  }

  async lisAdminOrganisations(
    idUtilisateur: UUID
  ): Promise<DonneesAdminOrganisations | undefined> {
    const chaqueLigne = await this.knex(TABLES.ADMINS_ORGANISATIONS)
      .select({ donnees: 'donnees' })
      .where({ id_utilisateur: idUtilisateur });

    if (chaqueLigne.length === 0) return undefined;

    const entitesDechiffrees = await Promise.all<DonneesEntite>(
      chaqueLigne.map((c) => this.chiffrement.dechiffre(c.donnees))
    );

    return { idUtilisateur, entitesAdministrees: entitesDechiffrees };
  }

  async lisSuperviseur(
    idUtilisateur: UUID
  ): Promise<DonneesSuperviseur | undefined> {
    const chaqueLigne = await this.knex(TABLES.SUPERVISEURS)
      .select({ donnees: 'donnees' })
      .where({ id_superviseur: idUtilisateur });

    if (chaqueLigne.length === 0) return undefined;

    const entitesDechiffrees = await Promise.all<DonneesEntite>(
      chaqueLigne.map((c) => this.chiffrement.dechiffre(c.donnees))
    );

    return { idUtilisateur, entitesSupervisees: entitesDechiffrees };
  }

  async sauvegardeSuperviseur(donnees: DonneesSuperviseur): Promise<void> {
    if (donnees.entitesSupervisees.length === 0) {
      await this.supprimeSuperviseur(donnees.idUtilisateur);
      return;
    }

    const donneesAInserer = await Promise.all(
      donnees.entitesSupervisees.map(async (d) => ({
        id_superviseur: donnees.idUtilisateur,
        siret_hash: this.chiffrement.hacheSha256(d.siret),
        donnees: await this.chiffrement.chiffre(d),
      }))
    );
    const siretsHashAConserver = donneesAInserer.map((d) => d.siret_hash);
    await this.knex(TABLES.SUPERVISEURS)
      .where({ id_superviseur: donnees.idUtilisateur })
      .whereNotIn('siret_hash', siretsHashAConserver)
      .delete();
    await this.knex(TABLES.SUPERVISEURS)
      .insert(donneesAInserer)
      .onConflict()
      .ignore();
  }

  async lisSuperviseursOrganisation(
    siret: string
  ): Promise<Array<DonneesSuperviseur>> {
    const siretHache = this.chiffrement.hacheSha256(siret);
    const chaqueLigne: { idSuperviseur: UUID }[] = await this.knex(
      TABLES.SUPERVISEURS
    )
      .select({ idSuperviseur: 'id_superviseur' })
      .where({ siret_hash: siretHache });

    return Promise.all(
      chaqueLigne.map(
        ({ idSuperviseur }) =>
          this.lisSuperviseur(idSuperviseur) as unknown as DonneesSuperviseur
      )
    );
  }

  async supprimeSuperviseur(idUtilisateur: UUID): Promise<void> {
    await this.knex(TABLES.SUPERVISEURS)
      .where({ id_superviseur: idUtilisateur })
      .delete();
  }

  async lisAdminsOrganisations(
    sirets: string[]
  ): Promise<Map<string, Array<DonneesAdminOrganisations>>> {
    const siretParHash = new Map(
      sirets.map((siret) => [this.chiffrement.hacheSha256(siret), siret])
    );

    const parSiret = new Map<string, Array<DonneesAdminOrganisations>>(
      sirets.map((siret) => [siret, []])
    );
    if (sirets.length === 0) return parSiret;

    const lignesDesSirets: { idUtilisateur: UUID; siretHash: string }[] =
      await this.knex(TABLES.ADMINS_ORGANISATIONS)
        .select({ idUtilisateur: 'id_utilisateur', siretHash: 'siret_hash' })
        .whereIn('siret_hash', [...siretParHash.keys()]);

    const idsDesAdmins = [
      ...new Set(lignesDesSirets.map((l) => l.idUtilisateur)),
    ];
    const entitesParAdmin = await this.lisEntitesAdministreesPar(idsDesAdmins);

    lignesDesSirets.forEach(({ idUtilisateur, siretHash }) => {
      const siret = siretParHash.get(siretHash)!;
      parSiret.get(siret)!.push({
        idUtilisateur,
        entitesAdministrees: entitesParAdmin.get(idUtilisateur) ?? [],
      });
    });

    return parSiret;
  }

  private async lisEntitesAdministreesPar(idsDesAdmins: UUID[]) {
    const entitesParAdmin = new Map<UUID, DonneesEntite[]>();
    if (idsDesAdmins.length === 0) return entitesParAdmin;

    const lignes: { idUtilisateur: UUID; donnees: DonneesChiffrees }[] =
      await this.knex(TABLES.ADMINS_ORGANISATIONS)
        .select({ idUtilisateur: 'id_utilisateur', donnees: 'donnees' })
        .whereIn('id_utilisateur', idsDesAdmins);

    await Promise.all(
      lignes.map(async ({ idUtilisateur, donnees }) => {
        const entite: DonneesEntite = await this.chiffrement.dechiffre(donnees);
        if (!entitesParAdmin.has(idUtilisateur))
          entitesParAdmin.set(idUtilisateur, []);
        entitesParAdmin.get(idUtilisateur)!.push(entite);
      })
    );

    return entitesParAdmin;
  }

  async lisNotificationsDe(
    idDestinataire: UUID
  ): Promise<DonneesNotificationTransactionnelle[]> {
    return this.knex(TABLES.NOTIFICATIONS_TRANSACTIONNELLES)
      .select({
        id: 'id',
        lue: 'lue',
        idActeur: 'id_acteur',
        idDestinataire: 'id_destinataire',
        metadonnees: 'metadonnees',
        type: 'type',
        date: 'date',
      })
      .where({ id_destinataire: idDestinataire });
  }
  async lisNotificationDe(
    idNotification: UUID,
    idDestinataire: UUID
  ): Promise<DonneesNotificationTransactionnelle | undefined> {
    return this.knex(TABLES.NOTIFICATIONS_TRANSACTIONNELLES)
      .select({
        id: 'id',
        lue: 'lue',
        idActeur: 'id_acteur',
        idDestinataire: 'id_destinataire',
        metadonnees: 'metadonnees',
        type: 'type',
        date: 'date',
      })
      .where({ id_destinataire: idDestinataire, id: idNotification })
      .first();
  }

  async sauvegardeNotificationTransactionnelle(
    donnees: DonneesNotificationTransactionnelle
  ): Promise<void> {
    await this.knex(TABLES.NOTIFICATIONS_TRANSACTIONNELLES)
      .insert({
        id: donnees.id,
        lue: donnees.lue,
        id_acteur: donnees.idActeur,
        id_destinataire: donnees.idDestinataire,
        metadonnees: donnees.metadonnees,
        type: donnees.type,
        date: donnees.date,
      })
      .onConflict('id')
      .merge();
  }

  async supprimeNotificationTransactionnelle(
    idNotification: UUID
  ): Promise<void> {
    await this.knex(TABLES.NOTIFICATIONS_TRANSACTIONNELLES)
      .where({ id: idNotification })
      .delete();
  }
}
