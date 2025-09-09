import expect from 'expect.js';
import {
  verifieNomFichierServi,
  verifieTypeFichierServiEstCSV,
} from '../../aides/verifieFichierServi.js';
import {
  EchecAutorisation,
  ErreurAutorisationInexistante,
  ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique,
  ErreurModele,
  ErreurModeleDeMesureSpecifiqueDejaAssociee,
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurNombreLimiteModelesMesureSpecifiqueAtteint,
  ErreurServiceInexistant,
} from '../../../src/erreurs.js';
import testeurMSS from '../testeurMSS.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import {
  Permissions,
  Rubriques,
  tousDroitsEnEcriture,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import { expectContenuSessionValide } from '../../aides/cookie.js';
import { SourceAuthentification } from '../../../src/modeles/sourceAuthentification.js';
import Mesures from '../../../src/modeles/mesures.js';
import uneDescriptionValide from '../../constructeurs/constructeurDescriptionService.js';

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

  beforeEach(testeur.initialise);

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

    it('décode les entités HTML dans les données retournées', async () => {
      const mesuresReferentiel = { A: { categorie: 'gouvernance' } };
      testeur.referentiel().recharge({
        mesures: mesuresReferentiel,
        categoriesMesures: { gouvernance: 'Gouvernance' },
      });
      const mesures = new Mesures(
        {
          mesuresGenerales: [
            { id: 'A', statut: 'fait', modalites: 'L&apos;application de A' },
          ],
          mesuresSpecifiques: [
            {
              id: 'MS1',
              idModele: 'MOD-1',
              statut: 'enCours',
              modalites: 'L&apos;ampoule',
            },
          ],
        },
        testeur.referentiel(),
        mesuresReferentiel,
        {
          'MOD-1': {
            description: 'L&apos;arbitre',
            descriptionLongue: 'L&apos;autre',
          },
        }
      );
      testeur.depotDonnees().autorisations = () => [
        uneAutorisation().deProprietaire('U1', 'S1').construis(),
      ];
      testeur.depotDonnees().services = () => [
        unService(testeur.referentiel())
          .avecId('S1')
          .avecDescription(
            uneDescriptionValide(testeur.referentiel()).avecNomService(
              'L&apos;abricot'
            ).donnees
          )
          .avecMesures(mesures)
          .construis(),
      ];

      const reponse = await testeur.get('/api/services/mesures');

      expect(reponse.body[0].nomService).to.be("L'abricot");
      expect(reponse.body[0].mesuresAssociees.A.modalites).to.be(
        "L'application de A"
      );
      expect(reponse.body[0].mesuresSpecifiques[0].modalites).to.be(
        "L'ampoule"
      );
      expect(reponse.body[0].mesuresSpecifiques[0].descriptionLongue).to.be(
        "L'autre"
      );
      expect(reponse.body[0].mesuresSpecifiques[0].description).to.be(
        "L'arbitre"
      );
    });
  });

  describe('quand requête PUT sur `/api/services/mesuresGenerales/:id`', () => {
    beforeEach(() => {
      testeur.depotDonnees().accesAutoriseAUneListeDeService = async () => true;
    });

    it("vérifie que l'utilisateur est authentifié", async () =>
      testeur.middleware().verifieRequeteExigeAcceptationCGU(testeur.app(), {
        method: 'put',
        url: '/api/services/mesuresGenerales/unIdDeMesure',
      }));

    it('aseptise les données', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['idsServices.*', 'id', 'statut', 'modalites'],
          testeur.app(),
          {
            method: 'put',
            url: '/api/services/mesuresGenerales/unIdDeMesure',
          }
        );
    });

    it('jette une erreur si le statut ET les modalités ne sont pas précisés', async () => {
      const reponse = await testeur.put(
        '/api/services/mesuresGenerales/unIdDeMesure',
        {
          statut: undefined,
          modalites: undefined,
        }
      );
      expect(reponse.status).to.be(400);
    });

    it("jette une erreur si l'identifiant de la mesure est inconnu", async () => {
      testeur.referentiel().recharge({
        mesures: {
          uneMesureConnue: {},
        },
      });
      const reponse = await testeur.put(
        '/api/services/mesuresGenerales/uneMesureInconnue',
        {
          statut: 'fait',
        }
      );
      expect(reponse.status).to.be(400);
    });

    it('jette une erreur si le statut est inconnu', async () => {
      testeur.referentiel().recharge({
        mesures: { uneMesureConnue: {} },
        statutsMesures: { unStatut: {} },
      });
      const reponse = await testeur.put(
        '/api/services/mesuresGenerales/uneMesureConnue',
        {
          statut: 'unStatutInconnu',
        }
      );

      expect(reponse.status).to.be(400);
    });

    it("ne jette pas d'erreur si le statut est vide", async () => {
      testeur.referentiel().recharge({
        mesures: { uneMesureConnue: {} },
      });
      testeur.depotDonnees().metsAJourMesureGeneraleDesServices =
        async () => {};

      const reponse = await testeur.put(
        '/api/services/mesuresGenerales/uneMesureConnue',
        {
          statut: '',
          modalites: 'une modalité',
        }
      );

      expect(reponse.status).to.be(200);
    });

    it("jette une erreur si l'utilisateur n'a pas les droits d'écriture sur un des services ciblés", async () => {
      testeur.depotDonnees().accesAutoriseAUneListeDeService = async () =>
        false;
      testeur.referentiel().recharge({
        mesures: {
          uneMesureConnue: {},
        },
        statutsMesures: { unStatut: {} },
      });

      const reponse = await testeur.put(
        '/api/services/mesuresGenerales/uneMesureConnue',
        {
          statut: 'unStatut',
          idsServices: ['S1'],
        }
      );
      expect(reponse.status).to.be(403);
    });

    it('délègue au dépôt de données la mise à jour de la mesure pour les services concernés', async () => {
      let donneesRecues;
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.depotDonnees().metsAJourMesureGeneraleDesServices = async (
        idUtilisateur,
        idsServices,
        id,
        statut,
        modalites
      ) => {
        donneesRecues = { idUtilisateur, idsServices, id, statut, modalites };
      };
      testeur.referentiel().recharge({
        mesures: {
          uneMesureConnue: {},
        },
        statutsMesures: { fait: {} },
      });

      await testeur.put('/api/services/mesuresGenerales/uneMesureConnue', {
        statut: 'fait',
        modalites: 'une modalité',
        idsServices: ['S1', 'S2'],
      });

      expect(donneesRecues).to.eql({
        idUtilisateur: 'U1',
        idsServices: ['S1', 'S2'],
        id: 'uneMesureConnue',
        statut: 'fait',
        modalites: 'une modalité',
      });
    });
  });

  describe('quand requête PUT sur `/api/services/mesuresSpecifiques/:id`', () => {
    beforeEach(() => {
      testeur.depotDonnees().accesAutoriseAUneListeDeService = async () => true;
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'put',
          url: '/api/services/mesuresSpecifiques/unIdDeModele',
        });
    });

    it('aseptise les données', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['idsServices.*', 'idModele', 'statut', 'modalites'],
          testeur.app(),
          {
            method: 'put',
            url: '/api/services/mesuresSpecifiques/unIdDeModele',
          }
        );
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
        '/api/services/mesuresSpecifiques/unModeleInconnu',
        {
          statut: 'fait',
        }
      );
      expect(reponse.status).to.be(404);
    });

    describe('lorsque le modèle de mesure est connu', () => {
      beforeEach(() => {
        testeur.depotDonnees().metsAJourMesuresSpecifiquesDesServices =
          async () => {};
        testeur.depotDonnees().lisModelesMesureSpecifiquePourUtilisateur =
          async () => [
            {
              id: 'unModeleConnu',
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
          '/api/services/mesuresSpecifiques/unModeleConnu',
          {
            statut: 'unStatutInconnu',
          }
        );

        expect(reponse.status).to.be(400);
      });

      it("ne jette pas d'erreur si le statut est vide", async () => {
        const reponse = await testeur.put(
          '/api/services/mesuresSpecifiques/unModeleConnu',
          {
            statut: '',
            modalites: 'une modalité',
          }
        );

        expect(reponse.status).to.be(200);
      });

      it("jette une erreur si l'utilisateur n'a pas les droits d'écriture sur un des services ciblés", async () => {
        testeur.depotDonnees().accesAutoriseAUneListeDeService = async () =>
          false;
        testeur.referentiel().recharge({
          statutsMesures: { unStatut: {} },
        });

        const reponse = await testeur.put(
          '/api/services/mesuresSpecifiques/unModeleConnu',
          {
            statut: 'unStatut',
            idsServices: ['S1'],
          }
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
        testeur.referentiel().recharge({
          statutsMesures: { fait: {} },
        });

        await testeur.put('/api/services/mesuresSpecifiques/unModeleConnu', {
          statut: 'fait',
          modalites: 'une modalité',
          idsServices: ['S1', 'S2'],
        });

        expect(donneesRecues).to.eql({
          idUtilisateur: 'U1',
          idsServices: ['S1', 'S2'],
          idModele: 'unModeleConnu',
          statut: 'fait',
          modalites: 'une modalité',
        });
      });
    });
  });

  describe('quand requête GET sur `/api/services/export.csv`', () => {
    beforeEach(() => {
      testeur.adaptateurCsv().genereCsvServices = async () => {};
      testeur.referentiel().recharge({
        statutsHomologation: {
          nonRealisee: { libelle: 'Non réalisée', ordre: 1 },
        },
      });
      testeur.depotDonnees().autorisations = async () => [
        uneAutorisation()
          .deProprietaire('123', '456')
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

    it('aseptise les identifiants des services à exporter', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(['idsServices.*'], testeur.app(), {
          method: 'get',
          url: '/api/services/export.csv',
        });
    });

    describe('concernant le paramètre en query string `idsServices`', () => {
      it("retourne une erreur 400 si le paramètre n'est pas un tableau", async () => {
        const reponse = await testeur.get(
          '/api/services/export.csv?idsServices[a]=1' // Sera interprété par express comme {a: 1}
        );
        expect(reponse.status).to.be(400);
      });

      it("fonctionne dans le cas où le tableau ne comporte qu'un seul élément", async () => {
        // Dans le cas d'un seul ID envoyé, express va interpréter cet ID en `string`, pas en `array`.
        // Ce cas de test vérifie qu'on sait bien gérer ce cas d'une `string` qui arrive à l'API
        const queryString = new URLSearchParams();
        queryString.append('idsServices', '123');

        const reponse = await testeur.get(
          `/api/services/export.csv?${queryString}`
        );

        expect(reponse.status).to.be(200);
      });
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

      await testeur.get('/api/services/export.csv');
      expect(donneesPassees).to.eql({ idUtilisateur: '123' });
    });

    it("interroge le dépôt de données pour récupérer les services de l'utilisateur", async () => {
      let donneesPassees = {};
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      testeur.depotDonnees().services = (idUtilisateur) => {
        donneesPassees = { idUtilisateur };
        return Promise.resolve([service]);
      };

      const reponse = await testeur.get('/api/services/export.csv');

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

      await testeur.get('/api/services/export.csv?idsServices=456');
      expect(donneesRecues.length).to.be(1);
      expect(donneesRecues[0].id).to.equal('456');
    });

    it('utilise un adaptateur de CSV pour la génération', async () => {
      await testeur.middleware().reinitialise({ idUtilisateur: '123' });

      testeur.depotDonnees().autorisations = async () => [
        uneAutorisation()
          .deProprietaire('123', '456')
          .avecDroits({})
          .construis(),
      ];

      testeur.depotDonnees().services = () =>
        Promise.resolve([
          unService()
            .avecId('456')
            .avecNomService('Un service')
            .avecOrganisationResponsable({ nom: 'ANSSI' })
            .ajouteUnContributeur(
              unUtilisateur().avecId('123').avecEmail('email.createur@mail.fr')
                .donnees
            )
            .construis(),
        ]);

      let adaptateurCsvAppele = false;
      testeur.adaptateurCsv().genereCsvServices = (donnees) => {
        adaptateurCsvAppele = true;

        const serviceRecu = donnees[0];
        expect(serviceRecu.nomService).to.eql('Un service');
        expect(serviceRecu.organisationResponsable).to.eql('ANSSI');
        expect(serviceRecu.nombreContributeurs).to.eql(1);
        expect(serviceRecu.estProprietaire).to.be(true);

        return Promise.resolve('Fichier CSV');
      };

      await testeur.get('/api/services/export.csv?idsServices=456');
      expect(adaptateurCsvAppele).to.be(true);
    });

    it('sert un fichier de type CSV', async () => {
      await verifieTypeFichierServiEstCSV(
        testeur.app(),
        '/api/services/export.csv'
      );
    });

    it('sert un fichier dont le nom contient la date du jour en format court', async () => {
      testeur.adaptateurHorloge().maintenant = () => new Date(2023, 0, 28);

      await verifieNomFichierServi(
        testeur.app(),
        '/api/services/export.csv',
        'MSS_services_20230128.csv'
      );
    });

    it("reste robuste en cas d'échec de génération de CSV", async () => {
      testeur.adaptateurCsv().genereCsvServices = async () => {
        throw new Error();
      };

      const reponse = await testeur.get('/api/services/export.csv');
      expect(reponse.status).to.be(424);
    });
  });

  describe('quand requête PUT sur `/api/motDePasse`', () => {
    let utilisateur;

    beforeEach(() => {
      utilisateur = {
        id: '123',
        email: 'jean.dujardin@beta.gouv.fr',
        genereToken: (source) => `un token de source ${source}`,
        accepteCGU: () => true,
        estUnInvite: () => false,
      };

      const depotDonnees = testeur.depotDonnees();
      depotDonnees.utilisateur = async () => utilisateur;
      depotDonnees.metsAJourMotDePasse = async () => {};
      depotDonnees.supprimeIdResetMotDePassePourUtilisateur = async () => {};
      depotDonnees.valideAcceptationCGUPourUtilisateur = async () =>
        utilisateur;
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['cguAcceptees', 'infolettreAcceptee'],
          testeur.app(),
          {
            method: 'put',
            url: '/api/motDePasse',
            data: { motDePasse: 'mdp', cguAcceptees: true },
          }
        );
    });

    it('met à jour le mot de passe', async () => {
      let majMotDePasse;

      expect(utilisateur.id).to.equal('123');

      testeur.middleware().reinitialise({ idUtilisateur: utilisateur.id });
      testeur.depotDonnees().metsAJourMotDePasse = async (
        idUtilisateur,
        motDePasse
      ) => {
        majMotDePasse = { idUtilisateur, motDePasse };
      };

      const reponse = await testeur.put('/api/motDePasse', {
        motDePasse: 'mdp_ABC12345',
      });

      expect(majMotDePasse).to.eql({
        idUtilisateur: '123',
        motDePasse: 'mdp_ABC12345',
      });
      expect(reponse.status).to.equal(200);
      expect(reponse.body).to.eql({ idUtilisateur: '123' });
    });

    it("retourne une erreur HTTP 422 si le mot de passe n'est pas assez robuste", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Mot de passe trop simple',
        {
          method: 'put',
          url: '/api/motDePasse',
          data: { motDePasse: '1234' },
        }
      );
    });

    it('pose un nouveau cookie', async () => {
      const reponse = await testeur.put('/api/motDePasse', {
        motDePasse: 'mdp_ABC12345',
      });
      await testeur.verifieSessionDeposee(reponse);
    });

    it('ajoute une session utilisateur', async () => {
      const reponse = await testeur.put('/api/motDePasse', {
        motDePasse: 'mdp_ABC12345',
      });

      expectContenuSessionValide(reponse, 'MSS', true, false);
    });

    it("inscrit l'utilisateur aux emails transactionnels Brevo", async () => {
      let inscriptionEffectuee;

      testeur.adaptateurMail().inscrisEmailsTransactionnels = async (
        emailUtilisateur
      ) => {
        inscriptionEffectuee = emailUtilisateur;
      };

      await testeur.put('/api/motDePasse', {
        motDePasse: 'mdp_ABC12345',
      });

      expect(inscriptionEffectuee).to.equal('jean.dujardin@beta.gouv.fr');
    });

    it("ajoute l'utilisateur à la newsletter Brevo si l'utilisateur le souhaite et persiste ce choix", async () => {
      let inscriptionEffectuee;
      let utilisateurPersiste;

      testeur.adaptateurMail().inscrisInfolettre = async (emailUtilisateur) => {
        inscriptionEffectuee = emailUtilisateur;
      };

      testeur.depotDonnees().metsAJourUtilisateur = async (
        idUtilisateur,
        donnees
      ) => {
        utilisateurPersiste = { idUtilisateur, donnees };
      };

      await testeur.put('/api/motDePasse', {
        motDePasse: 'mdp_ABC12345',
        infolettreAcceptee: 'true',
      });

      expect(inscriptionEffectuee).to.equal('jean.dujardin@beta.gouv.fr');
      expect(utilisateurPersiste).to.eql({
        idUtilisateur: '123',
        donnees: { infolettreAcceptee: true },
      });
    });

    it("invalide l'identifiant de réinitialisation de mot de passe", async () => {
      expect(utilisateur.id).to.equal('123');

      let utilisateurQuiEstReset;
      testeur.depotDonnees().supprimeIdResetMotDePassePourUtilisateur = async (
        u
      ) => {
        utilisateurQuiEstReset = u;
      };

      await testeur.put('/api/motDePasse', {
        motDePasse: 'mdp_ABC12345',
      });

      expect(utilisateurQuiEstReset.id).to.be('123');
    });

    describe("si les CGU n'ont pas déjà été acceptées", () => {
      beforeEach(() => {
        const cguNonAcceptees = false;
        testeur.middleware().reinitialise({
          idUtilisateur: utilisateur.id,
          acceptationCGU: cguNonAcceptees,
        });
      });

      describe("et que l'utilisateur n'est pas en train de les accepter", () => {
        it('renvoie une erreur HTTP 422', async () => {
          await testeur.verifieRequeteGenereErreurHTTP(
            422,
            'CGU non acceptées',
            {
              method: 'put',
              url: '/api/motDePasse',
              data: { motDePasse: 'mdp_12345' },
            }
          );
        });

        it('ne met pas le mot de passe à jour', async () => {
          let motDePasseMisAJour = false;
          testeur.depotDonnees().metsAJourMotDePasse = async () => {
            motDePasseMisAJour = true;
          };

          const reponse = await testeur.put('/api/motDePasse', {
            motDePasse: 'mdp_12345',
          });
          expect(reponse.status).to.be(422);
          expect(motDePasseMisAJour).to.be(false);
        });
      });

      describe("et que l'utilisateur est en train de les accepter", () => {
        it("demande au dépôt d'enregistrer que les CGU sont acceptées", async () => {
          expect(utilisateur.id).to.equal('123');

          let utilisateurQuiAccepte;
          testeur.depotDonnees().valideAcceptationCGUPourUtilisateur = async (
            u
          ) => {
            utilisateurQuiAccepte = u;
            return u;
          };

          await testeur.put('/api/motDePasse', {
            motDePasse: 'mdp_ABC12345',
            cguAcceptees: 'true',
          });

          expect(utilisateurQuiAccepte.id).to.be('123');
        });

        it('met à jour le mot de passe', async () => {
          let motDePasseMisAJour = false;
          testeur.depotDonnees().metsAJourMotDePasse = async () => {
            motDePasseMisAJour = true;
          };

          await testeur.put('/api/motDePasse', {
            motDePasse: 'mdp_ABC12345',
            cguAcceptees: 'true',
          });

          expect(motDePasseMisAJour).to.be(true);
        });
      });
    });
  });

  describe('quand requête PUT sur `/api/utilisateur/acceptationCGU`', () => {
    let utilisateur;
    beforeEach(() => {
      utilisateur = {
        id: '123',
        email: 'jean.dujardin@beta.gouv.fr',
        genereToken: (source) => `un token de source ${source}`,
        accepteCGU: () => true,
        estUnInvite: () => false,
      };

      const depotDonnees = testeur.depotDonnees();
      depotDonnees.utilisateur = async () => utilisateur;
      depotDonnees.valideAcceptationCGUPourUtilisateur = async () =>
        utilisateur;
      testeur.middleware().reinitialise({
        idUtilisateur: utilisateur.id,
        acceptationCGU: false,
        authentificationAUtiliser: SourceAuthentification.AGENT_CONNECT,
      });
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur.middleware().verifieRequeteExigeJWT(testeur.app(), {
        method: 'PUT',
        url: '/api/utilisateur/acceptationCGU',
      });
    });

    it("demande au dépôt d'enregistrer que les CGU sont acceptées", async () => {
      let utilisateurQuiAccepte;
      testeur.depotDonnees().valideAcceptationCGUPourUtilisateur = async (
        u
      ) => {
        utilisateurQuiAccepte = u;
        return u;
      };

      await testeur.put('/api/utilisateur/acceptationCGU', {
        cguAcceptees: 'true',
      });

      expect(utilisateurQuiAccepte.id).to.be('123');
    });

    it('ajoute une session utilisateur', async () => {
      const reponse = await testeur.put('/api/utilisateur/acceptationCGU', {
        cguAcceptees: 'true',
      });

      expectContenuSessionValide(reponse, 'AGENT_CONNECT', true, false);
    });
  });

  describe('quand requête PATCH sur `/api/motDePasse', () => {
    let utilisateur;
    beforeEach(() => {
      utilisateur = { id: '123' };
      testeur.depotDonnees().metsAJourMotDePasse = async () => utilisateur;
    });

    it('utilise le middleware de challenge du mot de passe', async () => {
      await testeurMSS()
        .middleware()
        .verifieChallengeMotDePasse(testeur.app(), {
          method: 'patch',
          url: '/api/motDePasse',
        });
    });

    it('met à jour le mot de passe', async () => {
      let motDePasseMisAJour = false;
      testeur.middleware().reinitialise({ idUtilisateur: utilisateur.id });
      testeur.depotDonnees().metsAJourMotDePasse = async (
        idUtilisateur,
        motDePasse
      ) => {
        expect(idUtilisateur).to.equal('123');
        expect(motDePasse).to.equal('mdp_ABC12345');
        motDePasseMisAJour = true;
        return utilisateur;
      };

      const reponse = await testeur.patch('/api/motDePasse', {
        motDePasse: 'mdp_ABC12345',
      });

      expect(motDePasseMisAJour).to.be(true);
      expect(reponse.status).to.equal(200);
      expect(reponse.body).to.eql({ idUtilisateur: '123' });
    });

    it("retourne une erreur HTTP 422 si le mot de passe n'est pas assez robuste", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Mot de passe trop simple',
        {
          method: 'patch',
          url: '/api/motDePasse',
          data: { motDePasse: '1234' },
        }
      );
    });
  });

  describe('quand requête PUT sur `/api/utilisateur`', () => {
    let utilisateur;
    let donneesRequete;

    beforeEach(() => {
      utilisateur = unUtilisateur().avecId('123').construis();

      donneesRequete = {
        prenom: 'Jean',
        nom: 'Dupont',
        telephone: '0100000000',
        postes: ['RSSI', "Chargé des systèmes d'informations"],
        siretEntite: '13000766900018',
        estimationNombreServices: {
          borneBasse: 1,
          borneHaute: 10,
        },
        infolettreAcceptee: 'true',
        transactionnelAccepte: 'true',
        cguAcceptees: 'true',
      };

      testeur.referentiel().departement = () => 'Paris';
      const depotDonnees = testeur.depotDonnees();
      depotDonnees.metsAJourUtilisateur = async () => utilisateur;
      depotDonnees.utilisateur = async () => utilisateur;
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          [
            'prenom',
            'nom',
            'telephone',
            'cguAcceptees',
            'infolettreAcceptee',
            'transactionnelAccepte',
            'postes.*',
            'estimationNombreServices.*',
            'siretEntite',
          ],
          testeur.app(),
          {
            method: 'put',
            url: '/api/utilisateur',
            data: donneesRequete,
          }
        );
    });

    it("est en erreur 422  quand les propriétés de l'utilisateur ne sont pas valides", async () => {
      donneesRequete.prenom = '';

      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        'La mise à jour de l\'utilisateur a échoué car les paramètres sont invalides. La propriété "prenom" est requise',
        {
          method: 'put',
          url: '/api/utilisateur',
          data: donneesRequete,
        }
      );
    });

    it("met à jour les autres informations de l'utilisateur", async () => {
      let idRecu;
      let donneesRecues;
      testeur.referentiel().recharge({ versionActuelleCgu: 'v2.0' });
      testeur.middleware().reinitialise({ idUtilisateur: utilisateur.id });
      testeur.depotDonnees().metsAJourUtilisateur = async (id, donnees) => {
        idRecu = id;
        donneesRecues = donnees;
        return utilisateur;
      };

      const reponse = await testeur.put('/api/utilisateur', donneesRequete);

      expect(reponse.status).to.equal(200);
      expect(reponse.body).to.eql({ idUtilisateur: '123' });
      expect(idRecu).to.equal('123');
      expect(donneesRecues.prenom).to.equal('Jean');
      expect(donneesRecues.nom).to.equal('Dupont');
      expect(donneesRecues.telephone).to.equal('0100000000');
      expect(donneesRecues.entite.siret).to.equal('13000766900018');
      expect(donneesRecues.infolettreAcceptee).to.equal(true);
      expect(donneesRecues.transactionnelAccepte).to.equal(true);
      expect(donneesRecues.postes).to.eql([
        'RSSI',
        "Chargé des systèmes d'informations",
      ]);
    });

    describe("concernant l'acceptation des CGU", () => {
      it('quand les CGU sont acceptées, passe la dernière version des CGU au dépôt de données', async () => {
        let versionCGURecue;
        testeur.referentiel().recharge({ versionActuelleCgu: 'v2.0' });
        testeur.depotDonnees().metsAJourUtilisateur = async (_, donnees) => {
          versionCGURecue = donnees.cguAcceptees;
          return utilisateur;
        };

        await testeur.put('/api/utilisateur', donneesRequete);

        expect(versionCGURecue).to.be('v2.0');
      });

      it('quand les CGU ne sont pas présentes, ne les passe pas au dépôt de données', async () => {
        let versionCGURecue;
        testeur.depotDonnees().metsAJourUtilisateur = async (_, donnees) => {
          versionCGURecue = donnees.cguAcceptees;
          return utilisateur;
        };
        delete donneesRequete.cguAcceptees;

        await testeur.put('/api/utilisateur', donneesRequete);

        expect(versionCGURecue).to.be(undefined);
      });
    });

    it("met à jour les préférences de communication de l'utilisateur", async () => {
      let preferencesChangees;
      testeur.middleware().reinitialise({ idUtilisateur: utilisateur.id });

      testeur.depotDonnees().utilisateur = async () => {
        const u = unUtilisateur().construis();

        u.changePreferencesCommunication = async (nouvellesPreferences) => {
          preferencesChangees = nouvellesPreferences;
        };

        return u;
      };

      donneesRequete.infolettreAcceptee = 'true';
      donneesRequete.transactionnelAccepte = 'true';
      await testeur.put('/api/utilisateur', donneesRequete);

      expect(preferencesChangees).to.eql({
        infolettreAcceptee: true,
        transactionnelAccepte: true,
      });
    });
  });

  describe('quand requête GET sur `/api/utilisateurCourant`', () => {
    it("renvoie des infos de l'utilisateur correspondant à l'identifiant", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      let idUtilisateurRecu = null;
      const depotDonnees = testeur.depotDonnees();
      depotDonnees.utilisateur = async (idUtilisateur) => {
        idUtilisateurRecu = idUtilisateur;
        return unUtilisateur()
          .quiSAppelle('Marie Jeanne')
          .quiTravaillePourUneEntiteAvecSiret('12345')
          .construis();
      };

      const reponse = await testeur.get('/api/utilisateurCourant');

      expect(reponse.status).to.equal(200);
      expect(idUtilisateurRecu).to.equal('123');
      const { utilisateur } = reponse.body;
      expect(utilisateur.prenomNom).to.equal('Marie Jeanne');
    });

    it("renvoie la source d'authentification", async () => {
      testeur
        .middleware()
        .reinitialise({ idUtilisateur: '123', sourceAuth: 'MSS' });
      const depotDonnees = testeur.depotDonnees();
      depotDonnees.utilisateur = async () => unUtilisateur().construis();

      const reponse = await testeur.get('/api/utilisateurCourant');

      const { sourceAuthentification } = reponse.body;
      expect(sourceAuthentification).to.equal('MSS');
    });

    it("répond avec un code 401 quand il n'y a pas d'identifiant", async () => {
      await testeur.middleware().reinitialise({ idUtilisateur: '' });

      const reponse = await testeur.get('/api/utilisateurCourant');
      expect(reponse.status).to.equal(401);
    });
  });

  describe('quand requête POST sur `/api/autorisation`', () => {
    beforeEach(() => {
      testeur.depotDonnees().utilisateur = async () =>
        unUtilisateur().construis();
      testeur.depotDonnees().service = async () => unService().construis();

      testeur.procedures().ajoutContributeurSurServices = async () => {};
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['idServices.*', 'emailContributeur'],
          testeur.app(),
          {
            method: 'post',
            url: '/api/autorisation',
            data: { droits: tousDroitsEnEcriture() },
          }
        );
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'post',
          url: '/api/autorisation',
          data: { droits: tousDroitsEnEcriture() },
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

      await testeur.post('/api/autorisation', {
        emailContributeur: 'jean.dupont@mail.fr',
        idServices: ['123'],
        droits: droitsEnvoyes,
      });

      expect(ajout.emailContributeur).to.be('jean.dupont@mail.fr');
      expect(ajout.services[0].id).to.be('123');
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

      await testeur.post('/api/autorisation', {
        emailContributeur: 'jean.dupont@mail.fr',
        idServices: ['123', '456'],
        droits: tousDroitsEnEcriture(),
      });

      expect(cibles.length).to.be(2);
      expect(cibles[0].id).to.be('123');
      expect(cibles[1].id).to.be('456');
    });

    it("met l'email du contributeur en minuscules pour éviter de créer des comptes en double", async () => {
      let ajout;

      testeur.procedures().ajoutContributeurSurServices = async (
        emailContributeur
      ) => {
        ajout = { emailContributeur };
      };

      await testeur.post('/api/autorisation', {
        emailContributeur: 'JEAN.DUPONT@MAIL.FR',
        idServices: ['123'],
        droits: tousDroitsEnEcriture(),
      });

      const enMinucsules = 'jean.dupont@mail.fr';
      expect(ajout.emailContributeur).to.be(enMinucsules);
    });

    it("retourne une erreur HTTP 403 si l'utilisateur n'a pas le droit d'ajouter un contributeur", async () => {
      testeur.procedures().ajoutContributeurSurServices = async () => {
        throw new EchecAutorisation();
      };

      const reponse = await testeur.post('/api/autorisation', {
        emailContributeur: 'jean.dupont@mail.fr',
        idServices: ['123'],
        droits: tousDroitsEnEcriture(),
      });
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
        data: { droits: tousDroitsEnEcriture() },
      });
    });

    it('retourne une erreur HTTP 422 si les droits sont incohérents', async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        { erreur: { code: 'DROITS_INCOHERENTS' } },
        {
          method: 'post',
          url: '/api/autorisation',
          data: { droits: { RUBRIQUE_INCONNUE: 2 } },
        }
      );
    });

    it('ne retourne pas une erreur HTTP 422 si les droits contiennent estProprietaire=false', async () => {
      const reponse = await testeur.post('/api/autorisation', {
        emailContributeur: 'jean.dupont@mail.fr',
        idServices: ['123'],
        droits: {
          estProprietaire: false,
        },
      });

      expect(reponse.status).to.be(200);
    });
  });

  describe('quand requête DELETE sur `/api/autorisation`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: '456' });
      testeur.depotDonnees().autorisationPour = async () =>
        uneAutorisation().deProprietaire().construis();
      testeur.depotDonnees().supprimeContributeur = async () => {};
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['idService', 'idContributeur'],
          testeur.app(),
          { method: 'delete', url: '/api/autorisation' }
        );
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'delete',
          url: '/api/autorisation',
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

      await testeur.delete('/api/autorisation?idService=123');

      expect(autorisationCherchee.idUtilisateur).to.be('456');
      expect(autorisationCherchee.idService).to.be('123');
    });

    it("retourne une erreur HTTP 403 si l'utilisateur n'a pas le droit de supprimer un contributeur", async () => {
      const contributeurSimple = uneAutorisation().deContributeur().construis();
      testeur.depotDonnees().autorisationPour = async () => contributeurSimple;

      const reponse = await testeur.delete('/api/autorisation?idService=123');
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

      await testeur.delete(
        '/api/autorisation?idService=ABC&idContributeur=999'
      );

      expect(suppressionDemandee.idContributeur).to.be('999');
      expect(suppressionDemandee.idService).to.be('ABC');
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

      await testeur.delete(
        '/api/autorisation?idService=ABC&idContributeur=999'
      );

      expect(suppressionDemandee.idContributeur).to.be('999');
      expect(suppressionDemandee.idService).to.be('ABC');
    });

    it("retourne une erreur HTTP 424 si le dépôt ne peut pas supprimer l'autorisation", async () => {
      testeur.depotDonnees().supprimeContributeur = async () => {
        throw new Error("Un message d'erreur");
      };

      const reponse = await testeur.delete(
        '/api/autorisation?idService=123&emailContributeur=jean.dupont@mail.fr'
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

    it('aseptise la chaine de recherche', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(['recherche'], testeur.app(), {
          method: 'get',
          url: '/api/annuaire/contributeurs',
        });
    });

    it('retourne une erreur HTTP 400 si le terme de recherche est vide', async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        400,
        'Le terme de recherche ne peut pas être vide',
        {
          method: 'get',
          url: '/api/annuaire/contributeurs',
        }
      );
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
        url: '/api/supervision',
      });
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['filtreDate', 'filtreBesoinsSecurite', 'filtreEntite'],
          testeur.app(),
          {
            method: 'get',
            url: '/api/supervision',
          }
        );
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
      testeur.referentiel().recharge({
        optionsFiltrageDate: { unFiltreDate: '' },
        niveauxDeSecurite: ['niveau1'],
      });
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.serviceSupervision().genereURLSupervision = (_, filtrage) => {
        filtrageRecu = filtrage;
        return 'https://uneURLSupervision.fr';
      };

      await testeur.get(
        '/api/supervision?filtreDate=unFiltreDate&filtreBesoinsSecurite=niveau1&filtreEntite=unSiret'
      );

      expect(filtrageRecu.filtreDate).to.be('unFiltreDate');
      expect(filtrageRecu.filtreBesoinsSecurite).to.be('niveau1');
      expect(filtrageRecu.filtreEntite).to.be('unSiret');
    });
  });

  describe('quand requête GET sur `/api/referentiel/mesures`', () => {
    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(
          testeur.app(),
          '/api/referentiel/mesures'
        );
    });

    it('retourne la liste des mesures du référentiel', async () => {
      testeur.referentiel().recharge({
        mesures: {
          mesureA: 'une mesure A',
          mesureB: 'une mesure B',
        },
      });

      const reponse = await testeur.get('/api/referentiel/mesures');

      expect(reponse.status).to.be(200);
      expect(reponse.body).to.eql({
        mesureA: 'une mesure A',
        mesureB: 'une mesure B',
      });
    });
  });

  describe('quand requête GET sur `/api/modeles/mesureSpecifique`', () => {
    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(
          testeur.app(),
          '/api/modeles/mesureSpecifique'
        );
    });

    it("délègue au dépôt de données la lecture des modèles de mesure spécifique de l'utilisateur courant", async () => {
      let idRecu;
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.depotDonnees().lisModelesMesureSpecifiquePourUtilisateur = async (
        idUtilisateur
      ) => {
        idRecu = idUtilisateur;
        return [];
      };

      const reponse = await testeur.get('/api/modeles/mesureSpecifique');

      expect(reponse.status).to.be(200);
      expect(reponse.body).to.eql([]);
      expect(idRecu).to.be('U1');
    });

    it('décode les entités HTML dans le contenu renvoyé', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.depotDonnees().lisModelesMesureSpecifiquePourUtilisateur =
        async () => [
          {
            id: 'MOD-1',
            idsServicesAssocies: [],
            description: 'L&#x27;abricot &lt;&gt;',
            descriptionLongue: 'L&#x27;artiste',
            categorie: 'gouvernance',
          },
        ];

      const reponse = await testeur.get('/api/modeles/mesureSpecifique');

      expect(reponse.body[0].description).to.be("L'abricot <>");
      expect(reponse.body[0].descriptionLongue).to.be("L'artiste");
    });
  });

  describe('quand requête POST sur `/api/modeles/mesureSpecifique`', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        categoriesMesures: {
          gouvernance: {},
        },
      });
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'post',
          url: '/api/modeles/mesureSpecifique',
        });
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['description', 'descriptionLongue', 'categorie'],
          testeur.app(),
          {
            method: 'post',
            url: '/api/modeles/mesureSpecifique',
          }
        );
    });

    it('jette une erreur si la catégorie est invalide', async () => {
      const reponse = await testeur.post('/api/modeles/mesureSpecifique', {
        description: 'une description',
        descriptionLongue: 'une description longue',
        categorie: 'une categorie invalide',
      });

      expect(reponse.status).to.be(400);
      expect(reponse.text).to.be('La catégorie est invalide');
    });

    it("jette une erreur si la description n'est pas renseignée", async () => {
      const reponse = await testeur.post('/api/modeles/mesureSpecifique', {
        description: '',
        descriptionLongue: 'une description longue',
        categorie: 'gouvernance',
      });
      expect(reponse.status).to.be(400);
      expect(reponse.text).to.be('La description est obligatoire');
    });

    it("délègue au dépôt de données l'ajout du modèle de mesure spécifique", async () => {
      let donneesRecues;
      testeur.depotDonnees().ajouteModeleMesureSpecifique = async (
        idUtilisateur,
        donnees
      ) => {
        donneesRecues = { idUtilisateur, donnees };
      };

      await testeur.post('/api/modeles/mesureSpecifique', {
        description: 'une description',
        descriptionLongue: 'une description longue',
        categorie: 'gouvernance',
      });

      expect(donneesRecues.idUtilisateur).to.be('U1');
      expect(donneesRecues.donnees).to.eql({
        description: 'une description',
        descriptionLongue: 'une description longue',
        categorie: 'gouvernance',
      });
    });

    it('jette une erreur si la limite de création de modèles est atteinte', async () => {
      testeur.depotDonnees().ajouteModeleMesureSpecifique = async () => {
        throw new ErreurNombreLimiteModelesMesureSpecifiqueAtteint();
      };

      const reponse = await testeur.post('/api/modeles/mesureSpecifique', {
        description: 'une description',
        categorie: 'gouvernance',
      });
      expect(reponse.status).to.be(403);
      expect(reponse.text).to.be('Limite de création atteinte');
    });

    it("retourne 201 et l'identifiant du modèle créé", async () => {
      testeur.depotDonnees().ajouteModeleMesureSpecifique = async () => 'MOD-1';

      const reponse = await testeur.post('/api/modeles/mesureSpecifique', {
        description: 'une description',
        categorie: 'gouvernance',
      });

      expect(reponse.status).to.be(201);
      expect(reponse.body).to.eql({
        id: 'MOD-1',
      });
    });
  });

  describe('quand requête PUT sur `/api/modeles/mesureSpecifique/idModele`', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        categoriesMesures: {
          gouvernance: {},
        },
      });
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'put',
          url: '/api/modeles/mesureSpecifique/unIdDeModele',
        });
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['description', 'descriptionLongue', 'categorie'],
          testeur.app(),
          {
            method: 'put',
            url: '/api/modeles/mesureSpecifique/unIdDeModele',
          }
        );
    });

    it("jette une erreur si le modele de mesure spécifique n'existe pas", async () => {
      testeur.depotDonnees().lisModelesMesureSpecifiquePourUtilisateur =
        async () => [];

      const reponse = await testeur.put(
        '/api/modeles/mesureSpecifique/unIdInexistant',
        {
          description: 'une description',
          descriptionLongue: 'une description longue',
          categorie: 'gouvernance',
        }
      );

      expect(reponse.status).to.be(404);
    });

    describe('quand le modèle de mesure spécifique existe', () => {
      beforeEach(() => {
        testeur.depotDonnees().lisModelesMesureSpecifiquePourUtilisateur =
          async () => [
            {
              id: 'MOD-1',
              description: 'une description',
              categorie: 'gouvernance',
              descriptionLongue: 'une description longue',
            },
          ];
      });

      it('jette une erreur si la catégorie est invalide', async () => {
        const reponse = await testeur.put(
          '/api/modeles/mesureSpecifique/MOD-1',
          {
            description: 'une description',
            descriptionLongue: 'une description longue',
            categorie: 'une categorie invalide',
          }
        );

        expect(reponse.status).to.be(400);
        expect(reponse.text).to.be('La catégorie est invalide');
      });

      it("jette une erreur si la description n'est pas renseignée", async () => {
        const reponse = await testeur.put(
          '/api/modeles/mesureSpecifique/MOD-1',
          {
            description: '',
            descriptionLongue: 'une description longue',
            categorie: 'gouvernance',
          }
        );

        expect(reponse.status).to.be(400);
        expect(reponse.text).to.be('La description est obligatoire');
      });

      it('délègue au dépôt de données la mise à jour du modèle de mesure spécifique', async () => {
        let donneesRecues;
        testeur.depotDonnees().metsAJourModeleMesureSpecifique = async (
          idUtilisateur,
          idModele,
          donnees
        ) => {
          donneesRecues = { idUtilisateur, idModele, donnees };
        };

        const reponse = await testeur.put(
          '/api/modeles/mesureSpecifique/MOD-1',
          {
            description: 'une description',
            descriptionLongue: 'une description longue',
            categorie: 'gouvernance',
          }
        );

        expect(donneesRecues.idUtilisateur).to.be('U1');
        expect(donneesRecues.idModele).to.be('MOD-1');
        expect(donneesRecues.donnees).to.eql({
          description: 'une description',
          descriptionLongue: 'une description longue',
          categorie: 'gouvernance',
        });
        expect(reponse.status).to.be(200);
      });
    });
  });

  describe('quand requête PUT sur `/api/modeles/mesureSpecifique/:idModele/services`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.depotDonnees().associeModeleMesureSpecifiqueAuxServices =
        () => {};
      testeur.depotDonnees().lisModelesMesureSpecifiquePourUtilisateur =
        async () => [
          {
            id: 'MOD-1',
            description: 'une description',
            categorie: 'gouvernance',
            descriptionLongue: 'une description longue',
          },
        ];
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'put',
          url: '/api/modeles/mesureSpecifique/MOD-1/services',
        });
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['idsServicesAAssocier.*'],
          testeur.app(),
          {
            method: 'put',
            url: '/api/modeles/mesureSpecifique/MOD-1/services',
          }
        );
    });

    it("jette une erreur si le modele de mesure spécifique n'existe pas", async () => {
      const reponse = await testeur.put(
        '/api/modeles/mesureSpecifique/unIdInexistant/services'
      );

      expect(reponse.status).to.be(404);
    });

    it("délègue au dépôt de données l'association des services au modèle de mesure spécifique", async () => {
      let donneesRecues;
      testeur.depotDonnees().associeModeleMesureSpecifiqueAuxServices = async (
        idModele,
        idsServices,
        idUtilisateurAssociant
      ) => {
        donneesRecues = { idModele, idsServices, idUtilisateurAssociant };
      };

      const reponse = await testeur.put(
        '/api/modeles/mesureSpecifique/MOD-1/services',
        {
          idsServicesAAssocier: ['S1', 'S2'],
        }
      );

      expect(donneesRecues.idUtilisateurAssociant).to.be('U1');
      expect(donneesRecues.idModele).to.be('MOD-1');
      expect(donneesRecues.idsServices).to.eql(['S1', 'S2']);
      expect(reponse.status).to.be(200);
    });

    it('jette une erreur si un service est déjà associé', async () => {
      testeur.depotDonnees().associeModeleMesureSpecifiqueAuxServices =
        async () => {
          throw new ErreurModeleDeMesureSpecifiqueDejaAssociee();
        };
      const reponse = await testeur.put(
        '/api/modeles/mesureSpecifique/MOD-1/services'
      );
      expect(reponse.status).to.be(400);
    });

    it('jette une erreur si les droits de modification de services sont insuffisants', async () => {
      testeur.depotDonnees().associeModeleMesureSpecifiqueAuxServices =
        async () => {
          throw new ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique();
        };
      const reponse = await testeur.put(
        '/api/modeles/mesureSpecifique/MOD-1/services'
      );
      expect(reponse.status).to.be(403);
    });

    it("jette une erreur si l'utilisateur ne possède pas le modèle", async () => {
      testeur.depotDonnees().associeModeleMesureSpecifiqueAuxServices =
        async () => {
          throw new ErreurAutorisationInexistante();
        };
      const reponse = await testeur.put(
        '/api/modeles/mesureSpecifique/MOD-1/services'
      );
      expect(reponse.status).to.be(404);
    });

    it("jette une erreur si l'un des services n'existe pas", async () => {
      testeur.depotDonnees().associeModeleMesureSpecifiqueAuxServices =
        async () => {
          throw new ErreurServiceInexistant();
        };
      const reponse = await testeur.put(
        '/api/modeles/mesureSpecifique/MOD-1/services'
      );
      expect(reponse.status).to.be(400);
    });
  });

  describe('quand requête DELETE sur `/api/modeles/mesureSpecifique/:idModele`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtMesuresAssociees =
        () => {};
      testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtDetacheMesuresAssociees =
        () => {};
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'delete',
          url: '/api/modeles/mesureSpecifique/MOD-1',
        });
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(['detacheMesures'], testeur.app(), {
          method: 'delete',
          url: '/api/modeles/mesureSpecifique/MOD-1',
        });
    });

    describe('sans paramètre pour conserver les mesures associées', () => {
      it('délègue au dépôt de données la suppression du service', async () => {
        let donneesRecues;
        testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtMesuresAssociees =
          async (idUtilisateur, idModele) => {
            donneesRecues = { idUtilisateur, idModele };
          };

        await testeur.delete('/api/modeles/mesureSpecifique/MOD-1');

        expect(donneesRecues.idUtilisateur).to.be('U1');
        expect(donneesRecues.idModele).to.be('MOD-1');
      });

      it("jette une 404 si le modele n'existe pas", async () => {
        testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtMesuresAssociees =
          async () => {
            throw new ErreurModeleDeMesureSpecifiqueIntrouvable(
              'MOD-INEXISTANT'
            );
          };
        const reponse = await testeur.delete(
          '/api/modeles/mesureSpecifique/MOD-INEXISTANT'
        );
        expect(reponse.status).to.be(404);
      });

      it("jette une 403 si l'utilisateur ne possède pas le modèle", async () => {
        testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtMesuresAssociees =
          async () => {
            throw new ErreurAutorisationInexistante();
          };
        const reponse = await testeur.delete(
          '/api/modeles/mesureSpecifique/MOD-1'
        );
        expect(reponse.status).to.be(403);
      });

      it("jette une 403 si l'utilisateur ne peut pas modifier tous les services associés", async () => {
        testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtMesuresAssociees =
          async () => {
            throw new ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique(
              'U1',
              ['S1'],
              {}
            );
          };
        const reponse = await testeur.delete(
          '/api/modeles/mesureSpecifique/MOD-1'
        );
        expect(reponse.status).to.be(403);
      });
    });
    describe('avec paramètre pour détacher les mesures associées', () => {
      it('délègue au dépôt de données la suppression du service et le détachement des mesures associées', async () => {
        let donneesRecues;
        testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtDetacheMesuresAssociees =
          async (idUtilisateur, idModele) => {
            donneesRecues = { idUtilisateur, idModele };
          };

        await testeur.delete(
          '/api/modeles/mesureSpecifique/MOD-1?detacheMesures=true'
        );

        expect(donneesRecues.idUtilisateur).to.be('U1');
        expect(donneesRecues.idModele).to.be('MOD-1');
      });
    });

    it("jette une 404 si le modele n'existe pas", async () => {
      testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtDetacheMesuresAssociees =
        async () => {
          throw new ErreurModeleDeMesureSpecifiqueIntrouvable('MOD-INEXISTANT');
        };
      const reponse = await testeur.delete(
        '/api/modeles/mesureSpecifique/MOD-INEXISTANT?detacheMesures=true'
      );
      expect(reponse.status).to.be(404);
    });

    it("jette une 403 si l'utilisateur ne possède pas le modèle", async () => {
      testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtDetacheMesuresAssociees =
        async () => {
          throw new ErreurAutorisationInexistante();
        };
      const reponse = await testeur.delete(
        '/api/modeles/mesureSpecifique/MOD-1?detacheMesures=true'
      );
      expect(reponse.status).to.be(403);
    });

    it("jette une 403 si l'utilisateur ne peut pas modifier tous les services associés", async () => {
      testeur.depotDonnees().supprimeModeleMesureSpecifiqueEtDetacheMesuresAssociees =
        async () => {
          throw new ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique(
            'U1',
            ['S1'],
            {}
          );
        };
      const reponse = await testeur.delete(
        '/api/modeles/mesureSpecifique/MOD-1?detacheMesures=true'
      );
      expect(reponse.status).to.be(403);
    });
  });

  describe('quand requête DELETE sur `/api/modeles/mesureSpecifique/:idModele/services`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.depotDonnees().supprimeDesMesuresAssocieesAuModele =
        async () => {};
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'delete',
          url: '/api/modeles/mesureSpecifique/MOD-1/services',
        });
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(['idsServices.*'], testeur.app(), {
          method: 'delete',
          url: '/api/modeles/mesureSpecifique/MOD-1/services',
        });
    });

    it('délègue au dépôt de données la suppression des mesures associées au modèle', async () => {
      let donneesRecues;
      testeur.depotDonnees().supprimeDesMesuresAssocieesAuModele = async (
        idUtilisateur,
        idModele,
        idsServices
      ) => {
        donneesRecues = { idUtilisateur, idModele, idsServices };
      };

      await testeur.delete('/api/modeles/mesureSpecifique/MOD-1/services', {
        idsServices: ['S1'],
      });

      expect(donneesRecues.idUtilisateur).to.be('U1');
      expect(donneesRecues.idModele).to.be('MOD-1');
      expect(donneesRecues.idsServices).to.eql(['S1']);
    });

    it("jette une 404 si le modele n'existe pas", async () => {
      testeur.depotDonnees().supprimeDesMesuresAssocieesAuModele = async () => {
        throw new ErreurModeleDeMesureSpecifiqueIntrouvable('MOD-INEXISTANT');
      };
      const reponse = await testeur.delete(
        '/api/modeles/mesureSpecifique/MOD-INEXISTANT/services'
      );
      expect(reponse.status).to.be(404);
    });

    it("jette une 403 si l'utilisateur ne possède pas le modèle", async () => {
      testeur.depotDonnees().supprimeDesMesuresAssocieesAuModele = async () => {
        throw new ErreurAutorisationInexistante();
      };
      const reponse = await testeur.delete(
        '/api/modeles/mesureSpecifique/MOD-1/services'
      );
      expect(reponse.status).to.be(403);
    });

    it("jette une 403 si l'utilisateur ne peut pas modifier tous les services passés en paramètres", async () => {
      testeur.depotDonnees().supprimeDesMesuresAssocieesAuModele = async () => {
        throw new ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique(
          'U1',
          ['S1'],
          {}
        );
      };
      const reponse = await testeur.delete(
        '/api/modeles/mesureSpecifique/MOD-1/services'
      );
      expect(reponse.status).to.be(403);
    });

    it("jette une 400 si l'un des services passés en paramètres n'existe pas", async () => {
      testeur.depotDonnees().supprimeDesMesuresAssocieesAuModele = async () => {
        throw new ErreurServiceInexistant();
      };
      const reponse = await testeur.delete(
        '/api/modeles/mesureSpecifique/MOD-1/services'
      );
      expect(reponse.status).to.be(400);
    });
  });
});
