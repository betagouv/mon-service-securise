import expect from 'expect.js';
import {
  verifieNomFichierServi,
  verifieTypeFichierServiEstCSV,
} from '../../aides/verifieFichierServi.js';
import { EchecAutorisation, ErreurModele } from '../../../src/erreurs.js';
import testeurMSS from '../testeurMSS.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import {
  Permissions,
  Rubriques,
  tousDroitsEnEcriture,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import Mesures from '../../../src/modeles/mesures.js';
import uneDescriptionValide from '../../constructeurs/constructeurDescriptionService.js';
import { mesuresV2 } from '../../../donneesReferentielMesuresV2.js';
import { uneChaineDeCaracteres } from '../../constructeurs/String.js';
import { unUUIDRandom } from '../../constructeurs/UUID.js';

const { SECURISER } = Rubriques;
const { LECTURE, INVISIBLE } = Permissions;

describe('Le serveur MSS des routes privées /api/*', () => {
  const testeur = testeurMSS();
  const service = unService()
    .avecId('456')
    .avecNomService('Un service')
    .ajouteUnContributeur(
      unUtilisateur().avecEmail('email.proprietaire@mail.fr').donnees
    )
    .construis();

  beforeEach(() => testeur.initialise());

  it("vérifie que l'utilisateur est authentifié sur toutes les routes", async () => {
    // On vérifie une seule route privée.
    // Par construction, les autres seront protégées aussi puisque la protection est ajoutée comme middleware
    // devant le routeur dédié aux routes privées.
    await testeur
      .middleware()
      .verifieRequeteExigeJWT(testeur.app(), '/api/services');
  });

  describe('quand requête GET sur `/api/services`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      testeur.referentiel().recharge({
        statutsHomologation: {
          nonRealisee: { libelle: 'Non réalisée', ordre: 1 },
        },
      });
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), '/api/services');
    });

    it("interroge le dépôt de données pour récupérer les services de l'utilisateur", async () => {
      let donneesPassees = {};
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      testeur.referentiel().recharge({
        statutsHomologation: {
          nonRealisee: { libelle: 'Non réalisée', ordre: 1 },
        },
      });

      testeur.depotDonnees().autorisations = async () => [
        uneAutorisation()
          .deProprietaire('123', '456')
          .avecDroits({})
          .construis(),
      ];

      testeur.depotDonnees().services = async (idUtilisateur) => {
        donneesPassees = { idUtilisateur };
        return [service];
      };

      const reponse = await testeur.get('/api/services');

      expect(reponse.status).to.equal(200);

      const { services } = reponse.body;
      expect(services.length).to.equal(1);
      expect(services[0].id).to.equal('456');
      expect(donneesPassees.idUtilisateur).to.equal('123');
    });

    it("interroge le dépôt de données pour récupérer les autorisations de l'utilisateur", async () => {
      let donneesPassees = {};
      testeur.depotDonnees().autorisations = async (idUtilisateur) => {
        donneesPassees = { idUtilisateur };
        return [
          uneAutorisation()
            .deProprietaire('123', '456')
            .avecDroits({})
            .construis(),
        ];
      };

      await testeur.get('/api/services');
      expect(donneesPassees.idUtilisateur).to.equal('123');
    });

    it('interroge le dépôt de données pour récupérer les brouillons de service', async () => {
      let idUtilisateurRecu;
      testeur.depotDonnees().lisBrouillonsService = async (idUtilisateur) => {
        idUtilisateurRecu = idUtilisateur;
        return [{ nomService: 'nom du service', id: 'B1' }];
      };

      const reponse = await testeur.get('/api/services');

      expect(idUtilisateurRecu).to.equal('123');
      expect(reponse.body.brouillonsService.length).to.equal(1);
      expect(reponse.body.brouillonsService[0].nomService).to.equal(
        'nom du service'
      );
    });
  });

  describe('quand requête GET sur `/api/services/indices-cyber`', () => {
    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(
          testeur.app(),
          '/api/services/indices-cyber'
        );
    });

    it("interroge le dépôt de données pour récupérer les autorisations de l'utilisateur", async () => {
      let donneesPassees = {};
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      testeur.depotDonnees().autorisations = async (idUtilisateur) => {
        donneesPassees = { idUtilisateur };
        return [
          uneAutorisation()
            .deProprietaire('123', '456')
            .avecDroits({})
            .construis(),
        ];
      };

      await testeur.get('/api/services/indices-cyber');
      expect(donneesPassees.idUtilisateur).to.equal('123');
    });

    it("interroge le dépôt de données pour récupérer les services de l'utilisateur", async () => {
      let donneesPassees = {};
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      testeur.depotDonnees().autorisations = async () => [
        uneAutorisation()
          .deProprietaire('123', '456')
          .avecDroits({})
          .construis(),
      ];

      testeur.depotDonnees().services = (idUtilisateur) => {
        donneesPassees = { idUtilisateur };
        return Promise.resolve([service]);
      };

      const reponse = await testeur.get('/api/services/indices-cyber');

      expect(reponse.status).to.equal(200);

      const { services } = reponse.body;
      expect(services.length).to.equal(1);
      expect(services[0].id).to.equal('456');
      expect(donneesPassees.idUtilisateur).to.equal('123');
    });
  });

  describe('quand requête GET sur `/api/services/mesures`', () => {
    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(
          testeur.app(),
          '/api/services/mesures'
        );
    });

    it("interroge le dépôt de données pour récupérer les services de l'utilisateur", async () => {
      let idRecu;
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.depotDonnees().services = async (idUtilisateur) => {
        idRecu = idUtilisateur;
        return [];
      };

      await testeur.get('/api/services/mesures');

      expect(idRecu).to.be('U1');
    });

    it('retourne une liste de services avec leurs mesures associées', async () => {
      const mesuresReferentiel = {
        A: { categorie: 'gouvernance' },
        B: { categorie: 'gouvernance' },
      };
      testeur.referentiel().recharge({
        mesures: mesuresReferentiel,
        categoriesMesures: { gouvernance: 'Gouvernance' },
        reglesPersonnalisation: { mesuresBase: ['A', 'B'] },
      });
      const mesures = new Mesures(
        {
          mesuresGenerales: [
            { id: 'A', statut: 'fait', modalites: 'Mon commentaire' },
          ],
        },
        testeur.referentiel(),
        mesuresReferentiel
      );
      testeur.depotDonnees().autorisations = () => [
        uneAutorisation().deProprietaire('U1', 'S1').construis(),
      ];
      const descriptionService = uneDescriptionValide(testeur.referentiel())
        .avecNomService('Mon service')
        .deLOrganisation({ nom: 'Mon organisation' })
        .deNiveau2()
        .avecTypes(['api', 'siteInternet']).donnees;
      testeur.depotDonnees().services = () => [
        unService(testeur.referentiel())
          .avecId('S1')
          .avecDescription(descriptionService)
          .avecMesures(mesures)
          .construis(),
      ];

      const reponse = await testeur.get('/api/services/mesures');

      expect(reponse.status).to.be(200);
      expect(reponse.body).to.eql([
        {
          id: 'S1',
          nomService: 'Mon service',
          organisationResponsable: 'Mon organisation',
          mesuresAssociees: {
            A: { statut: 'fait', modalites: 'Mon commentaire' },
            B: {},
          },
          mesuresSpecifiques: [],
          niveauSecurite: 'niveau2',
          typeService: ['api', 'siteInternet'],
          peutEtreModifie: true,
        },
      ]);
    });

    it('retourne une liste de services avec leurs mesures spécifiques associées', async () => {
      const mesures = new Mesures(
        {
          mesuresSpecifiques: [
            { id: 'MS1', idModele: 'MOD-1', statut: 'enCours' },
          ],
        },
        testeur.referentiel(),
        {},
        { 'MOD-1': {} }
      );
      testeur.depotDonnees().autorisations = () => [
        uneAutorisation().deProprietaire('U1', 'S1').construis(),
      ];
      const descriptionService = uneDescriptionValide(
        testeur.referentiel()
      ).donnees;
      testeur.depotDonnees().services = () => [
        unService(testeur.referentiel())
          .avecId('S1')
          .avecDescription(descriptionService)
          .avecMesures(mesures)
          .construis(),
      ];

      const reponse = await testeur.get('/api/services/mesures');

      expect(reponse.status).to.be(200);
      expect(reponse.body[0].mesuresSpecifiques).to.eql([
        {
          id: 'MS1',
          idModele: 'MOD-1',
          statut: 'enCours',
          responsables: [],
        },
      ]);
    });

    it('filtre sur les services autorisés (en lecture sur SECURISER)', async () => {
      const mesuresReferentiel = {
        A: { categorie: 'gouvernance' },
      };
      testeur.referentiel().recharge({
        mesures: mesuresReferentiel,
        categoriesMesures: { gouvernance: 'Gouvernance' },
        reglesPersonnalisation: { mesuresBase: ['A'] },
      });
      const mesures = new Mesures(
        {
          mesuresGenerales: [
            { id: 'A', statut: 'fait', modalites: 'Mon commentaire' },
          ],
        },
        testeur.referentiel(),
        mesuresReferentiel
      );
      testeur.depotDonnees().autorisations = () => [
        uneAutorisation().deProprietaire('U1', 'S1').construis(),
        uneAutorisation()
          .deContributeur('U1', 'S2')
          .avecDroits({ [SECURISER]: INVISIBLE })
          .construis(),
      ];
      testeur.depotDonnees().services = () => [
        unService(testeur.referentiel())
          .avecId('S1')
          .avecNomService('Mon service')
          .avecOrganisationResponsable({ nom: 'Mon organisation' })
          .avecMesures(mesures)
          .construis(),
        unService(testeur.referentiel())
          .avecId('S2')
          .avecNomService('Mon service non autorisé')
          .avecOrganisationResponsable({ nom: 'Mon organisation' })
          .avecMesures(mesures)
          .construis(),
      ];

      const reponse = await testeur.get('/api/services/mesures');

      expect(reponse.status).to.be(200);
      expect(reponse.body.length).to.be(1);
      expect(reponse.body[0].id).to.be('S1');
    });

    it("indique pour chaque service s'il peut être modifié par l'utilisateur", async () => {
      const mesuresReferentiel = {
        A: { categorie: 'gouvernance' },
        B: { categorie: 'gouvernance' },
      };
      testeur.referentiel().recharge({
        mesures: mesuresReferentiel,
        categoriesMesures: { gouvernance: 'Gouvernance' },
        reglesPersonnalisation: { mesuresBase: ['A', 'B'] },
      });
      const mesures = new Mesures(
        {
          mesuresGenerales: [
            { id: 'A', statut: 'fait', modalites: 'Mon commentaire' },
          ],
        },
        testeur.referentiel(),
        mesuresReferentiel
      );
      testeur.depotDonnees().autorisations = () => [
        uneAutorisation().deProprietaire('U1', 'S1').construis(),
        uneAutorisation()
          .deContributeur('U1', 'S2')
          .avecDroits({ [SECURISER]: LECTURE })
          .construis(),
      ];
      testeur.depotDonnees().services = () => [
        unService(testeur.referentiel())
          .avecId('S1')
          .avecNomService('Mon service')
          .avecOrganisationResponsable({ nom: 'Mon organisation' })
          .avecMesures(mesures)
          .construis(),
        unService(testeur.referentiel())
          .avecId('S2')
          .avecNomService('Mon service non autorisé')
          .avecOrganisationResponsable({ nom: 'Mon organisation' })
          .avecMesures(mesures)
          .construis(),
      ];

      const reponse = await testeur.get('/api/services/mesures');

      expect(reponse.status).to.be(200);
      expect(reponse.body[0].id).to.be('S1');
      expect(reponse.body[0].peutEtreModifie).to.be(true);
      expect(reponse.body[1].id).to.be('S2');
      expect(reponse.body[1].peutEtreModifie).to.be(false);
    });
  });

  describe('quand requête PUT sur `/api/services/mesuresGenerales/:id`', () => {
    const idsServices = [unUUIDRandom()];
    const unePayloadValide = () => ({
      statut: 'fait',
      modalites: 'une modalité',
      idsServices,
      version: 'v2',
    });

    beforeEach(() => {
      testeur.depotDonnees().accesAutoriseAUneListeDeService = async () => true;
    });

    it("vérifie que l'utilisateur est authentifié", async () =>
      testeur.middleware().verifieRequeteExigeAcceptationCGU(testeur.app(), {
        method: 'put',
        url: '/api/services/mesuresGenerales/RECENSEMENT.1',
      }));

    it("jette une erreur si aucun ID service n'est fourni", async () => {
      const reponse = await testeur.put(
        '/api/services/mesuresGenerales/RECENSEMENT.1',
        { ...unePayloadValide(), idsServices: [] }
      );
      expect(reponse.status).to.be(400);
    });

    it.each([['abc'], [1]])(
      `jette une erreur si les ID de services sont [%s] (seuls les UUID sont acceptés)`,
      async (ids) => {
        const reponse = await testeur.put(
          '/api/services/mesuresGenerales/RECENSEMENT.1',
          { ...unePayloadValide(), idsServices: ids }
        );
        expect(reponse.status).to.be(400);
      }
    );

    it("jette une erreur si la mesure ciblée n'est pas de la version de référentiel donnée", async () => {
      const idMesureV2 = 'RECENSEMENT.1';
      const reponse = await testeur.put(
        `/api/services/mesuresGenerales/${idMesureV2}`,
        { ...unePayloadValide(), version: 'v1' }
      );

      expect(reponse.status).to.be(400);
    });

    it("jette une erreur si l'identifiant de la mesure est inconnu", async () => {
      const reponse = await testeur.put(
        '/api/services/mesuresGenerales/uneMesureInconnue',
        unePayloadValide()
      );

      expect(reponse.status).to.be(400);
    });

    it.each([null, 1, uneChaineDeCaracteres(2001, 'a')])(
      `jette une erreur si la modalité est invalide`,
      async (modalites) => {
        const reponse = await testeur.put(
          '/api/services/mesuresGenerales/RECENSEMENT.1',
          { ...unePayloadValide(), modalites }
        );
        expect(reponse.status).to.be(400);
      }
    );

    it('jette une erreur si le statut ET les modalités ne sont pas précisés', async () => {
      const reponse = await testeur.put(
        '/api/services/mesuresGenerales/RECENSEMENT.1',
        { ...unePayloadValide(), statut: '', modalites: '' }
      );

      expect(reponse.status).to.be(400);
    });

    it.each([null, 1, undefined, 'pasUneVersion'])(
      `jette une erreur si la version vaut %s`,
      async (version) => {
        const reponse = await testeur.put(
          '/api/services/mesuresGenerales/RECENSEMENT.1',
          { ...unePayloadValide(), version }
        );
        expect(reponse.status).to.be(400);
      }
    );

    it('jette une erreur si le statut est inconnu', async () => {
      const reponse = await testeur.put(
        '/api/services/mesuresGenerales/RECENSEMENT.1',
        { ...unePayloadValide(), statut: 'unStatutInconnu' }
      );

      expect(reponse.status).to.be(400);
    });

    it("ne jette pas d'erreur si le statut est vide", async () => {
      testeur.depotDonnees().metsAJourMesureGeneraleDesServices =
        async () => {};

      const reponse = await testeur.put(
        '/api/services/mesuresGenerales/RECENSEMENT.1',
        { ...unePayloadValide(), statut: '' }
      );

      expect(reponse.status).to.be(200);
    });

    it("jette une erreur si l'utilisateur n'a pas les droits d'écriture sur un des services ciblés", async () => {
      testeur.depotDonnees().accesAutoriseAUneListeDeService = async () =>
        false;

      const reponse = await testeur.put(
        '/api/services/mesuresGenerales/RECENSEMENT.1',
        unePayloadValide()
      );

      expect(reponse.status).to.be(403);
    });

    it('délègue au dépôt de données la mise à jour de la mesure pour les services concernés', async () => {
      let donneesRecues;
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.depotDonnees().metsAJourMesureGeneraleDesServices = async (
        idUtilisateur,
        ids,
        id,
        statut,
        modalites,
        version
      ) => {
        donneesRecues = {
          idUtilisateur,
          idsServices: ids,
          id,
          statut,
          modalites,
          version,
        };
      };

      await testeur.put(
        '/api/services/mesuresGenerales/RECENSEMENT.1',
        unePayloadValide()
      );

      expect(donneesRecues).to.eql({
        idUtilisateur: 'U1',
        idsServices,
        id: 'RECENSEMENT.1',
        statut: 'fait',
        modalites: 'une modalité',
        version: 'v2',
      });
    });

    it("permet la mise à jour d'une mesure V2", async () => {
      let versionRecue;
      let idMesureRecu;
      testeur.depotDonnees().metsAJourMesureGeneraleDesServices = async (
        _idUtilisateur,
        _idsServices,
        id,
        _statut,
        _modalites,
        version
      ) => {
        versionRecue = version;
        idMesureRecu = id;
      };

      const reponse = await testeur.put(
        '/api/services/mesuresGenerales/RECENSEMENT.1',
        { ...unePayloadValide(), version: 'v2' }
      );

      expect(reponse.status).to.be(200);
      expect(versionRecue).to.be('v2');
      expect(idMesureRecu).to.be('RECENSEMENT.1');
    });
  });

  describe('quand requête PUT sur `/api/services/mesuresSpecifiques/:id`', () => {
    const unePayloadValide = () => ({
      statut: 'fait',
      modalites: 'une modalité',
      idsServices: [unUUIDRandom()],
    });

    beforeEach(() => {
      testeur.depotDonnees().accesAutoriseAUneListeDeService = async () => true;
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'put',
          url: `/api/services/mesuresSpecifiques/${unUUIDRandom()}`,
        });
    });

    it.each([
      { cle: 'idsServices', valeur: [] },
      { cle: 'statut', valeur: 'pasUnStatut' },
      { cle: 'modalites', valeur: uneChaineDeCaracteres(2001, 'a') },
    ])(
      'jette une erreur quand le paramètre $cle vaut $valeur',
      async ({ cle, valeur }) => {
        const reponse = await testeur.put(
          `/api/services/mesuresSpecifiques/${unUUIDRandom()}`,
          { ...unePayloadValide(), [cle]: valeur }
        );

        expect(reponse.status).to.be(400);
      }
    );

    it("jette une erreur si l'identifiant du modèle de mesure est invalide", async () => {
      const reponse = await testeur.put(
        '/api/services/mesuresSpecifiques/pasUnUUID',
        unePayloadValide()
      );
      expect(reponse.status).to.be(400);
    });

    it('jette une erreur si le statut ET les modalités ne sont pas précisés', async () => {
      const reponse = await testeur.put(
        '/api/services/mesuresSpecifiques/unIdDeModele',
        {
          statut: undefined,
          modalites: undefined,
        }
      );
      expect(reponse.status).to.be(400);
    });

    it("jette une erreur si l'identifiant du modèle de mesure est inconnu", async () => {
      testeur.depotDonnees().lisModelesMesureSpecifiquePourUtilisateur =
        async () => [];

      const reponse = await testeur.put(
        `/api/services/mesuresSpecifiques/${unUUIDRandom()}`,
        unePayloadValide()
      );
      expect(reponse.status).to.be(404);
    });

    describe('lorsque le modèle de mesure est connu', () => {
      let idMesureConnu;

      beforeEach(() => {
        testeur.depotDonnees().metsAJourMesuresSpecifiquesDesServices =
          async () => {};
        idMesureConnu = unUUIDRandom();
        testeur.depotDonnees().lisModelesMesureSpecifiquePourUtilisateur =
          async () => [
            {
              id: idMesureConnu,
              description: 'une description',
              categorie: 'gouvernance',
              descriptionLongue: 'une description longue',
            },
          ];
      });

      it('jette une erreur si le statut est inconnu', async () => {
        testeur.referentiel().recharge({
          statutsMesures: { unStatut: {} },
        });
        const reponse = await testeur.put(
          `/api/services/mesuresSpecifiques/${idMesureConnu}`,
          {
            ...unePayloadValide(),
            statut: 'unStatutInconnu',
          }
        );

        expect(reponse.status).to.be(400);
      });

      it("ne jette pas d'erreur si le statut est vide", async () => {
        const reponse = await testeur.put(
          `/api/services/mesuresSpecifiques/${idMesureConnu}`,
          {
            ...unePayloadValide(),
            statut: '',
          }
        );

        expect(reponse.status).to.be(200);
      });

      it("jette une erreur si l'utilisateur n'a pas les droits d'écriture sur un des services ciblés", async () => {
        testeur.depotDonnees().accesAutoriseAUneListeDeService = async () =>
          false;

        const reponse = await testeur.put(
          `/api/services/mesuresSpecifiques/${idMesureConnu}`,
          unePayloadValide()
        );

        expect(reponse.status).to.be(403);
      });

      it('délègue au dépôt de données la mise à jour de chaque mesure pour les services concernés', async () => {
        let donneesRecues;
        testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
        testeur.depotDonnees().metsAJourMesuresSpecifiquesDesServices = async (
          idUtilisateur,
          idsServices,
          idModele,
          statut,
          modalites
        ) => {
          donneesRecues = {
            idUtilisateur,
            idsServices,
            idModele,
            statut,
            modalites,
          };
        };

        const payloadValide = unePayloadValide();
        await testeur.put(
          `/api/services/mesuresSpecifiques/${idMesureConnu}`,
          payloadValide
        );

        expect(donneesRecues).to.eql({
          idUtilisateur: 'U1',
          idsServices: payloadValide.idsServices,
          idModele: idMesureConnu,
          statut: 'fait',
          modalites: 'une modalité',
        });
      });
    });
  });

  describe('quand requête GET sur `/api/services/export.csv`', () => {
    let idServiceExport;

    beforeEach(() => {
      idServiceExport = unUUIDRandom();
      service.id = idServiceExport;
      testeur.adaptateurCsv().genereCsvServices = async () => {};
      testeur.referentiel().recharge({
        statutsHomologation: {
          nonRealisee: { libelle: 'Non réalisée', ordre: 1 },
        },
      });
      testeur.depotDonnees().autorisations = async () => [
        uneAutorisation()
          .deProprietaire('123', idServiceExport)
          .avecDroits({ [SECURISER]: LECTURE })
          .construis(),
      ];
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(
          testeur.app(),
          '/api/services/export.csv'
        );
    });

    describe('concernant le paramètre en query string `idsServices`', () => {
      it('retourne une erreur 400 si les ids de services sont invalides', async () => {
        const reponse = await testeur.get(
          '/api/services/export.csv?idsServices=pasUnUUID'
        );

        expect(reponse.status).to.be(400);
      });

      it("fonctionne dans le cas où le tableau ne comporte qu'un seul élément", async () => {
        // Dans le cas d'un seul ID envoyé, express va interpréter cet ID en `string`, pas en `array`.
        // Ce cas de test vérifie qu'on sait bien gérer ce cas d'une `string` qui arrive à l'API
        const queryString = new URLSearchParams();
        queryString.append('idsServices', unUUIDRandom());

        const reponse = await testeur.get(
          `/api/services/export.csv?${queryString}`
        );

        expect(reponse.status).to.be(200);
      });
    });

    it('accepte un timestamp, qui est optionnel', async () => {
      const reponse = await testeur.get(
        `/api/services/export.csv?idsServices=${unUUIDRandom()}&timestamp=1768833972997`
      );

      expect(reponse.status).to.be(200);
    });

    it("interroge le dépôt de données pour récupérer les autorisations de l'utilisateur", async () => {
      let donneesPassees = {};
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      testeur.depotDonnees().autorisations = async (idUtilisateur) => {
        donneesPassees = { idUtilisateur };
        return [
          uneAutorisation()
            .deProprietaire('123', '456')
            .avecDroits({})
            .construis(),
        ];
      };

      await testeur.get(
        `/api/services/export.csv?idsServices=${unUUIDRandom()}`
      );

      expect(donneesPassees).to.eql({ idUtilisateur: '123' });
    });

    it("interroge le dépôt de données pour récupérer les services de l'utilisateur", async () => {
      let donneesPassees = {};
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      testeur.depotDonnees().services = (idUtilisateur) => {
        donneesPassees = { idUtilisateur };
        return Promise.resolve([service]);
      };

      const reponse = await testeur.get(
        `/api/services/export.csv?idsServices=${unUUIDRandom()}`
      );

      expect(reponse.status).to.equal(200);
      expect(donneesPassees.idUtilisateur).to.equal('123');
    });

    it('filtre les services en fonction de la requête', async () => {
      testeur.depotDonnees().services = async () => [
        service,
        unService()
          .avecId('789')
          .avecNomService('Un deuxième service')
          .ajouteUnContributeur(
            unUtilisateur().avecEmail('email.proprietaire@mail.fr').donnees
          )
          .construis(),
      ];

      let donneesRecues;
      testeur.adaptateurCsv().genereCsvServices = async (donneesServices) => {
        donneesRecues = donneesServices;
        return 'Fichier CSV';
      };

      await testeur.get(
        `/api/services/export.csv?idsServices=${idServiceExport}`
      );

      expect(donneesRecues.length).to.be(1);
      expect(donneesRecues[0].id).to.equal(idServiceExport);
    });

    it('utilise un adaptateur de CSV pour la génération', async () => {
      await testeur.middleware().reinitialise({ idUtilisateur: '123' });

      testeur.depotDonnees().autorisations = async () => [
        uneAutorisation()
          .deProprietaire('123', idServiceExport)
          .avecDroits({})
          .construis(),
      ];

      testeur.depotDonnees().services = async () => [
        unService()
          .avecId(idServiceExport)
          .avecNomService('Un service')
          .avecOrganisationResponsable({ nom: 'ANSSI' })
          .ajouteUnContributeur(
            unUtilisateur().avecId('123').avecEmail('email.createur@mail.fr')
              .donnees
          )
          .construis(),
      ];

      let adaptateurCsvAppele = false;
      testeur.adaptateurCsv().genereCsvServices = async (donnees) => {
        adaptateurCsvAppele = true;

        const serviceRecu = donnees[0];
        expect(serviceRecu.nomService).to.eql('Un service');
        expect(serviceRecu.organisationResponsable).to.eql('ANSSI');
        expect(serviceRecu.nombreContributeurs).to.eql(1);
        expect(serviceRecu.estProprietaire).to.be(true);

        return 'Fichier CSV';
      };

      await testeur.get(
        `/api/services/export.csv?idsServices=${idServiceExport}`
      );

      expect(adaptateurCsvAppele).to.be(true);
    });

    it('sert un fichier de type CSV', async () => {
      await verifieTypeFichierServiEstCSV(
        testeur.app(),
        `/api/services/export.csv?idsServices=${idServiceExport}`
      );
    });

    it('sert un fichier dont le nom contient la date du jour en format court', async () => {
      testeur.adaptateurHorloge().maintenant = () => new Date(2023, 0, 28);

      await verifieNomFichierServi(
        testeur.app(),
        `/api/services/export.csv?idsServices=${idServiceExport}`,
        'MSS_services_20230128.csv'
      );
    });

    it("reste robuste en cas d'échec de génération de CSV", async () => {
      testeur.adaptateurCsv().genereCsvServices = async () => {
        throw new Error();
      };

      const reponse = await testeur.get(
        `/api/services/export.csv?idsServices=${idServiceExport}`
      );

      expect(reponse.status).to.be(424);
    });
  });

  describe('quand requête POST sur `/api/autorisation`', () => {
    beforeEach(() => {
      testeur.depotDonnees().utilisateur = async () =>
        unUtilisateur().construis();
      testeur.depotDonnees().service = async () => unService().construis();

      testeur.procedures().ajoutContributeurSurServices = async () => {};
    });

    const unePayloadValide = () => ({
      emailContributeur: 'jean.dupont@mail.fr',
      idServices: [unUUIDRandom()],
      droits: tousDroitsEnEcriture(),
    });

    it.each([
      { cle: 'idServices', valeur: [] },
      { cle: 'idServices', valeur: [1] },
      { cle: 'emailContributeur', valeur: 'pasUnEmail' },
      { cle: 'droits', valeur: { RUBRIQUE_INCONNUE: 2 } },
    ])(
      'jette une erreur quand le paramètre $cle vaut $valeur',
      async ({ cle, valeur }) => {
        const reponse = await testeur.post('/api/autorisation', {
          ...unePayloadValide(),
          [cle]: valeur,
        });

        expect(reponse.status).to.be(400);
      }
    );

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'post',
          url: '/api/autorisation',
          data: unePayloadValide(),
        });
    });

    it("appelle la procédure d'ajout de contributeur avec les droits envoyés", async () => {
      let ajout;

      testeur.depotDonnees().service = async (id) =>
        unService().avecId(id).construis();
      testeur.depotDonnees().utilisateur = async () =>
        unUtilisateur().avecId('EMETTEUR').construis();

      testeur.procedures().ajoutContributeurSurServices = async (
        emailContributeur,
        services,
        droits,
        emetteur
      ) => {
        ajout = { emailContributeur, services, droits, emetteur };
      };

      const droitsEnvoyes = {
        DECRIRE: 2,
        SECURISER: 1,
        HOMOLOGUER: 2,
        RISQUES: 1,
        CONTACTS: 2,
      };

      const idService = unUUIDRandom();
      await testeur.post('/api/autorisation', {
        emailContributeur: 'jean.dupont@mail.fr',
        idServices: [idService],
        droits: droitsEnvoyes,
      });

      expect(ajout.emailContributeur).to.be('jean.dupont@mail.fr');
      expect(ajout.services[0].id).to.be(idService);
      expect(ajout.droits).to.eql(droitsEnvoyes);
      expect(ajout.emetteur.id).to.be('EMETTEUR');
    });

    it('cible tous les services demandés', async () => {
      let cibles;

      testeur.depotDonnees().service = async (id) =>
        unService().avecId(id).construis();

      testeur.procedures().ajoutContributeurSurServices = async (
        _,
        services,
        __
      ) => {
        cibles = services;
      };

      const s1 = unUUIDRandom();
      const s2 = unUUIDRandom();
      await testeur.post('/api/autorisation', {
        ...unePayloadValide(),
        idServices: [s1, s2],
      });

      expect(cibles.length).to.be(2);
      expect(cibles[0].id).to.be(s1);
      expect(cibles[1].id).to.be(s2);
    });

    it("met l'email du contributeur en minuscules pour éviter de créer des comptes en double", async () => {
      let ajout;

      testeur.procedures().ajoutContributeurSurServices = async (
        emailContributeur
      ) => {
        ajout = { emailContributeur };
      };

      await testeur.post('/api/autorisation', {
        ...unePayloadValide(),
        emailContributeur: 'JEAN.DUPONT@MAIL.FR',
      });

      const enMinucsules = 'jean.dupont@mail.fr';
      expect(ajout.emailContributeur).to.be(enMinucsules);
    });

    it("retourne une erreur HTTP 403 si l'utilisateur n'a pas le droit d'ajouter un contributeur", async () => {
      testeur.procedures().ajoutContributeurSurServices = async () => {
        throw new EchecAutorisation();
      };

      const reponse = await testeur.post(
        '/api/autorisation',
        unePayloadValide()
      );

      expect(reponse.status).to.equal(403);
      expect(reponse.text).to.equal("Ajout non autorisé d'un contributeur");
    });

    it('retourne une erreur HTTP 422 si la procédure a levé une `ErreurModele`', async () => {
      testeur.procedures().ajoutContributeurSurServices = async () => {
        throw new ErreurModele('oups');
      };

      await testeur.verifieRequeteGenereErreurHTTP(422, 'oups', {
        method: 'post',
        url: '/api/autorisation',
        data: unePayloadValide(),
      });
    });

    it('ne retourne pas une erreur HTTP 422 si les droits contiennent estProprietaire=false', async () => {
      const record = { ...tousDroitsEnEcriture(), estProprietaire: false };

      const reponse = await testeur.post('/api/autorisation', {
        ...unePayloadValide(),
        droits: record,
      });

      expect(reponse.status).to.be(200);
    });
  });

  describe('quand requête DELETE sur `/api/autorisation`', () => {
    const uneQueryStringValide = (
      idService = unUUIDRandom(),
      idContributeur = unUUIDRandom()
    ) => `idService=${idService}&idContributeur=${idContributeur}`;

    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: '456' });
      testeur.depotDonnees().autorisationPour = async () =>
        uneAutorisation().deProprietaire().construis();
      testeur.depotDonnees().supprimeContributeur = async () => {};
    });

    it("jette une erreur quand l'ID service n'est pas un UUID", async () => {
      const reponse = await testeur.delete(
        `/api/autorisation?${uneQueryStringValide('123', unUUIDRandom())}`
      );

      expect(reponse.status).to.equal(400);
    });

    it("jette une erreur quand l'ID du contributeur n'est pas un UUID", async () => {
      const reponse = await testeur.delete(
        `/api/autorisation?${uneQueryStringValide(unUUIDRandom(), 'abc')}`
      );

      expect(reponse.status).to.equal(400);
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'delete',
          url: `/api/autorisation?${uneQueryStringValide()}`,
        });
    });

    it("vérifie que l'utilisateur a le droit de supprimer un contributeur", async () => {
      let autorisationCherchee = {};
      testeur.depotDonnees().autorisationPour = async (
        idUtilisateur,
        idService
      ) => {
        autorisationCherchee = { idUtilisateur, idService };
        return uneAutorisation().deProprietaire().construis();
      };

      const idService = unUUIDRandom();
      await testeur.delete(
        `/api/autorisation?${uneQueryStringValide(idService)}`
      );

      expect(autorisationCherchee.idUtilisateur).to.be('456');
      expect(autorisationCherchee.idService).to.be(idService);
    });

    it("retourne une erreur HTTP 403 si l'utilisateur n'a pas le droit de supprimer un contributeur", async () => {
      const contributeurSimple = uneAutorisation().deContributeur().construis();
      testeur.depotDonnees().autorisationPour = async () => contributeurSimple;

      const reponse = await testeur.delete(
        `/api/autorisation?${uneQueryStringValide()}`
      );

      expect(reponse.status).to.equal(403);
      expect(reponse.text).to.equal(
        'Suppression non autorisé pour un contributeur'
      );
    });

    it("utilise le dépôt de données pour supprimer l'autorisation du contributeur", async () => {
      let suppressionDemandee = {};
      testeur.depotDonnees().supprimeContributeur = async (
        idContributeur,
        idService,
        idUtilisateurCourant
      ) => {
        suppressionDemandee = {
          idContributeur,
          idService,
          idUtilisateurCourant,
        };
        return {};
      };

      const idService = unUUIDRandom();
      const idContributeur = unUUIDRandom();

      await testeur.delete(
        `/api/autorisation?${uneQueryStringValide(idService, idContributeur)}`
      );

      expect(suppressionDemandee.idContributeur).to.be(idContributeur);
      expect(suppressionDemandee.idService).to.be(idService);
      expect(suppressionDemandee.idUtilisateurCourant).to.be('456');
    });

    it('utilise le dépôt de données pour dissocier les modèles de mesure spécifique pour cet utilisateur et ce service', async () => {
      let suppressionDemandee = {};
      testeur.depotDonnees().dissocieTousModelesMesureSpecifiqueDeUtilisateurSurService =
        async (idContributeur, idService) => {
          suppressionDemandee = {
            idContributeur,
            idService,
          };
        };

      const idService = unUUIDRandom();
      const idContributeur = unUUIDRandom();
      await testeur.delete(
        `/api/autorisation?${uneQueryStringValide(idService, idContributeur)}`
      );

      expect(suppressionDemandee.idService).to.be(idService);
      expect(suppressionDemandee.idContributeur).to.be(idContributeur);
    });

    it("retourne une erreur HTTP 424 si le dépôt ne peut pas supprimer l'autorisation", async () => {
      testeur.depotDonnees().supprimeContributeur = async () => {
        throw new Error("Un message d'erreur");
      };

      const reponse = await testeur.delete(
        `/api/autorisation?${uneQueryStringValide()}`
      );

      expect(reponse.status).to.equal(424);
      expect(reponse.text).to.equal("Un message d'erreur");
    });
  });

  describe('quand requête GET sur `/api/annuaire/contributeurs`', () => {
    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(
          testeur.app(),
          '/api/annuaire/contributeurs'
        );
    });

    it('retourne une erreur HTTP 400 si le terme de recherche est vide', async () => {
      const reponse = await testeur.get('/api/annuaire/contributeurs');
      expect(reponse.status).to.be(400);
    });

    it("utilise le service d'annuaire pour suggérer des contributeurs", async () => {
      const appelDepot = {};
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      testeur.serviceAnnuaire().rechercheContributeurs = async (
        idUtilisateur,
        recherche
      ) => {
        appelDepot.idUtilisateur = idUtilisateur;
        appelDepot.recherche = recherche;

        return [
          unUtilisateur()
            .avecEmail('jean.dujardin@beta.gouv.fr')
            .quiSAppelle('Jean Dujardin')
            .construis(),
        ];
      };

      const reponse = await testeur.get(
        '/api/annuaire/contributeurs?recherche=jean'
      );

      expect(appelDepot).to.eql({ idUtilisateur: '123', recherche: 'jean' });
      expect(reponse.status).to.be(200);
      expect(reponse.body.suggestions).to.eql([
        {
          prenomNom: 'Jean Dujardin',
          email: 'jean.dujardin@beta.gouv.fr',
          initiales: 'JD',
        },
      ]);
    });
  });

  describe('quand requête GET sur `/api/supervision`', () => {
    beforeEach(() => {
      testeur.serviceSupervision().genereURLSupervision = () => '';
      testeur.depotDonnees().estSuperviseur = async () => true;
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), '/api/supervision');
    });

    it("retourne une erreur HTTP 401 si l'utilisateur n'est pas superviseur", async () => {
      testeur.depotDonnees().estSuperviseur = async () => false;
      await testeur.verifieRequeteGenereErreurHTTP(401, 'Unauthorized', {
        method: 'get',
        url: '/api/supervision?filtreDate=hier',
      });
    });

    it("retourne une erreur HTTP 400 si le filtre de date n'existe pas dans le référentiel", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(400, 'Bad Request', {
        method: 'get',
        url: '/api/supervision?filtreDate=nexistePas',
      });
    });

    it('retourne une erreur HTTP 400 si le filtre de besoinsDeSecurite a une valeur inconnue', async () => {
      await testeur.verifieRequeteGenereErreurHTTP(400, 'Bad Request', {
        method: 'get',
        url: '/api/supervision?filtreBesoinsSecurite=nexistePas',
      });
    });

    it("retourne une erreur HTTP 400 si le filtre d'entité n'est pas un SIRET", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(400, 'Bad Request', {
        method: 'get',
        url: '/api/supervision?filtreEntite=pasUnSiret',
      });
    });

    it("délègue au service de supervision la génération de l'URL du tableau de supervision", async () => {
      let idRecu;
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.serviceSupervision().genereURLSupervision = (idSuperviseur) => {
        idRecu = idSuperviseur;
        return 'https://uneURLSupervision.fr';
      };

      const reponse = await testeur.get('/api/supervision');

      expect(idRecu).to.be('U1');
      expect(reponse.body.urlSupervision).to.be('https://uneURLSupervision.fr');
    });

    it('transmet les filtres de date, entité et besoins de sécurité au service de supervision', async () => {
      let filtrageRecu;
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.serviceSupervision().genereURLSupervision = (_, filtrage) => {
        filtrageRecu = filtrage;
        return 'https://uneURLSupervision.fr';
      };

      await testeur.get(
        '/api/supervision?filtreDate=hier&filtreBesoinsSecurite=niveau1&filtreEntite=88208014600013'
      );

      expect(filtrageRecu.filtreDate).to.be('hier');
      expect(filtrageRecu.filtreBesoinsSecurite).to.be('niveau1');
      expect(filtrageRecu.filtreEntite).to.be('88208014600013');
    });
  });

  describe('quand requête GET sur `/api/referentiel/mesures`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      testeur.referentiel().recharge({
        mesures: { mesureA: { description: 'une mesure du référentiel v1' } },
      });

      testeur.depotDonnees().versionsServiceUtiliseesParUtilisateur =
        async () => ['v1'];
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(
          testeur.app(),
          '/api/referentiel/mesures'
        );
    });

    it("retourne uniquement les mesures v1 quand l'utilisateur n'a que des services v1", async () => {
      const queDuV1 = ['v1'];
      let utilisateurRecu;
      testeur.depotDonnees().versionsServiceUtiliseesParUtilisateur = async (
        idUtilisateur
      ) => {
        utilisateurRecu = idUtilisateur;
        return queDuV1;
      };

      const reponse = await testeur.get('/api/referentiel/mesures');

      expect(utilisateurRecu).to.be('123');
      expect(reponse.body).to.eql({
        mesureA: {
          description: 'une mesure du référentiel v1',
          versionReferentiel: 'v1',
        },
      });
    });

    it("retourne uniquement les mesures v2 quand l'utilisateur n'a que des services v2", async () => {
      const queDuV2 = ['v2'];
      let utilisateurRecu;
      testeur.depotDonnees().versionsServiceUtiliseesParUtilisateur = async (
        idUtilisateur
      ) => {
        utilisateurRecu = idUtilisateur;
        return queDuV2;
      };

      const reponse = await testeur.get('/api/referentiel/mesures');

      expect(utilisateurRecu).to.be('123');
      const [, premiereMesure] = Object.entries(reponse.body)[0];
      expect(premiereMesure).to.eql({
        ...mesuresV2['RECENSEMENT.1'],
        versionReferentiel: 'v2',
      });
    });

    it("retourne les mesures v1 *et* v2 quand l'utilisateur a les deux versions de services", async () => {
      const deuxVersions = ['v1', 'v2'];
      let utilisateurRecu;
      testeur.depotDonnees().versionsServiceUtiliseesParUtilisateur = async (
        idUtilisateur
      ) => {
        utilisateurRecu = idUtilisateur;
        return deuxVersions;
      };

      const reponse = await testeur.get('/api/referentiel/mesures');

      expect(utilisateurRecu).to.be('123');
      const [id1, premiereMesure] = Object.entries(reponse.body)[0];

      expect(id1).to.be('mesureA');
      expect(premiereMesure).to.eql({
        description: 'une mesure du référentiel v1',
        versionReferentiel: 'v1',
      });

      const [id2, deuxiemeMesure] = Object.entries(reponse.body)[1];
      expect(id2).to.be('RECENSEMENT.1');
      expect(deuxiemeMesure).to.eql({
        ...mesuresV2['RECENSEMENT.1'],
        versionReferentiel: 'v2',
      });
    });

    it("retourne les mesures v1 quand l'utilisateur n'a aucun service, afin de ne pas casser la liste actuelle, en attendant la mise en production de la V2 complète", async () => {
      const sansService = [];
      let utilisateurRecu;
      testeur.depotDonnees().versionsServiceUtiliseesParUtilisateur = async (
        idUtilisateur
      ) => {
        utilisateurRecu = idUtilisateur;
        return sansService;
      };

      const reponse = await testeur.get('/api/referentiel/mesures');

      expect(utilisateurRecu).to.be('123');
      expect(reponse.body).to.eql({
        mesureA: {
          description: 'une mesure du référentiel v1',
          versionReferentiel: 'v1',
        },
      });
    });
  });
});
