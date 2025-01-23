const axios = require('axios');
const expect = require('expect.js');

const {
  verifieNomFichierServi,
  verifieTypeFichierServiEstCSV,
} = require('../../aides/verifieFichierServi');
const { ErreurModele, EchecAutorisation } = require('../../../src/erreurs');

const testeurMSS = require('../testeurMSS');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const { unService } = require('../../constructeurs/constructeurService');
const {
  uneAutorisation,
} = require('../../constructeurs/constructeurAutorisation');
const {
  Rubriques: { SECURISER },
  Permissions: { LECTURE },
  tousDroitsEnEcriture,
} = require('../../../src/modeles/autorisations/gestionDroits');

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

  afterEach(testeur.arrete);

  it("vérifie que l'utilisateur est authentifié sur toutes les routes", (done) => {
    // On vérifie une seule route privée.
    // Par construction, les autres seront protégées aussi puisque la protection est ajoutée comme middleware
    // devant le routeur dédié aux routes privées.
    testeur
      .middleware()
      .verifieRequeteExigeJWT('http://localhost:1234/api/services', done);
  });

  it("vérifie que l'utilisateur a accepté les CGU sur toutes les routes", (done) => {
    // On vérifie une seule route privée.
    // Par construction, les autres seront protégées aussi puisque la protection est ajoutée comme middleware
    // devant le routeur dédié aux routes privées.
    testeur
      .middleware()
      .verifieRequeteExigeAcceptationCGUAPI(
        'http://localhost:1234/api/services',
        done
      );
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

    it("interroge le dépôt de données pour récupérer les services de l'utilisateur", (done) => {
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

      testeur.depotDonnees().services = (idUtilisateur) => {
        donneesPassees = { idUtilisateur };
        return Promise.resolve([service]);
      };

      axios
        .get('http://localhost:1234/api/services')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);

          const { services } = reponse.data;
          expect(services.length).to.equal(1);
          expect(services[0].id).to.equal('456');
          expect(donneesPassees.idUtilisateur).to.equal('123');
          done();
        })
        .catch(done);
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

      await axios.get('http://localhost:1234/api/services');
      expect(donneesPassees.idUtilisateur).to.equal('123');
    });
  });

  describe('quand requête GET sur `/api/services/indices-cyber`', () => {
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

      await axios.get('http://localhost:1234/api/services/indices-cyber');
      expect(donneesPassees.idUtilisateur).to.equal('123');
    });

    it("interroge le dépôt de données pour récupérer les services de l'utilisateur", (done) => {
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

      axios
        .get('http://localhost:1234/api/services/indices-cyber')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);

          const { services } = reponse.data;
          expect(services.length).to.equal(1);
          expect(services[0].id).to.equal('456');
          expect(donneesPassees.idUtilisateur).to.equal('123');
          done();
        })
        .catch(done);
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

    it('aseptise les identifiants des services à exporter', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['idsServices.*'],
        {
          method: 'get',
          url: 'http://localhost:1234/api/services/export.csv',
        },
        done
      );
    });

    describe('concernant le paramètre en query string `idsServices`', () => {
      it("retourne une erreur 400 si le paramètre n'est pas un tableau", async () => {
        try {
          await axios.get(
            'http://localhost:1234/api/services/export.csv?idsServices[a]=1' // Sera interprété par express comme {a: 1}
          );
          expect().fail("L'appel aurait dû jeter une erreur");
        } catch (e) {
          expect(e.response.status).to.be(400);
        }
      });

      it("fonctionne dans le cas où le tableau ne comporte qu'un seul élément", async () => {
        // Dans le cas d'un seul ID envoyé, express va interpréter cet ID en `string`, pas en `array`.
        // Ce cas de test vérifie qu'on sait bien gérer ce cas d'une `string` qui arrive à l'API
        const queryString = new URLSearchParams();
        queryString.append('idsServices', '123');

        const reponse = await axios.get(
          `http://localhost:1234/api/services/export.csv?${queryString}`
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

      await axios.get('http://localhost:1234/api/services/export.csv');
      expect(donneesPassees).to.eql({ idUtilisateur: '123' });
    });

    it("interroge le dépôt de données pour récupérer les services de l'utilisateur", (done) => {
      let donneesPassees = {};
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      testeur.depotDonnees().services = (idUtilisateur) => {
        donneesPassees = { idUtilisateur };
        return Promise.resolve([service]);
      };

      axios
        .get('http://localhost:1234/api/services/export.csv')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(donneesPassees.idUtilisateur).to.equal('123');
          done();
        })
        .catch(done);
    });

    it('filtre les services en fonction de la requête', (done) => {
      testeur.depotDonnees().services = () =>
        Promise.resolve([
          service,
          unService()
            .avecId('789')
            .avecNomService('Un deuxième service')
            .ajouteUnContributeur(
              unUtilisateur().avecEmail('email.proprietaire@mail.fr').donnees
            )
            .construis(),
        ]);

      testeur.adaptateurCsv().genereCsvServices = (donneesServices) => {
        expect(donneesServices.length).to.be(1);
        expect(donneesServices[0].id).to.equal('456');
        done();
        return Promise.resolve('Fichier CSV');
      };

      axios
        .get('http://localhost:1234/api/services/export.csv?idsServices=456')
        .catch((e) => done(e.response?.data || e));
    });

    it('utilise un adaptateur de CSV pour la génération', (done) => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

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

      axios
        .get('http://localhost:1234/api/services/export.csv?idsServices=456')
        .then(() => {
          expect(adaptateurCsvAppele).to.be(true);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it('sert un fichier de type CSV', (done) => {
      verifieTypeFichierServiEstCSV(
        'http://localhost:1234/api/services/export.csv',
        done
      );
    });

    it('sert un fichier dont le nom contient la date du jour en format court', (done) => {
      testeur.adaptateurHorloge().maintenant = () => new Date(2023, 0, 28);

      verifieNomFichierServi(
        'http://localhost:1234/api/services/export.csv',
        'MSS_services_20230128.csv',
        done
      );
    });

    it("reste robuste en cas d'échec de génération de CSV", (done) => {
      testeur.adaptateurCsv().genereCsvServices = () => Promise.reject();

      axios
        .get('http://localhost:1234/api/services/export.csv')
        .then(() => done('La génération aurait dû lever une erreur'))
        .catch((e) => {
          expect(e.response.status).to.equal(424);
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête POST sur `/api/autorisation`', () => {
    beforeEach(() => {
      testeur.depotDonnees().utilisateur = async () =>
        unUtilisateur().construis();
      testeur.depotDonnees().service = async () => unService().construis();

      testeur.procedures().ajoutContributeurSurServices = async () => {};
    });

    it('aseptise les paramètres de la requête', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['idServices.*', 'emailContributeur'],
        {
          method: 'post',
          url: 'http://localhost:1234/api/autorisation',
          data: { droits: tousDroitsEnEcriture() },
        },
        done
      );
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

      await axios.post('http://localhost:1234/api/autorisation', {
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

      await axios.post('http://localhost:1234/api/autorisation', {
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

      await axios.post('http://localhost:1234/api/autorisation', {
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

      try {
        await axios.post('http://localhost:1234/api/autorisation', {
          emailContributeur: 'jean.dupont@mail.fr',
          idServices: ['123'],
          droits: tousDroitsEnEcriture(),
        });

        expect().to.fail('La requête aurait dû lever une erreur HTTP 403');
      } catch (e) {
        expect(e.response.status).to.equal(403);
        expect(e.response.data).to.equal(
          "Ajout non autorisé d'un contributeur"
        );
      }
    });

    it('retourne une erreur HTTP 422 si la procédure a levé une `ErreurModele`', async () => {
      testeur.procedures().ajoutContributeurSurServices = async () => {
        throw new ErreurModele('oups');
      };

      await testeur.verifieRequeteGenereErreurHTTP(422, 'oups', {
        method: 'post',
        url: 'http://localhost:1234/api/autorisation',
        data: { droits: tousDroitsEnEcriture() },
      });
    });

    it('retourne une erreur HTTP 422 si les droits sont incohérents', async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        { erreur: { code: 'DROITS_INCOHERENTS' } },
        {
          method: 'post',
          url: 'http://localhost:1234/api/autorisation',
          data: { droits: { RUBRIQUE_INCONNUE: 2 } },
        }
      );
    });

    it('ne retourne pas une erreur HTTP 422 si les droits contiennent estProprietaire=false', async () => {
      const reponse = await axios.post(
        'http://localhost:1234/api/autorisation',
        {
          emailContributeur: 'jean.dupont@mail.fr',
          idServices: ['123'],
          droits: {
            estProprietaire: false,
          },
        }
      );

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

    it('aseptise les paramètres de la requête', (done) => {
      testeur
        .middleware()
        .verifieAseptisationParametres(
          ['idService', 'idContributeur'],
          { method: 'delete', url: 'http://localhost:1234/api/autorisation' },
          done
        );
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

      await axios.delete('http://localhost:1234/api/autorisation', {
        params: { idService: '123' },
      });

      expect(autorisationCherchee.idUtilisateur).to.be('456');
      expect(autorisationCherchee.idService).to.be('123');
    });

    it("retourne une erreur HTTP 403 si l'utilisateur n'a pas le droit de supprimer un contributeur", async () => {
      const contributeurSimple = uneAutorisation().deContributeur().construis();
      testeur.depotDonnees().autorisationPour = async () => contributeurSimple;

      try {
        await axios.delete('http://localhost:1234/api/autorisation', {
          params: { idService: '123' },
        });
        expect().fail('La requête aurait dû lever une erreur HTTP 403');
      } catch (e) {
        expect(e.response.status).to.equal(403);
        expect(e.response.data).to.equal(
          'Suppression non autorisé pour un contributeur'
        );
      }
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

      await axios.delete('http://localhost:1234/api/autorisation', {
        params: {
          idService: 'ABC',
          idContributeur: '999',
        },
      });

      expect(suppressionDemandee.idContributeur).to.be('999');
      expect(suppressionDemandee.idService).to.be('ABC');
      expect(suppressionDemandee.idUtilisateurCourant).to.be('456');
    });

    it("retourne une erreur HTTP 424 si le dépôt ne peut pas supprimer l'autorisation", async () => {
      testeur.depotDonnees().supprimeContributeur = async () => {
        throw new Error("Un message d'erreur");
      };

      try {
        await axios.delete('http://localhost:1234/api/autorisation', {
          params: {
            idService: '123',
            emailContributeur: 'jean.dupont@mail.fr',
          },
        });
        expect().fail('La requête aurait dû lever une erreur HTTP 424');
      } catch (e) {
        expect(e.response.status).to.equal(424);
        expect(e.response.data).to.equal("Un message d'erreur");
      }
    });
  });

  describe('quand requête GET sur `/api/annuaire/contributeurs`', () => {
    it('aseptise la chaine de recherche', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['recherche'],
        {
          method: 'get',
          url: 'http://localhost:1234/api/annuaire/contributeurs',
        },
        done
      );
    });

    it('retourne une erreur HTTP 400 si le terme de recherche est vide', async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        400,
        'Le terme de recherche ne peut pas être vide',
        {
          method: 'get',
          url: 'http://localhost:1234/api/annuaire/contributeurs',
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

      const reponse = await axios.get(
        'http://localhost:1234/api/annuaire/contributeurs?recherche=jean'
      );

      expect(appelDepot).to.eql({ idUtilisateur: '123', recherche: 'jean' });
      expect(reponse.status).to.be(200);
      expect(reponse.data.suggestions).to.eql([
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

    it("retourne une erreur HTTP 401 si l'utilisateur n'est pas superviseur", async () => {
      testeur.depotDonnees().estSuperviseur = async () => false;
      await testeur.verifieRequeteGenereErreurHTTP(401, 'Unauthorized', {
        method: 'get',
        url: 'http://localhost:1234/api/supervision',
      });
    });

    it('aseptise les paramètres de la requête', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['filtreDate', 'filtreBesoinsSecurite', 'filtreEntite'],
        {
          method: 'get',
          url: 'http://localhost:1234/api/supervision',
        },
        done
      );
    });

    it("retourne une erreur HTTP 400 si le filtre de date n'existe pas dans le référentiel", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(400, 'Bad Request', {
        method: 'get',
        url: 'http://localhost:1234/api/supervision?filtreDate=nexistePas',
      });
    });

    it('retourne une erreur HTTP 400 si le filtre de besoinsDeSecurite a une valeur inconnue', async () => {
      await testeur.verifieRequeteGenereErreurHTTP(400, 'Bad Request', {
        method: 'get',
        url: 'http://localhost:1234/api/supervision?filtreBesoinsSecurite=nexistePas',
      });
    });

    it("délègue au service de supervision la génération de l'URL du tableau de supervision", async () => {
      let idRecu;
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.serviceSupervision().genereURLSupervision = (idSuperviseur) => {
        idRecu = idSuperviseur;
        return 'https://uneURLSupervision.fr';
      };

      const reponse = await axios.get('http://localhost:1234/api/supervision');

      expect(idRecu).to.be('U1');
      expect(reponse.data.urlSupervision).to.be('https://uneURLSupervision.fr');
    });

    it('transmet les filtres de date, entité et besoins de sécurité au service de supervision', async () => {
      let filtrageRecu;
      testeur.referentiel().recharge({
        optionsFiltrageDate: {
          unFiltreDate: '',
        },
      });
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.serviceSupervision().genereURLSupervision = (_, filtrage) => {
        filtrageRecu = filtrage;
        return 'https://uneURLSupervision.fr';
      };

      await axios.get(
        'http://localhost:1234/api/supervision?filtreDate=unFiltreDate&filtreBesoinsSecurite=niveau1&filtreEntite=unSiret'
      );

      expect(filtrageRecu.filtreDate).to.be('unFiltreDate');
      expect(filtrageRecu.filtreBesoinsSecurite).to.be('niveau1');
      expect(filtrageRecu.filtreEntite).to.be('unSiret');
    });
  });
});
