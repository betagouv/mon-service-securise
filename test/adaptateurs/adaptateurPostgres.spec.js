import expect from 'expect.js';
import Knex from 'knex';
import ClientPgLite from 'knex-pglite';
import 'tsx/esm'; // Pour que `knex.migrate.latest()` s'exécute dans un écosytème où il comprend typescript. Car dans les tests, `tsc` ne s'exécute jamais.
import { nouvelAdaptateur } from '../../src/adaptateurs/adaptateurPostgres.js';
import { genereUUID } from '../../src/adaptateurs/adaptateurUUID.js';
import { Autorisation } from '../../src/modeles/autorisations/autorisation.js';
import { AdaptateurPostgresTS } from '../../src/adaptateurs/adaptateurPostgresTS.js';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';

describe("L'adaptateur persistance Postgres", () => {
  let knex;
  let persistance;
  let persistanceTS;
  const chiffrement = fauxAdaptateurChiffrement();
  const ID_UTILISATEUR_1 = genereUUID();
  const ID_UTILISATEUR_2 = genereUUID();
  const ID_SERVICE_1 = genereUUID();

  beforeAll(async () => {
    knex = Knex({ client: ClientPgLite, dialect: 'postgres', connection: {} });
    await knex.migrate.latest();
    persistance = nouvelAdaptateur({ knexSurcharge: knex });
    persistanceTS = new AdaptateurPostgresTS({ knex, chiffrement });
  });

  afterEach(async () => {
    await Promise.all(
      [
        'services',
        'suggestions_actions',
        'utilisateurs',
        'autorisations',
        'modeles_mesure_specifique',
        'modeles_mesure_specifique_association_aux_services',
        'admins_organisations',
      ].map((table) => knex(table).truncate())
    );
  });

  afterAll(async () => {
    await knex.destroy();
  });

  async function insereModeleMesureSpecifique(donnees) {
    const id = genereUUID();
    await knex('modeles_mesure_specifique').insert({
      ...donnees,
      id,
    });
    return id;
  }

  async function insereAssociationModeleMesureSpecifique(idModele, idService) {
    await knex('modeles_mesure_specifique_association_aux_services').insert({
      id_modele: idModele,
      id_service: idService,
    });
  }

  async function insereService() {
    const idService = genereUUID();
    await persistance.sauvegardeService(idService, {}, 'service-1', 'siret-1');
    return idService;
  }

  async function insereUtilisateur() {
    const idUtilisateur = genereUUID();
    await persistance.ajouteUtilisateur(idUtilisateur, {}, 'email');
    return idUtilisateur;
  }

  async function ajouteEntiteAuPerimetreSuperviseur(idSuperviseur, siret) {
    await persistance.ajouteEntiteAuSuperviseur(
      idSuperviseur,
      chiffrement.hacheSha256(siret),
      {}
    );
  }

  async function ajouteAdminAvecEntite(idUtilisateur, ...sirets) {
    await persistanceTS.sauvegardeAdminOrganisations({
      idUtilisateur,
      entitesAdministrees: sirets.map((s) => ({ siret: s })),
    });
  }

  async function insereAutorisation(idUtilisateur, idService) {
    const idAutorisation = genereUUID();
    const autorisation = Autorisation.NouvelleAutorisationProprietaire({
      idUtilisateur,
      idService,
    });
    await persistance.ajouteAutorisation(
      idAutorisation,
      autorisation.donneesAPersister()
    );
  }

  async function insereAutorisationContributeur(idUtilisateur, idService) {
    const idAutorisation = genereUUID();
    const autorisation = Autorisation.NouvelleAutorisationContributeur({
      idUtilisateur,
      idService,
    });
    await persistance.ajouteAutorisation(
      idAutorisation,
      autorisation.donneesAPersister()
    );
  }

  async function insereAutorisationAdmin(idUtilisateur, idService) {
    const idAutorisation = genereUUID();
    const autorisation = Autorisation.NouvelleAutorisationAdmin({
      idUtilisateur,
      idService,
    });
    await persistance.ajouteAutorisation(
      idAutorisation,
      autorisation.donneesAPersister()
    );
  }

  describe('concernant la lecture complète de service', () => {
    it("sait lire les suggestions d'action d'un service", async () => {
      const idService = await insereService();
      await persistance.ajouteSuggestionAction({
        idService,
        nature: 'une nature',
      });

      const services = await persistance.servicesComplets({ idService });

      expect(services[0].suggestions).to.eql(['une nature']);
    });

    it("sait lire les contributeurs d'un service", async () => {
      const idService = await insereService();
      const idUtilisateur = await insereUtilisateur();
      await insereAutorisation(idUtilisateur, idService);

      const services = await persistance.servicesComplets({ idService });

      const proprietaire = services[0].utilisateurs[0];
      expect(proprietaire.id).to.be(idUtilisateur);
      expect(proprietaire.email_hash).to.be('email');
      expect(proprietaire.estAdmin).to.be(false);
    });

    it("sait dire qu'un contributeur est admin", async () => {
      const idService = await insereService();
      const idUtilisateur = await insereUtilisateur();
      await insereAutorisationAdmin(idUtilisateur, idService);

      const services = await persistance.servicesComplets({ idService });

      const proprietaire = services[0].utilisateurs[0];
      expect(proprietaire.id).to.be(idUtilisateur);
      expect(proprietaire.estAdmin).to.be(true);
    });

    it('sait lire les modèles de mesure spécifique disponible pour un service', async () => {
      const idService = await insereService();
      const idUtilisateur = await insereUtilisateur();
      await insereAutorisation(idUtilisateur, idService);

      const idModele = genereUUID();
      await persistance.ajouteModeleMesureSpecifique(idModele, idUtilisateur, {
        description: 'Une description',
      });

      const services = await persistance.servicesComplets({ idService });

      expect(services[0].modelesDisponiblesDeMesureSpecifique).to.eql([
        {
          id: idModele,
          donnees: { description: 'Une description' },
          idUtilisateur,
        },
      ]);
    });

    it('sait lire la version du service', async () => {
      const idService = await insereService();
      const idUtilisateur = await insereUtilisateur();
      await insereAutorisation(idUtilisateur, idService);

      const services = await persistance.servicesComplets({ idService });

      expect(services[0].versionService).to.be('v1');
    });

    it('sait indiquer si une simulation est en cours pour un service', async () => {
      const idService = await insereService();
      await persistance.sauvegardeSimulationMigrationReferentiel(idService, {});

      const services = await persistance.servicesComplets({ idService });

      expect(services[0].aUneSimulationMigrationReferentiel).to.be(true);
    });

    it("sait indiquer si une simulation n'est pas en cours pour un service", async () => {
      const idService = await insereService();

      const services = await persistance.servicesComplets({ idService });

      expect(services[0].aUneSimulationMigrationReferentiel).to.be(false);
    });
  });

  describe('concernant la lecture des modèles de mesure spécifique', () => {
    it("sait lire les modèles de mesure spécifique d'un utilisateur", async () => {
      const idModele1 = await insereModeleMesureSpecifique({
        id_utilisateur: ID_UTILISATEUR_1,
        donnees: {},
      });
      await insereModeleMesureSpecifique({
        id_utilisateur: ID_UTILISATEUR_2,
        donnees: {},
      });

      const modeles =
        await persistance.lisModelesMesureSpecifiquePourUtilisateur(
          ID_UTILISATEUR_1
        );

      expect(modeles).to.eql([
        {
          id: idModele1,
          id_utilisateur: ID_UTILISATEUR_1,
          donnees: {},
          ids_services_associes: [],
        },
      ]);
    });

    it('sait lire les services associés', async () => {
      const idModele = await insereModeleMesureSpecifique({
        id_utilisateur: ID_UTILISATEUR_1,
        donnees: {},
      });

      const idService = genereUUID();
      await insereAssociationModeleMesureSpecifique(idModele, idService);

      const modeles =
        await persistance.lisModelesMesureSpecifiquePourUtilisateur(
          ID_UTILISATEUR_1
        );

      expect(modeles[0].ids_services_associes).to.eql([idService]);
    });
  });

  describe("concernant la suppression d'un modèle de mesure spécifique", () => {
    it('supprime le modèle', async () => {
      const idModele = await insereModeleMesureSpecifique({
        id_utilisateur: ID_UTILISATEUR_1,
        donnees: {},
      });

      await persistance.supprimeModeleMesureSpecifique(idModele);

      const modeles =
        await persistance.lisModelesMesureSpecifiquePourUtilisateur(
          ID_UTILISATEUR_1
        );
      expect(modeles).to.eql([]);
    });

    it('supprime ses associations à des services', async () => {
      const idModele = await insereModeleMesureSpecifique({
        id_utilisateur: ID_UTILISATEUR_1,
        donnees: {},
      });
      const idService = genereUUID();
      await insereAssociationModeleMesureSpecifique(idModele, idService);

      await persistance.supprimeModeleMesureSpecifique(idModele);

      const associations = await knex(
        'modeles_mesure_specifique_association_aux_services'
      ).select();
      expect(associations).to.eql([]);
    });
  });

  describe("concernant la suppression d'association entre des modèles de mesure spécifique appartenant à un utilisateur et un service", () => {
    it('supprime les associations', async () => {
      const idModele = await insereModeleMesureSpecifique({
        id_utilisateur: ID_UTILISATEUR_1,
        donnees: {},
      });
      await insereAssociationModeleMesureSpecifique(idModele, ID_SERVICE_1);

      await persistance.supprimeAssociationModelesMesureSpecifiquePourUtilisateurSurService(
        ID_UTILISATEUR_1,
        ID_SERVICE_1
      );

      const associations = await knex(
        'modeles_mesure_specifique_association_aux_services'
      ).select();
      expect(associations).to.eql([]);
    });
  });

  describe("concernant l'ajout multiple de modèles de mesure specifique", () => {
    it('ajoute les modèles', async () => {
      const idMod1 = genereUUID();
      const idMod2 = genereUUID();
      const modelesAAjouter = {
        [idMod1]: { description: 'mod1' },
        [idMod2]: { description: 'mod2' },
      };

      await persistance.ajoutePlusieursModelesMesureSpecifique(
        ID_UTILISATEUR_1,
        modelesAAjouter
      );

      const modeles =
        await persistance.lisModelesMesureSpecifiquePourUtilisateur(
          ID_UTILISATEUR_1
        );
      const idModelesSauvegardes = modeles.map((m) => m.id);
      expect(modeles.length).to.be(2);
      expect(idModelesSauvegardes.includes(idMod1)).to.be(true);
      expect(idModelesSauvegardes.includes(idMod2)).to.be(true);
    });
  });

  describe("concernant l'ajout multiple d'activités de mesure", () => {
    it("reste robuste en cas de demande d'ajout vide", async () => {
      try {
        await persistance.ajouteActivitesMesure([]);
      } catch {
        assert.fail("L'appel n'aurait pas dû lever d'exception");
      }
    });
  });

  describe("concernant la recherche des contributeurs des services d'un propriétaire", () => {
    it('retourne les contributeurs de tous les services', async () => {
      const idService = await insereService();
      const idServicePasProprietaire = await insereService();
      const proprietaire = await insereUtilisateur();
      const autreContributeur = await insereUtilisateur();
      await insereAutorisation(proprietaire, idService);
      await insereAutorisation(autreContributeur, idService);
      await insereAutorisationContributeur(
        proprietaire,
        idServicePasProprietaire
      );

      const lesContributeurs =
        await persistance.contributeursDesServicesDe(proprietaire);

      expect(lesContributeurs.length).to.be(1);
      expect(lesContributeurs[0].id).to.be(autreContributeur);
    });

    it('exclue les autorisations admin dans un souci de confidentialité', async () => {
      const idService = await insereService();
      const proprietaire = await insereUtilisateur();
      await insereAutorisation(proprietaire, idService);
      const admin = await insereUtilisateur();
      await insereAutorisationAdmin(admin, idService);

      const lesContributeurs =
        await persistance.contributeursDesServicesDe(proprietaire);

      expect(lesContributeurs.length).to.be(0);
    });
  });

  describe('concernant la lecture des utilisateurs administrés par un utilisateur', () => {
    let u1;
    let u2;
    let admin;

    beforeEach(async () => {
      const idService1 = await insereService();
      const idService2 = await insereService();
      u1 = await insereUtilisateur();
      u2 = await insereUtilisateur();
      admin = await insereUtilisateur();
      await insereAutorisation(u1, idService1);
      await insereAutorisation(u2, idService2);
      await insereAutorisation(u1, idService2);
      await insereAutorisationAdmin(admin, idService1);
      await insereAutorisationAdmin(admin, idService2);
    });

    it("retourne les contributeurs des services sur lesquels l'utilisateur est admin", async () => {
      const utilisateurs = await persistance.utilisateursAdministresPar(admin);

      expect(utilisateurs.map((u) => u.id)).to.contain(u1);
      expect(utilisateurs.map((u) => u.id)).to.contain(u2);
    });

    it("ne retourne pas l'utilisateur admin lui-même", async () => {
      const utilisateurs = await persistance.utilisateursAdministresPar(admin);

      expect(utilisateurs.map((u) => u.id)).not.to.contain(admin);
    });

    it('retourne les contributeurs sans doublon', async () => {
      const utilisateurs = await persistance.utilisateursAdministresPar(admin);

      expect(utilisateurs.length).to.be(2);
    });
  });

  describe('concernant la lecture des utilisateurs supervisés par un utilisateur', () => {
    let superviseur;
    let admin1;
    let admin2;

    beforeEach(async () => {
      superviseur = await insereUtilisateur();
      admin1 = await insereUtilisateur();
      admin2 = await insereUtilisateur();
      await ajouteEntiteAuPerimetreSuperviseur(superviseur, 'siret-1');
      await ajouteAdminAvecEntite(admin1, 'siret-1');
      await ajouteAdminAvecEntite(admin2, 'siret-1');
    });

    it('retourne les administrateurs sur le périmètre du superviseur', async () => {
      const admins = await persistance.utilisateursSupervisesPar(superviseur);

      expect(admins.map((u) => u.id)).to.contain(admin1);
      expect(admins.map((u) => u.id)).to.contain(admin2);
    });

    it("ne retourne pas l'utilisateur superviseur lui-même, même s'il est admin", async () => {
      // C'est un cas rare, mais certains superviseurs seront aussi admin
      await ajouteAdminAvecEntite(superviseur, 'siret-1');

      const admins = await persistance.utilisateursSupervisesPar(superviseur);

      expect(admins.map((u) => u.id)).not.to.contain(superviseur);
    });

    it('retourne les admins sans doublon', async () => {
      // superviseur supervise déjà siret-1
      await ajouteEntiteAuPerimetreSuperviseur(superviseur, 'siret-2');
      await ajouteAdminAvecEntite(admin1, 'siret-1', 'siret-2');
      await ajouteAdminAvecEntite(admin2, 'siret-1');

      const admins = await persistance.utilisateursSupervisesPar(superviseur);

      expect(admins.length).to.be(2);
    });
  });
});
