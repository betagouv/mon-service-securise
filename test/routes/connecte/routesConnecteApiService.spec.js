const axios = require('axios');
const expect = require('expect.js');

const testeurMSS = require('../testeurMSS');

const uneDescriptionValide = require('../../constructeurs/constructeurDescriptionService');
const { unDossier } = require('../../constructeurs/constructeurDossier');
const { unService } = require('../../constructeurs/constructeurService');
const {
  ErreurDonneesObligatoiresManquantes,
  ErreurNomServiceDejaExistant,
  ErreurResponsablesMesureInvalides,
} = require('../../../src/erreurs');
const Service = require('../../../src/modeles/service');
const {
  Permissions,
  Rubriques,
  tousDroitsEnEcriture,
} = require('../../../src/modeles/autorisations/gestionDroits');
const {
  uneAutorisation,
} = require('../../constructeurs/constructeurAutorisation');
const Autorisation = require('../../../src/modeles/autorisations/autorisation');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const Mesures = require('../../../src/modeles/mesures');
const Referentiel = require('../../../src/referentiel');

const { ECRITURE, LECTURE } = Permissions;
const { RISQUES, DECRIRE, SECURISER, CONTACTS, HOMOLOGUER } = Rubriques;

describe('Le serveur MSS des routes /api/service/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête POST sur `/api/service`', () => {
    beforeEach(() => {
      testeur.depotDonnees().nouveauService = async () => {};
    });

    it('applique une protection de trafic', (done) => {
      testeur.middleware().verifieProtectionTrafic(
        {
          method: 'post',
          url: 'http://localhost:1234/api/service',
        },
        done
      );
    });

    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(
          { method: 'post', url: 'http://localhost:1234/api/service' },
          done
        );
    });

    it('aseptise les paramètres', (done) => {
      testeur
        .middleware()
        .verifieAseptisationParametres(
          [
            'nomService',
            'organisationsResponsables.*',
            'nombreOrganisationsUtilisatrices.*',
          ],
          { method: 'post', url: 'http://localhost:1234/api/service' },
          done
        );
    });

    it("aseptise la liste des points d'accès ainsi que son contenu", async () => {
      await axios.post('http://localhost:1234/api/service', {});

      testeur
        .middleware()
        .verifieAseptisationListe('pointsAcces', ['description']);
    });

    it('aseptise la liste des fonctionnalités spécifiques ainsi que son contenu', async () => {
      await axios.post('http://localhost:1234/api/service', {});

      testeur
        .middleware()
        .verifieAseptisationListe('fonctionnalitesSpecifiques', [
          'description',
        ]);
    });

    it('aseptise la liste des données sensibles spécifiques ainsi que son contenu', async () => {
      await axios.post('http://localhost:1234/api/service', {});

      testeur
        .middleware()
        .verifieAseptisationListe('donneesSensiblesSpecifiques', [
          'description',
        ]);
    });

    it('retourne une erreur HTTP 422 si les données de description de service sont invalides', async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Le statut de déploiement "statutInvalide" est invalide',
        {
          method: 'post',
          url: 'http://localhost:1234/api/service',
          data: { statutDeploiement: 'statutInvalide' },
        }
      );
    });

    it('retourne une erreur HTTP 422 si données insuffisantes pour création service', async () => {
      testeur.depotDonnees().nouveauService = async () => {
        throw new ErreurDonneesObligatoiresManquantes('oups');
      };

      await testeur.verifieRequeteGenereErreurHTTP(422, 'oups', {
        method: 'post',
        url: 'http://localhost:1234/api/service',
        data: {},
      });
    });

    it('retourne une erreur HTTP 422 si le nom du service existe déjà', async () => {
      testeur.depotDonnees().nouveauService = async () => {
        throw new ErreurNomServiceDejaExistant('oups');
      };

      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        { erreur: { code: 'NOM_SERVICE_DEJA_EXISTANT' } },
        {
          method: 'post',
          url: 'http://localhost:1234/api/service',
          data: { nomService: 'Un nom déjà existant' },
        }
      );
    });

    it("demande au dépôt de données d'enregistrer les nouveaux service", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      const donneesDescriptionService = uneDescriptionValide(
        testeur.referentiel()
      )
        .deLOrganisation({ siret: '12345' })
        .construis()
        .toJSON();

      testeur.depotDonnees().nouveauService = async (
        idUtilisateur,
        { descriptionService }
      ) => {
        expect(idUtilisateur).to.equal('123');
        expect(descriptionService).to.eql(donneesDescriptionService);
        return '456';
      };

      const reponse = await axios.post(
        'http://localhost:1234/api/service',
        donneesDescriptionService
      );

      expect(reponse.status).to.equal(200);
      expect(reponse.data).to.eql({ idService: '456' });
    });
  });

  describe('quand requête PUT sur `/api/service/:id`', () => {
    beforeEach(() => {
      testeur.depotDonnees().ajouteDescriptionService = async () => {};
    });

    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: DECRIRE }],
          { method: 'put', url: 'http://localhost:1234/api/service/456' },
          done
        );
    });

    it('aseptise les paramètres', (done) => {
      testeur
        .middleware()
        .verifieAseptisationParametres(
          [
            'nomService',
            'organisationsResponsables.*',
            'nombreOrganisationsUtilisatrices.*',
          ],
          { method: 'put', url: 'http://localhost:1234/api/service/456' },
          done
        );
    });

    it("aseptise la liste des points d'accès ainsi que son contenu", async () => {
      await axios.put('http://localhost:1234/api/service/456', {});

      testeur
        .middleware()
        .verifieAseptisationListe('pointsAcces', ['description']);
    });

    it('aseptise la liste des fonctionnalités spécifiques ainsi que son contenu', async () => {
      await axios.put('http://localhost:1234/api/service/456', {});

      testeur
        .middleware()
        .verifieAseptisationListe('fonctionnalitesSpecifiques', [
          'description',
        ]);
    });

    it('aseptise la liste des données sensibles spécifiques ainsi que son contenu', async () => {
      await axios.put('http://localhost:1234/api/service/456', {});

      testeur
        .middleware()
        .verifieAseptisationListe('donneesSensiblesSpecifiques', [
          'description',
        ]);
    });

    it('demande au dépôt de données de mettre à jour le service', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      testeur.depotDonnees().ajouteDescriptionService = async (
        idUtilisateur,
        idService,
        infosGenerales
      ) => {
        expect(idUtilisateur).to.equal('123');
        expect(idService).to.equal('456');
        expect(infosGenerales.nomService).to.equal('Nouveau Nom');
      };

      const reponse = await axios.put('http://localhost:1234/api/service/456', {
        nomService: 'Nouveau Nom',
      });

      expect(reponse.status).to.equal(200);
      expect(reponse.data).to.eql({ idService: '456' });
    });

    it('retourne une erreur HTTP 422 si le validateur du modèle échoue', async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Le statut de déploiement "statutInvalide" est invalide',
        {
          method: 'put',
          url: 'http://localhost:1234/api/service/456',
          data: { statutDeploiement: 'statutInvalide' },
        }
      );
    });

    it('retourne une erreur HTTP 422 si le nom du service existe déjà', async () => {
      testeur.depotDonnees().ajouteDescriptionService = async () => {
        throw new ErreurNomServiceDejaExistant('oups');
      };

      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        { erreur: { code: 'NOM_SERVICE_DEJA_EXISTANT' } },
        {
          method: 'put',
          url: 'http://localhost:1234/api/service/456',
          data: { nomService: 'service déjà existant' },
        }
      );
    });
  });

  describe('quand requête GET sur `/api/service/:id/mesures', () => {
    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: LECTURE, rubrique: SECURISER }],
        {
          method: 'get',
          url: 'http://localhost:1234/api/service/456/mesures',
        },
        done
      );
    });

    it('retourne la représentation enrichie des mesures', async () => {
      const avecMesureA = Referentiel.creeReferentiel({
        mesures: { mesureA: {} },
      });
      const mesures = new Mesures(
        {
          mesuresGenerales: [
            { id: 'mesureA', statut: 'fait', modalites: 'un commentaire' },
          ],
        },
        avecMesureA,
        { mesureA: { description: 'Mesure A', referentiel: 'ANSSI' } }
      );

      testeur.middleware().reinitialise({
        serviceARenvoyer: unService(avecMesureA)
          .avecMesures(mesures)
          .construis(),
      });

      const reponse = await axios(
        'http://localhost:1234/api/service/456/mesures'
      );

      expect(reponse.data).to.eql({
        mesuresGenerales: {
          mesureA: {
            description: 'Mesure A',
            statut: 'fait',
            modalites: 'un commentaire',
            referentiel: 'ANSSI',
            responsables: [],
          },
        },
        mesuresSpecifiques: [],
      });
    });
  });

  describe('quand requête PUT sur `api/service/:id/mesures-specifiques`', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        categoriesMesures: { uneCategorie: 'Une catégorie' },
      });
      testeur.depotDonnees().metsAJourMesuresSpecifiquesDuService =
        async () => {};
    });

    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur.middleware().verifieRequeteExigeAcceptationCGU(
        {
          method: 'put',
          url: 'http://localhost:1234/api/service/456/mesures-specifiques',
          data: [],
        },
        done
      );
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: ECRITURE, rubrique: SECURISER }],
        {
          method: 'put',
          url: 'http://localhost:1234/api/service/456/mesures-specifiques',
          data: [],
        },
        done
      );
    });

    it('aseptise tous les paramètres de la requête', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        [
          '*.description',
          '*.categorie',
          '*.statut',
          '*.modalites',
          '*.priorite',
          '*.echeance',
          '*.responsables.*',
        ],
        {
          method: 'put',
          url: 'http://localhost:1234/api/service/456/mesures-specifiques',
          data: [],
        },
        done
      );
    });

    it('délègue au dépôt de données la sauvegarde des mesures spécifiques', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '999' });
      let donneesRecues;
      let idServiceRecu;
      let idUtilisateurRecu;
      testeur.depotDonnees().metsAJourMesuresSpecifiquesDuService = async (
        idService,
        idUtilisateur,
        mesuresSpecifiques
      ) => {
        idServiceRecu = idService;
        idUtilisateurRecu = idUtilisateur;
        donneesRecues = mesuresSpecifiques;
      };

      const reponse = await axios.put(
        'http://localhost:1234/api/service/456/mesures-specifiques',
        [
          {
            description: 'd1',
            categorie: 'uneCategorie',
            statut: 'fait',
            modalites: 'm1',
          },
          {
            description: 'd2',
            categorie: 'uneCategorie',
            statut: 'nonFait',
            modalites: 'm2',
          },
        ]
      );

      expect(donneesRecues.nombre()).to.eql(2);
      expect(donneesRecues.item(0).toJSON()).to.eql({
        description: 'd1',
        categorie: 'uneCategorie',
        statut: 'fait',
        modalites: 'm1',
        responsables: [],
      });
      expect(donneesRecues.item(1).toJSON()).to.eql({
        description: 'd2',
        categorie: 'uneCategorie',
        statut: 'nonFait',
        modalites: 'm2',
        responsables: [],
      });
      expect(idServiceRecu).to.eql(456);
      expect(idUtilisateurRecu).to.eql(999);
      expect(reponse.status).to.equal(200);
    });

    it('jette une erreur 403 si les responsables ne sont pas des contributeurs du service', async () => {
      testeur.depotDonnees().metsAJourMesuresSpecifiquesDuService =
        async () => {
          throw new ErreurResponsablesMesureInvalides(
            'Les responsables des mesures spécifiques doivent être des contributeurs du service.'
          );
        };

      try {
        await axios.put(
          'http://localhost:1234/api/service/456/mesures-specifiques',
          [
            {
              description: 'd1',
              statut: 'fait',
              responsables: ['pasUnIdDeContributeur'],
            },
          ]
        );
        expect().fail('L’appel aurait dû lever une erreur');
      } catch (e) {
        expect(e.response.status).to.be(403);
        expect(e.response.data).to.be(
          'Les responsables des mesures spécifiques doivent être des contributeurs du service.'
        );
      }
    });

    it('retourne une erreur HTTP 400 si la catégorie est inconnue', async () => {
      testeur.depotDonnees().metsAJourMesuresSpecifiquesDuService =
        async () => {};

      try {
        await axios.put(
          'http://localhost:1234/api/service/456/mesures-specifiques',
          [
            {
              description: 'd1',
              categorie: 'inconnue',
              statut: 'fait',
            },
          ]
        );
        expect().fail('L’appel aurait dû lever une erreur');
      } catch (e) {
        expect(e.response.status).to.be(400);
        expect(e.response.data).to.be(
          'La catégorie "inconnue" n\'est pas répertoriée'
        );
      }
    });

    it('retourne une erreur HTTP 400 si le statut est vide', async () => {
      testeur.depotDonnees().metsAJourMesuresSpecifiquesDuService =
        async () => {};

      try {
        await axios.put(
          'http://localhost:1234/api/service/456/mesures-specifiques',
          [
            {
              description: 'd1',
              categorie: 'uneCategorie',
              statut: '',
            },
          ]
        );
        expect().fail('L’appel aurait dû lever une erreur');
      } catch (e) {
        expect(e.response.status).to.be(400);
        expect(e.response.data).to.be(
          'Les statuts des mesures sont obligatoires.'
        );
      }
    });

    it('retourne une erreur HTTP 400 si le statut est inconnu', async () => {
      testeur.depotDonnees().metsAJourMesuresSpecifiquesDuService =
        async () => {};

      try {
        await axios.put(
          'http://localhost:1234/api/service/456/mesures-specifiques',
          [
            {
              description: 'd1',
              categorie: 'uneCategorie',
              statut: 'plop',
            },
          ]
        );
        expect().fail('L’appel aurait dû lever une erreur');
      } catch (e) {
        expect(e.response.status).to.be(400);
        expect(e.response.data).to.be('Le statut "plop" est invalide');
      }
    });

    it('retourne une erreur HTTP 400 si la priorite est inconnue', async () => {
      testeur.depotDonnees().metsAJourMesuresSpecifiquesDuService =
        async () => {};

      try {
        await axios.put(
          'http://localhost:1234/api/service/456/mesures-specifiques',
          [
            {
              description: 'd1',
              categorie: 'uneCategorie',
              priorite: 'plop',
              statut: 'enCours',
            },
          ]
        );
        expect().fail('L’appel aurait dû lever une erreur');
      } catch (e) {
        expect(e.response.status).to.be(400);
        expect(e.response.data).to.be('La priorité "plop" est invalide');
      }
    });

    it("retourne une erreur HTTP 400 si l'échéance est invalide", async () => {
      testeur.depotDonnees().metsAJourMesuresSpecifiquesDuService =
        async () => {};

      try {
        await axios.put(
          'http://localhost:1234/api/service/456/mesures-specifiques',
          [
            {
              description: 'd1',
              categorie: 'uneCategorie',
              echeance: 'pasUneDate',
              statut: 'enCours',
            },
          ]
        );
        expect().fail('L’appel aurait dû lever une erreur');
      } catch (e) {
        expect(e.response.status).to.be(400);
        expect(e.response.data).to.be('L\'échéance "pasUneDate" est invalide');
      }
    });

    it("décode les 'slash' des dates d'échéance ", async () => {
      const slash = '&#x2F;';
      let donneesRecues;
      testeur.depotDonnees().metsAJourMesuresSpecifiquesDuService = async (
        _,
        __,
        mesuresSpecifiques
      ) => {
        donneesRecues = mesuresSpecifiques;
      };

      await axios.put(
        'http://localhost:1234/api/service/456/mesures-specifiques',
        [
          {
            description: 'd1',
            categorie: 'uneCategorie',
            statut: 'fait',
            modalites: 'm1',
            echeance: `01${slash}01${slash}2024`,
          },
          {
            description: 'd2',
            categorie: 'uneCategorie',
            statut: 'nonFait',
            modalites: 'm2',
          },
        ]
      );

      expect(donneesRecues.item(0).toJSON().echeance).to.eql('01/01/2024');
      expect(donneesRecues.item(1).toJSON()).to.eql({
        description: 'd2',
        categorie: 'uneCategorie',
        statut: 'nonFait',
        modalites: 'm2',
        responsables: [],
      });
    });
  });

  describe('quand requête PUT sur `/api/service/:id/mesures/:idMesure`', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        mesures: { audit: {} },
      });
      testeur.middleware().reinitialise({
        idUtilisateur: '123',
        serviceARenvoyer: unService(testeur.referentiel())
          .avecId('456')
          .construis(),
      });
      testeur.depotDonnees().metsAJourMesureGeneraleDuService = () =>
        Promise.resolve();
    });

    it("vérifie que l'utilisateur a accepté les CGU", (done) => {
      testeur.middleware().verifieRequeteExigeAcceptationCGU(
        {
          method: 'put',
          url: 'http://localhost:1234/api/service/456/mesures/audit',
        },
        done
      );
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: ECRITURE, rubrique: SECURISER }],
        {
          method: 'put',
          url: 'http://localhost:1234/api/service/456/mesures/audit',
        },
        done
      );
    });

    it('aseptise les paramètres de la requête', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['statut', 'modalites', 'priorite', 'echeance', 'responsables.*'],
        {
          method: 'put',
          url: 'http://localhost:1234/api/service/456/mesures/audit',
        },
        done
      );
    });

    it('jette une erreur 403 si les responsables ne sont pas des contributeurs du service', async () => {
      testeur.depotDonnees().metsAJourMesureGeneraleDuService = async () => {
        throw new ErreurResponsablesMesureInvalides(
          "Les responsables d'une mesure générale doivent être des contributeurs du service."
        );
      };

      const mesureGenerale = {
        statut: 'fait',
        responsables: ['pasUnIdDeContributeur'],
      };

      try {
        await axios.put(
          'http://localhost:1234/api/service/456/mesures/audit',
          mesureGenerale
        );
        expect().fail('L’appel aurait dû lever une erreur');
      } catch (e) {
        expect(e.response.status).to.be(403);
        expect(e.response.data).to.be(
          "Les responsables d'une mesure générale doivent être des contributeurs du service."
        );
      }
    });

    it('jette une erreur 400 si le statut est vide', async () => {
      const mesureGenerale = {
        statut: '',
      };

      try {
        await axios.put(
          'http://localhost:1234/api/service/456/mesures/audit',
          mesureGenerale
        );
        expect().fail("L'appel aurait du lever une erreur.");
      } catch (e) {
        expect(e.response.status).to.be(400);
        expect(e.response.data).to.be(
          'Le statut de la mesure est obligatoire.'
        );
      }
    });

    it('délègue au dépôt de données la mise à jour des mesures générales', async () => {
      let donneesRecues;
      let idServiceRecu;
      let idUtilisateurRecu;
      testeur.depotDonnees().metsAJourMesureGeneraleDuService = (
        idService,
        idUtilisateur,
        donnees
      ) => {
        donneesRecues = donnees;
        idServiceRecu = idService;
        idUtilisateurRecu = idUtilisateur;
      };

      const mesureGenerale = {
        statut: 'fait',
      };

      await axios.put(
        'http://localhost:1234/api/service/456/mesures/audit',
        mesureGenerale
      );

      expect(idServiceRecu).to.equal('456');
      expect(idUtilisateurRecu).to.equal('123');
      expect(donneesRecues.id).to.equal('audit');
      expect(donneesRecues.statut).to.equal('fait');
    });

    it('renvoie une erreur 400 si la mesure est invalide à cause du statut', async () => {
      const mesureGenerale = {
        statut: 'invalide',
      };

      try {
        await axios.put(
          'http://localhost:1234/api/service/456/mesures/audit',
          mesureGenerale
        );
        expect().fail("L'appel aurait du lever une erreur.");
      } catch (e) {
        expect(e.response.status).to.be(400);
        expect(e.response.data).to.be('La mesure est invalide.');
      }
    });

    it('renvoie une erreur 400 si la mesure est invalide à cause de la priorité', async () => {
      const mesureGenerale = {
        priorite: 'invalide',
        statut: 'enCours',
      };

      try {
        await axios.put(
          'http://localhost:1234/api/service/456/mesures/audit',
          mesureGenerale
        );
        expect().fail("L'appel aurait du lever une erreur.");
      } catch (e) {
        expect(e.response.status).to.be(400);
        expect(e.response.data).to.be('La mesure est invalide.');
      }
    });

    it("renvoie une erreur 400 si la mesure est invalide à cause de l'échéance", async () => {
      const mesureGenerale = {
        echeance: 'invalide',
        statut: 'enCours',
      };

      try {
        await axios.put(
          'http://localhost:1234/api/service/456/mesures/audit',
          mesureGenerale
        );
        expect().fail("L'appel aurait du lever une erreur.");
      } catch (e) {
        expect(e.response.status).to.be(400);
        expect(e.response.data).to.be('La mesure est invalide.');
      }
    });

    it("décode les 'slash' de la date d'échéance ", async () => {
      const slash = '&#x2F;';
      let donneesRecues;
      testeur.depotDonnees().metsAJourMesureGeneraleDuService = (
        _,
        __,
        donnees
      ) => {
        donneesRecues = donnees;
      };

      const mesureGenerale = {
        statut: 'fait',
        echeance: `01${slash}01${slash}2024`,
      };

      await axios.put(
        'http://localhost:1234/api/service/456/mesures/audit',
        mesureGenerale
      );

      expect(donneesRecues.echeance).to.equal('01/01/2024');
    });
  });

  describe('quand requête POST sur `/api/service/:id/rolesResponsabilites`', () => {
    beforeEach(() => {
      testeur.depotDonnees().ajouteRolesResponsabilitesAService = () =>
        Promise.resolve();
      testeur.depotDonnees().ajouteEntitesExternesAHomologation = () =>
        Promise.resolve();
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: ECRITURE, rubrique: CONTACTS }],
        {
          method: 'post',
          url: 'http://localhost:1234/api/service/456/rolesResponsabilites',
        },
        done
      );
    });

    it("demande au dépôt d'associer les rôles et responsabilités au service", async () => {
      let rolesResponsabilitesAjoutees = false;

      testeur.depotDonnees().ajouteRolesResponsabilitesAService = async (
        idService,
        role
      ) => {
        expect(idService).to.equal('456');
        expect(role.autoriteHomologation).to.equal('Jean Dupont');
        rolesResponsabilitesAjoutees = true;
      };

      const reponse = await axios.post(
        'http://localhost:1234/api/service/456/rolesResponsabilites',
        { autoriteHomologation: 'Jean Dupont' }
      );

      expect(rolesResponsabilitesAjoutees).to.be(true);
      expect(reponse.status).to.equal(200);
      expect(reponse.data).to.eql({ idService: '456' });
    });

    it("aseptise la liste des acteurs de l'homologation ainsi que son contenu", async () => {
      await axios.post(
        'http://localhost:1234/api/service/456/rolesResponsabilites',
        {}
      );

      testeur
        .middleware()
        .verifieAseptisationListe('acteursHomologation', [
          'role',
          'nom',
          'fonction',
        ]);
    });

    it('aseptise la liste des parties prenantes ainsi que son contenu', async () => {
      await axios.post(
        'http://localhost:1234/api/service/456/rolesResponsabilites',
        {}
      );

      testeur
        .middleware()
        .verifieAseptisationListe('partiesPrenantes', [
          'nom',
          'natureAcces',
          'pointContact',
        ]);
    });
  });

  describe('quand requête POST sur `/api/service/:id/risques`', () => {
    beforeEach(() => {
      testeur.depotDonnees().remplaceRisquesSpecifiquesDuService =
        async () => {};
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: ECRITURE, rubrique: RISQUES }],
        {
          method: 'post',
          url: 'http://localhost:1234/api/service/456/risques',
        },
        done
      );
    });

    it('aseptise les paramètres de la requête', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        [
          '*',
          'risquesSpecifiques.*.description',
          'risquesSpecifiques.*.niveauGravite',
          'risquesSpecifiques.*.commentaire',
        ],
        {
          method: 'post',
          url: 'http://localhost:1234/api/service/456/risques',
        },
        done
      );
    });

    it("demande au dépôt d'associer les risques généraux au service", async () => {
      testeur.referentiel().recharge({
        risques: { unRisque: {} },
        niveauxGravite: { unNiveau: {} },
      });
      let risqueAjoute = false;

      testeur.depotDonnees().ajouteRisqueGeneralAService = async (
        idService,
        risque
      ) => {
        expect(idService).to.equal('456');
        expect(risque.id).to.equal('unRisque');
        expect(risque.commentaire).to.equal('Un commentaire');
        expect(risque.niveauGravite).to.equal('unNiveau');
        risqueAjoute = true;
      };

      const reponse = await axios.post(
        'http://localhost:1234/api/service/456/risques',
        {
          'commentaire-unRisque': 'Un commentaire',
          'niveauGravite-unRisque': 'unNiveau',
        }
      );

      expect(risqueAjoute).to.be(true);
      expect(reponse.status).to.equal(200);
      expect(reponse.data).to.eql({ idService: '456' });
    });

    it("demande au dépôt d'associer les risques spécifiques au service", async () => {
      let risquesRemplaces = false;
      testeur.depotDonnees().remplaceRisquesSpecifiquesDuService = async (
        idService,
        risques
      ) => {
        expect(idService).to.equal('456');
        expect(risques.nombre()).to.equal(1);
        expect(risques.item(0).description).to.equal('Un risque spécifique');
        expect(risques.item(0).commentaire).to.equal('Un commentaire');
        risquesRemplaces = true;
      };

      await axios.post('http://localhost:1234/api/service/456/risques', {
        risquesSpecifiques: [
          {
            description: 'Un risque spécifique',
            commentaire: 'Un commentaire',
          },
        ],
      });

      expect(risquesRemplaces).to.be(true);
    });

    it('filtre les risques spécifiques vides', async () => {
      testeur.referentiel().recharge({ niveauxGravite: { unNiveau: {} } });

      let risquesRemplaces = false;
      testeur.depotDonnees().remplaceRisquesSpecifiquesDuService = async (
        _,
        risques
      ) => {
        expect(risques.nombre()).to.equal(2);
        risquesRemplaces = true;
      };

      const risquesSpecifiques = [];
      risquesSpecifiques[2] = { description: 'Un risque spécifique' };
      risquesSpecifiques[5] = { niveauGravite: 'unNiveau' };

      await axios.post('http://localhost:1234/api/service/456/risques', {
        risquesSpecifiques,
      });

      expect(risquesRemplaces).to.be(true);
    });

    it('retourne une erreur HTTP 422 si les données sont invalides', async () => {
      await testeur.verifieRequeteGenereErreurHTTP(422, 'Données invalides', {
        method: 'post',
        url: 'http://localhost:1234/api/service/456/risques',
        data: { 'commentaire-unRisqueInvalide': 'Un commentaire' },
      });
    });
  });

  describe('quand requête PUT sur /api/service/:id/homologation/autorite', () => {
    beforeEach(() => {
      const serviceAvecDossier = new Service({
        id: '456',
        descriptionService: { nomService: 'un service' },
        dossiers: [{ id: '999' }],
      });
      testeur
        .middleware()
        .reinitialise({ serviceARenvoyer: serviceAvecDossier });
      testeur.depotDonnees().enregistreDossier = async () => {};
    });

    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: ECRITURE, rubrique: HOMOLOGUER }],
        {
          url: 'http://localhost:1234/api/service/456/homologation/autorite',
          method: 'put',
        },
        done
      );
    });

    it('recherche le dossier courant correspondant', (done) => {
      testeur.middleware().verifieRechercheDossierCourant(
        {
          url: 'http://localhost:1234/api/service/456/homologation/autorite',
          method: 'put',
        },
        done
      );
    });

    it('aseptise les paramètres reçus', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['nom', 'fonction'],
        {
          url: 'http://localhost:1234/api/service/456/homologation/autorite',
          method: 'put',
        },
        done
      );
    });

    it("utilise le dépôt pour enregistrer l'autorité d'homologation", async () => {
      let depotAppele = false;

      testeur.depotDonnees().enregistreDossier = async (
        idHomologation,
        dossier
      ) => {
        depotAppele = true;
        expect(idHomologation).to.equal('456');
        expect(dossier.autorite.nom).to.equal('Jean Dupond');
        expect(dossier.autorite.fonction).to.equal('RSSI');
      };

      await axios.put(
        'http://localhost:1234/api/service/456/homologation/autorite',
        { nom: 'Jean Dupond', fonction: 'RSSI' }
      );

      expect(depotAppele).to.be(true);
    });
  });

  describe('quand requête PUT sur /api/service/:id/homologation/decision', () => {
    beforeEach(() => {
      const serviceAvecDossier = new Service({
        id: '456',
        descriptionService: { nomService: 'un service' },
        dossiers: [{ id: '999' }],
      });
      testeur
        .middleware()
        .reinitialise({ serviceARenvoyer: serviceAvecDossier });
      testeur.depotDonnees().enregistreDossier = async () => {};
      testeur.referentiel().recharge({ echeancesRenouvellement: { unAn: {} } });
    });

    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: ECRITURE, rubrique: HOMOLOGUER }],
        {
          url: 'http://localhost:1234/api/service/456/homologation/decision',
          method: 'put',
        },
        done
      );
    });

    it('recherche le dossier courant correspondant', (done) => {
      testeur.middleware().verifieRechercheDossierCourant(
        {
          url: 'http://localhost:1234/api/service/456/homologation/decision',
          method: 'put',
        },
        done
      );
    });

    it('aseptise les paramètres reçus', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['dateHomologation', 'dureeValidite'],
        {
          url: 'http://localhost:1234/api/service/456/homologation/decision',
          method: 'put',
        },
        done
      );
    });

    it("renvoie une erreur 422 si la date d'homologation est invalide", (done) => {
      axios
        .put('http://localhost:1234/api/service/456/homologation/decision', {
          dateHomologation: 'dateInvalide',
          dureeValidite: 'unAn',
        })
        .then(() => done('Une erreur aurait dû être levée'))
        .catch((e) => {
          expect(e.response.status).to.be(422);
          expect(e.response.data).to.be("Date d'homologation invalide");
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it('renvoie une erreur 422 si la durée de validité est inconnue du référentiel', (done) => {
      axios
        .put('http://localhost:1234/api/service/456/homologation/decision', {
          dateHomologation: new Date(),
          dureeValidite: 'dureeInconnue',
        })
        .then(() => done('Une erreur aurait dû être levée'))
        .catch((e) => {
          expect(e.response.status).to.be(422);
          expect(e.response.data).to.be('Durée de validité invalide');
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("utilise le dépôt pour enregistrer la décision d'homologation", (done) => {
      let depotAppele = false;

      testeur.depotDonnees().enregistreDossier = (idHomologation, dossier) => {
        depotAppele = true;
        expect(idHomologation).to.equal('456');
        expect(dossier.decision.dateHomologation).to.equal('2023-01-01');
        expect(dossier.decision.dureeValidite).to.equal('unAn');
        return Promise.resolve();
      };

      axios
        .put('http://localhost:1234/api/service/456/homologation/decision', {
          dateHomologation: '2023-01-01',
          dureeValidite: 'unAn',
        })
        .then(() => expect(depotAppele).to.be(true))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });
  });

  describe('quand requête PUT sur `/api/service/:id/homologation/telechargement', () => {
    beforeEach(() => {
      const serviceAvecDossier = new Service({
        id: '456',
        descriptionService: { nomService: 'un service' },
        dossiers: [{ id: '999' }],
      });
      testeur
        .middleware()
        .reinitialise({ serviceARenvoyer: serviceAvecDossier });
      testeur.depotDonnees().enregistreDossier = () => Promise.resolve();
      testeur
        .referentiel()
        .recharge({ documentsHomologation: { decision: {} } });
    });

    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: ECRITURE, rubrique: HOMOLOGUER }],
        {
          url: 'http://localhost:1234/api/service/456/homologation/telechargement',
          method: 'put',
        },
        done
      );
    });

    it('recherche le dossier courant correspondant', (done) => {
      testeur.middleware().verifieRechercheDossierCourant(
        {
          url: 'http://localhost:1234/api/service/456/homologation/telechargement',
          method: 'put',
        },
        done
      );
    });

    it('utilise le dépôt pour enregistrer la date du téléchargement', (done) => {
      let depotAppele = false;
      const maintenant = new Date('2023-02-21');

      testeur.adaptateurHorloge().maintenant = () => maintenant;

      testeur.depotDonnees().enregistreDossier = (idHomologation, dossier) => {
        depotAppele = true;
        expect(idHomologation).to.equal('456');
        expect(dossier.dateTelechargement.date).to.equal(maintenant);
        return Promise.resolve();
      };

      axios
        .put(
          'http://localhost:1234/api/service/456/homologation/telechargement'
        )
        .then(() => expect(depotAppele).to.be(true))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });
  });

  describe('quand requête PUT sur /api/service/:id/homologation/avis', () => {
    beforeEach(() => {
      const serviceAvecDossier = new Service(
        {
          id: '456',
          descriptionService: { nomService: 'un service' },
          dossiers: [{ id: '999' }],
        },
        testeur.referentiel()
      );
      testeur
        .middleware()
        .reinitialise({ serviceARenvoyer: serviceAvecDossier });
      testeur.depotDonnees().enregistreDossier = () => Promise.resolve();
      testeur.referentiel().recharge({
        echeancesRenouvellement: { unAn: {} },
        statutsAvisDossierHomologation: { favorable: {} },
      });
    });

    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: ECRITURE, rubrique: HOMOLOGUER }],
        {
          url: 'http://localhost:1234/api/service/456/homologation/avis',
          method: 'put',
        },
        done
      );
    });

    it('recherche le dossier courant correspondant', (done) => {
      testeur.middleware().verifieRechercheDossierCourant(
        {
          url: 'http://localhost:1234/api/service/456/homologation/avis',
          method: 'put',
        },
        done
      );
    });

    it('aseptise la liste des avis', (done) => {
      axios
        .put('http://localhost:1234/api/service/456/homologation/avis', {
          avis: [],
        })
        .then(() => {
          testeur
            .middleware()
            .verifieAseptisationListe('avis', [
              'statut',
              'dureeValidite',
              'commentaires',
            ]);
          done();
        })
        .catch(done);
    });

    it('aseptise les collaborateurs mentionnés dans les avis et le paramètres "avecAvis"', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['avis.*.collaborateurs.*', 'avecAvis'],
        {
          url: 'http://localhost:1234/api/service/456/homologation/avis',
          method: 'put',
        },
        done
      );
    });

    it("renvoie une 400 si aucun avis n'est envoyé", (done) => {
      axios
        .put('http://localhost:1234/api/service/456/homologation/avis', {})
        .then(() => {
          done('Une erreur aurait du être renvoyée');
        })
        .catch((e) => {
          expect(e.response.status).to.be(400);
          done();
        })
        .catch(done);
    });

    describe('utilise le dépôt pour enregistrer les avis', () => {
      it('quand il y a des avis', (done) => {
        let depotAppele = false;
        testeur.depotDonnees().enregistreDossier = (
          idHomologation,
          dossier
        ) => {
          depotAppele = true;
          expect(idHomologation).to.equal('456');
          expect(dossier.avis.avis.length).to.equal(1);
          expect(dossier.avis.avecAvis).to.be(true);
          expect(dossier.avis.avis[0].donneesSerialisees()).to.eql({
            collaborateurs: ['Jean Dupond'],
            statut: 'favorable',
            dureeValidite: 'unAn',
            commentaires: 'Ok',
          });
          return Promise.resolve();
        };

        axios
          .put('http://localhost:1234/api/service/456/homologation/avis', {
            avis: [
              {
                collaborateurs: ['Jean Dupond'],
                statut: 'favorable',
                dureeValidite: 'unAn',
                commentaires: 'Ok',
              },
            ],
            avecAvis: 'true',
          })
          .then(() => expect(depotAppele).to.be(true))
          .then(() => done())
          .catch((e) => done(e.response?.data || e));
      });

      it("quand il n'y a pas d'avis", (done) => {
        let depotAppele = false;
        testeur.depotDonnees().enregistreDossier = (
          idHomologation,
          dossier
        ) => {
          depotAppele = true;
          expect(idHomologation).to.equal('456');
          expect(dossier.avis.avis.length).to.equal(0);
          expect(dossier.avis.avecAvis).to.be(false);
          return Promise.resolve();
        };

        axios
          .put('http://localhost:1234/api/service/456/homologation/avis', {
            avis: [],
            avecAvis: 'false',
          })
          .then(() => expect(depotAppele).to.be(true))
          .then(() => done())
          .catch((e) => done(e.response?.data || e));
      });
    });
  });

  describe('quand requête PUT sur /api/service/:id/homologation/documents', () => {
    beforeEach(() => {
      const serviceAvecDossier = new Service(
        {
          id: '456',
          descriptionService: { nomService: 'un service' },
          dossiers: [{ id: '999' }],
        },
        testeur.referentiel()
      );
      testeur
        .middleware()
        .reinitialise({ serviceARenvoyer: serviceAvecDossier });
      testeur.depotDonnees().enregistreDossier = () => Promise.resolve();
    });

    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: ECRITURE, rubrique: HOMOLOGUER }],
        {
          url: 'http://localhost:1234/api/service/456/homologation/documents',
          method: 'put',
        },
        done
      );
    });

    it('recherche le dossier courant correspondant', (done) => {
      testeur.middleware().verifieRechercheDossierCourant(
        {
          url: 'http://localhost:1234/api/service/456/homologation/documents',
          method: 'put',
        },
        done
      );
    });

    it('aseptise la liste des documents et le paramètres "avecDocuments"', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['documents.*', 'avecDocuments'],
        {
          url: 'http://localhost:1234/api/service/456/homologation/documents',
          method: 'put',
        },
        done
      );
    });

    it("renvoie une 400 si aucun document n'est envoyé", (done) => {
      axios
        .put('http://localhost:1234/api/service/456/homologation/documents', {})
        .then(() => done('Une erreur aurait du être renvoyée'))
        .catch((e) => {
          expect(e.response.status).to.be(400);
          done();
        })
        .catch(done);
    });

    describe('utilise le dépôt pour enregistrer les documents', () => {
      it('quand il y a des documents', (done) => {
        let depotAppele = false;
        testeur.depotDonnees().enregistreDossier = (
          idHomologation,
          dossier
        ) => {
          depotAppele = true;
          expect(idHomologation).to.equal('456');
          expect(dossier.documents.documents.length).to.equal(1);
          expect(dossier.documents.avecDocuments).to.be(true);
          expect(dossier.documents.documents[0]).to.eql('unDocument');
          return Promise.resolve();
        };

        axios
          .put('http://localhost:1234/api/service/456/homologation/documents', {
            documents: ['unDocument'],
            avecDocuments: 'true',
          })
          .then(() => expect(depotAppele).to.be(true))
          .then(() => done())
          .catch((e) => done(e.response?.data || e));
      });

      it("quand il n'y a pas de document", (done) => {
        let depotAppele = false;
        testeur.depotDonnees().enregistreDossier = (
          idHomologation,
          dossier
        ) => {
          depotAppele = true;
          expect(idHomologation).to.equal('456');
          expect(dossier.documents.documents.length).to.equal(0);
          expect(dossier.documents.avecDocuments).to.be(false);
          return Promise.resolve();
        };

        axios
          .put('http://localhost:1234/api/service/456/homologation/documents', {
            documents: [],
            avecDocuments: 'false',
          })
          .then(() => expect(depotAppele).to.be(true))
          .then(() => done())
          .catch((e) => done(e.response?.data || e));
      });
    });
  });

  describe('quand requête POST sur /api/service/:id/homologation/finalise', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        echeancesRenouvellement: { unAn: {} },
        statutsAvisDossierHomologation: { favorable: {} },
      });
      const serviceAvecDossier = new Service(
        {
          id: '456',
          descriptionService: { nomService: 'un service' },
          dossiers: [unDossier().quiEstComplet().quiEstNonFinalise().donnees],
        },
        testeur.referentiel()
      );
      testeur
        .middleware()
        .reinitialise({ serviceARenvoyer: serviceAvecDossier });
      testeur.depotDonnees().finaliseDossierCourant = () => Promise.resolve();
    });

    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: ECRITURE, rubrique: HOMOLOGUER }],
        {
          url: 'http://localhost:1234/api/service/456/homologation/finalise',
          method: 'post',
        },
        done
      );
    });

    it("utilise le dépôt pour finaliser l'homologation", async () => {
      let servicePasse = {};
      testeur.depotDonnees().finaliseDossierCourant = async (service) => {
        servicePasse = service;
      };

      await axios.post(
        'http://localhost:1234/api/service/456/homologation/finalise'
      );

      expect(servicePasse.id).to.equal('456');
    });
  });

  describe('quand requête DELETE sur `/api/service/:id`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({
        autorisationACharger: Autorisation.NouvelleAutorisationProprietaire(),
      });
      testeur.depotDonnees().supprimeHomologation = () => Promise.resolve();
    });

    it('utilise le middleware de recherche du service', (done) => {
      testeur.middleware().verifieRechercheService(
        [],
        {
          method: 'delete',
          url: 'http://localhost:1234/api/service/123',
        },
        done
      );
    });

    it('utilise le middleware de challenge du mot de passe', (done) => {
      testeurMSS().middleware().verifieChallengeMotDePasse(
        {
          method: 'delete',
          url: 'http://localhost:1234/api/service/123',
        },
        done
      );
    });

    it("utilise le middleware de chargement de l'autorisation", (done) => {
      testeur
        .middleware()
        .verifieChargementDesAutorisations(
          { method: 'delete', url: 'http://localhost:1234/api/service/456' },
          done
        );
    });

    it("retourne une erreur HTTP 403 si l'utilisateur courant n'a pas accès au service", async () => {
      const autorisationNonTrouvee = undefined;
      testeur
        .middleware()
        .reinitialise({ autorisationACharger: autorisationNonTrouvee });

      await testeur.verifieRequeteGenereErreurHTTP(
        403,
        'Droits insuffisants pour supprimer le service',
        { method: 'delete', url: 'http://localhost:1234/api/service/123' }
      );
    });

    it("retourne une erreur HTTP 403 si l'utilisateur courant n'a pas les droits de suppression du service", async () => {
      testeur.middleware().reinitialise({
        autorisationACharger: uneAutorisation().deContributeur().construis(),
      });

      await testeur.verifieRequeteGenereErreurHTTP(
        403,
        'Droits insuffisants pour supprimer le service',
        { method: 'delete', url: 'http://localhost:1234/api/service/123' }
      );
    });

    it('demande au dépôt de supprimer le service', (done) => {
      let serviceSupprime = false;

      testeur.depotDonnees().supprimeHomologation = (idService) => {
        try {
          expect(idService).to.equal('123');
          serviceSupprime = true;

          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios({
        method: 'delete',
        url: 'http://localhost:1234/api/service/123',
      })
        .then((reponse) => {
          expect(serviceSupprime).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.equal('Service supprimé');
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });
  });

  describe('quand requête COPY sur `/api/service/:id`', () => {
    beforeEach(() => {
      testeur.depotDonnees().dupliqueService = () => Promise.resolve();
      testeur.middleware().reinitialise({
        autorisationACharger: Autorisation.NouvelleAutorisationProprietaire(),
      });
    });

    it('applique une protection de trafic', (done) => {
      testeur
        .middleware()
        .verifieProtectionTrafic(
          { method: 'copy', url: 'http://localhost:1234/api/service/123' },
          done
        );
    });

    it('utilise le middleware de chargement du service', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          [],
          { method: 'copy', url: 'http://localhost:1234/api/service/123' },
          done
        );
    });

    it("utilise le middleware de chargement de l'autorisation", (done) => {
      testeur.middleware().verifieChargementDesAutorisations(
        {
          method: 'copy',
          url: 'http://localhost:1234/api/service/123',
        },
        done
      );
    });

    it("retourne une erreur HTTP 403 si l'utilisateur courant n'a pas accès au service", async () => {
      const autorisationNonTrouvee = undefined;
      testeur
        .middleware()
        .reinitialise({ autorisationACharger: autorisationNonTrouvee });

      await testeur.verifieRequeteGenereErreurHTTP(
        403,
        'Droits insuffisants pour dupliquer le service',
        { method: 'copy', url: 'http://localhost:1234/api/service/123' }
      );
    });

    it("retourne une erreur HTTP 403 si l'utilisateur courant n'est pas le créateur du service", async () => {
      testeur.middleware().reinitialise({
        autorisationACharger: uneAutorisation().deContributeur().construis(),
      });

      await testeur.verifieRequeteGenereErreurHTTP(
        403,
        'Droits insuffisants pour dupliquer le service',
        { method: 'copy', url: 'http://localhost:1234/api/service/123' }
      );
    });

    it('retourne une erreur HTTP 424 si des données obligatoires ne sont pas renseignées', async () => {
      testeur.depotDonnees().dupliqueService = async () => {
        throw new ErreurDonneesObligatoiresManquantes(
          'Certaines données obligatoires ne sont pas renseignées'
        );
      };

      await testeur.verifieRequeteGenereErreurHTTP(
        424,
        {
          type: 'DONNEES_OBLIGATOIRES_MANQUANTES',
          message:
            'La duplication a échoué car certaines données obligatoires ne sont pas renseignées',
        },
        { method: 'copy', url: 'http://localhost:1234/api/service/123' }
      );
    });

    it('demande au dépôt de dupliquer le service', (done) => {
      let serviceDuplique = false;

      testeur.middleware().reinitialise({
        idUtilisateur: '999',
        autorisationACharger: Autorisation.NouvelleAutorisationProprietaire(),
      });

      testeur.depotDonnees().dupliqueService = (idService, idUtilisateur) => {
        try {
          expect(idService).to.equal('123');
          expect(idUtilisateur).to.equal('999');
          serviceDuplique = true;

          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios({
        method: 'copy',
        url: 'http://localhost:1234/api/service/123',
      })
        .then((reponse) => {
          expect(serviceDuplique).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.equal('Service dupliqué');
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });
  });

  describe('quand requête GET sur `/api/service/:id', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        echeancesRenouvellement: { unAn: {} },
        etapesParcoursHomologation: [{ numero: 1, id: 'autorite' }],
        statutsAvisDossierHomologation: { favorable: {} },
        statutsHomologation: { nonRealisee: {} },
      });

      const donneesDossier = unDossier(testeur.referentiel())
        .quiEstComplet()
        .quiEstNonFinalise().donnees;
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .ajouteUnContributeur(
          unUtilisateur().avecId('AAA').avecEmail('aaa@mail.fr').donnees
        )
        .ajouteUnContributeur(
          unUtilisateur().avecId('BBB').avecEmail('bbb@mail.fr').donnees
        )
        .avecDossiers([donneesDossier])
        .construis();
      testeur.middleware().reinitialise({
        serviceARenvoyer,
        idUtilisateur: '123',
        autorisationACharger: uneAutorisation()
          .avecDroits({ [HOMOLOGUER]: LECTURE })
          .construis(),
      });
    });

    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          [],
          { method: 'get', url: 'http://localhost:1234/api/service/456' },
          done
        );
    });

    it("aseptise l'id du service", (done) => {
      testeur
        .middleware()
        .verifieAseptisationParametres(
          ['id'],
          { method: 'get', url: 'http://localhost:1234/api/service/456' },
          done
        );
    });

    it("utilise le middleware de chargement de l'autorisation", (done) => {
      testeur
        .middleware()
        .verifieChargementDesAutorisations(
          'http://localhost:1234/api/service/456',
          done
        );
    });

    it('retourne la représentation du service grâce à `objetGetService`', async () => {
      const reponse = await axios('http://localhost:1234/api/service/456');

      expect(reponse.data).to.eql({
        id: '456',
        nomService: 'Nom service',
        organisationResponsable: 'ANSSI',
        contributeurs: [
          {
            id: 'AAA',
            prenomNom: 'aaa@mail.fr',
            initiales: '',
            poste: '',
            estUtilisateurCourant: false,
          },
          {
            id: 'BBB',
            prenomNom: 'bbb@mail.fr',
            initiales: '',
            poste: '',
            estUtilisateurCourant: false,
          },
        ],
        statutHomologation: {
          id: 'nonRealisee',
          enCoursEdition: true,
          etapeCourante: 'autorite',
        },
        nombreContributeurs: 2,
        estProprietaire: false,
        documentsPdfDisponibles: [],
        permissions: { gestionContributeurs: false },
        aUneSuggestionAction: false,
      });
    });
  });

  describe('quand requête PATCH sur `/api/service/:id/autorisations/:idAutorisation`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({
        autorisationACharger: uneAutorisation()
          .deProprietaire('AAA', '456')
          .construis(),
      });

      testeur.depotDonnees().autorisation = async () =>
        uneAutorisation().avecTousDroitsEcriture().construis();

      testeur.depotDonnees().sauvegardeAutorisation = async () => {};
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [],
        {
          method: 'PATCH',
          url: 'http://localhost:1234/api/service/456/autorisations/uuid-1',
          data: { droits: tousDroitsEnEcriture() },
        },
        done
      );
    });

    it("aseptise l'id du service et de l'autorisation", (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['id', 'idAutorisation'],
        {
          method: 'PATCH',
          url: 'http://localhost:1234/api/service/456/autorisations/uuid-1',
          data: { droits: tousDroitsEnEcriture() },
        },
        done
      );
    });

    it("utilise le middleware de chargement de l'autorisation", (done) => {
      testeur.middleware().verifieChargementDesAutorisations(
        {
          method: 'PATCH',
          url: 'http://localhost:1234/api/service/456/autorisations/uuid-1',
          data: { droits: tousDroitsEnEcriture() },
        },
        done
      );
    });

    it("renvoie une erreur 422 si l'utilisateur courant tente de modifier ses propres droits", async () => {
      const monAutorisation = uneAutorisation()
        .deProprietaire('123', 'ABC')
        .construis();

      testeur.middleware().reinitialise({
        idUtilisateur: '123',
        autorisationACharger: monAutorisation,
      });
      testeur.depotDonnees().autorisation = async () => monAutorisation;

      try {
        await axios.patch(
          'http://localhost:1234/api/service/456/autorisations/uuid-1',
          { droits: tousDroitsEnEcriture() }
        );

        expect().to.fail('La requête aurait dû lever une erreur HTTP 422');
      } catch (e) {
        expect(e.response.status).to.equal(422);
        expect(e.response.data).to.eql({ code: 'AUTO-MODIFICATION_INTERDITE' });
      }
    });

    it("renvoie une erreur 422 si l'utilisateur tente de modifier une autorisation qui n'appartient pas au service ciblé", async () => {
      const serviceABC = unService().avecId('ABC').construis();
      const leroyProprietaireDeABC = uneAutorisation()
        .deProprietaire('LEROY', 'ABC')
        .construis();

      testeur.middleware().reinitialise({
        idUtilisateur: 'LEROY',
        serviceARenvoyer: serviceABC,
        autorisationACharger: leroyProprietaireDeABC,
      });

      const autorisationSurDEF = uneAutorisation()
        .deContributeur('DUPONT', 'DEF')
        .construis();
      testeur.depotDonnees().autorisation = async () => autorisationSurDEF;

      try {
        const leroyVeutModifierDEF =
          'http://localhost:1234/api/service/456/autorisations/uuid-appartenant-a-DEF';
        await axios.patch(leroyVeutModifierDEF, {
          droits: tousDroitsEnEcriture(),
        });

        expect().to.fail(
          "La requête aurait dû lever une erreur HTTP 422 car Leroy tente d'utiliser le service ABC pour modifier chez DEF"
        );
      } catch (e) {
        if (!e.response) throw e;
        expect(e.response.status).to.equal(422);
        expect(e.response.data).to.eql({ code: 'LIEN_INCOHERENT' });
      }
    });

    it("renvoie une erreur 403 si l'utilisateur courant n'a pas le droit de gérer les contributeurs sur le service", async () => {
      testeur.middleware().reinitialise({
        autorisationACharger: { peutGererContributeurs: () => false },
      });

      try {
        await axios.patch(
          'http://localhost:1234/api/service/456/autorisations/uuid-1',
          { droits: tousDroitsEnEcriture() }
        );

        expect().to.fail('La requête aurait dû lever une erreur HTTP 403');
      } catch (e) {
        expect(e.response.status).to.equal(403);
        expect(e.response.data).to.eql({ code: 'INTERDIT' });
      }
    });

    it("récupère l'autorisation cible et lui applique les droits demandés puis persiste la modification", async () => {
      let autorisationCiblee;
      testeur.depotDonnees().autorisation = async (id) => {
        autorisationCiblee = id;
        return uneAutorisation().deContributeur('DUPONT', '456').construis();
      };

      let autorisationPersistee;
      testeur.depotDonnees().sauvegardeAutorisation = async (autorisation) => {
        autorisationPersistee = autorisation;
      };

      const droitsCible = {
        DECRIRE: 1,
        SECURISER: 1,
        HOMOLOGUER: 0,
        RISQUES: 0,
        CONTACTS: 2,
      };
      await axios.patch(
        'http://localhost:1234/api/service/456/autorisations/uuid-1',
        { droits: droitsCible }
      );

      expect(autorisationCiblee).to.be('uuid-1');
      expect(autorisationPersistee.droits).to.eql(droitsCible);
    });

    it("renvoie la représentation API de l'autorisation mise à jour", async () => {
      testeur.depotDonnees().autorisation = async (id) =>
        uneAutorisation().avecId(id).deContributeur('888', '456').construis();

      const droitsCible = {
        DECRIRE: 1,
        SECURISER: 1,
        HOMOLOGUER: 0,
        RISQUES: 0,
        CONTACTS: 2,
      };

      const reponse = await axios.patch(
        'http://localhost:1234/api/service/456/autorisations/uuid-1',
        { droits: droitsCible }
      );

      expect(reponse.data).to.eql({
        idAutorisation: 'uuid-1',
        idUtilisateur: '888',
        resumeNiveauDroit: 'PERSONNALISE',
        droits: droitsCible,
      });
    });

    it('jette une erreur 422 si les droits envoyés sont incohérents', async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        { code: 'DROITS_INCOHERENTS' },
        {
          method: 'PATCH',
          url: 'http://localhost:1234/api/service/456/autorisations/uuid-1',
          data: { droits: { MAUVAISE_RUBRIQUE: 1 } },
        }
      );
    });

    it('permet de nommer un nouveau propriétaire', async () => {
      testeur.depotDonnees().autorisation = async () =>
        uneAutorisation().deContributeur('BBB', '456').construis();

      let autorisationPersistee;
      testeur.depotDonnees().sauvegardeAutorisation = async (autorisation) => {
        autorisationPersistee = autorisation;
      };

      await axios.patch(
        'http://localhost:1234/api/service/456/autorisations/uuid-1',
        { droits: { estProprietaire: true } }
      );

      expect(autorisationPersistee.estProprietaire).to.be(true);
    });
  });

  describe('quand requête GET sur `/api/service/:id/autorisations', () => {
    beforeEach(() => {
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .construis();
      testeur.middleware().reinitialise({
        serviceARenvoyer,
        idUtilisateur: 'AAA',
      });
      testeur.depotDonnees().autorisationsDuService = async (idService) => [
        uneAutorisation().deProprietaire('AAA', idService).construis(),
      ];
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [],
        {
          method: 'get',
          url: 'http://localhost:1234/api/service/456/autorisations',
        },
        done
      );
    });

    it("aseptise l'id du service", (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['id'],
        {
          method: 'get',
          url: 'http://localhost:1234/api/service/456/autorisations',
        },
        done
      );
    });

    it('utilise le depot pour récupérer toutes les autorisations du service', async () => {
      let donneesPassees = {};
      testeur.depotDonnees().autorisationsDuService = async (idService) => {
        donneesPassees = { idService };
        return [uneAutorisation().deProprietaire('AAA', idService).construis()];
      };

      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .avecNContributeurs(1)
        .construis();
      testeur.middleware().reinitialise({
        serviceARenvoyer,
        idUtilisateur: 'AAA',
      });

      await axios.get('http://localhost:1234/api/service/456/autorisations');

      expect(donneesPassees).to.eql({ idService: '456' });
    });

    it('retourne les autorisations de chaque utilisateur du service', async () => {
      testeur.depotDonnees().autorisationsDuService = async () => [
        uneAutorisation()
          .avecId('uuid-a')
          .deProprietaire('AAA', '456')
          .construis(),
      ];

      const reponse = await axios.get(
        'http://localhost:1234/api/service/456/autorisations'
      );

      expect(reponse.data).to.eql([
        {
          idAutorisation: 'uuid-a',
          idUtilisateur: 'AAA',
          resumeNiveauDroit: 'PROPRIETAIRE',
          droits: tousDroitsEnEcriture(),
        },
      ]);
    });

    it("renvoie toutes les autorisations si l'utilisateur est créateur", async () => {
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .avecNContributeurs(3, ['ABC', 'DEF', 'GHI'])
        .construis();
      testeur.middleware().reinitialise({
        serviceARenvoyer,
        idUtilisateur: 'AAA',
      });
      testeur.depotDonnees().autorisationsDuService = async () => [
        uneAutorisation().deProprietaire('AAA', '456').construis(),
        uneAutorisation().deContributeur('ABC', '456').construis(),
        uneAutorisation().deContributeur('DEF', '456').construis(),
        uneAutorisation().deContributeur('GHI', '456').construis(),
      ];

      const reponse = await axios.get(
        'http://localhost:1234/api/service/456/autorisations'
      );

      expect(reponse.data.length).to.be(3 + 1);
    });

    it("renvoie uniquement le créateur et l'utilisateur s'il n'est pas créateur", async () => {
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .avecNContributeurs(3, ['ABC', 'DEF', 'GHI'])
        .construis();
      testeur.middleware().reinitialise({
        serviceARenvoyer,
        idUtilisateur: 'DEF',
      });
      testeur.depotDonnees().autorisationsDuService = async () => [
        uneAutorisation().deProprietaire('AAA', '456').construis(),
        uneAutorisation().deContributeur('ABC', '456').construis(),
        uneAutorisation().deContributeur('DEF', '456').construis(),
        uneAutorisation().deContributeur('GHI', '456').construis(),
      ];

      const { data } = await axios.get(
        'http://localhost:1234/api/service/456/autorisations'
      );

      expect(data.length).to.be(2);
      expect(data[0].idUtilisateur).to.equal('AAA');
      expect(data[1].idUtilisateur).to.equal('DEF');
    });
  });

  describe('quand requête GET sur `/api/service/:id/indiceCyber', () => {
    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: LECTURE, rubrique: SECURISER }],
        {
          method: 'get',
          url: 'http://localhost:1234/api/service/456/indiceCyber',
        },
        done
      );
    });

    it("aseptise l'id du service", (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['id'],
        {
          method: 'get',
          url: 'http://localhost:1234/api/service/456/indiceCyber',
        },
        done
      );
    });

    it("renvoie l'indice cyber du service", async () => {
      const serviceARenvoyer = unService().construis();
      serviceARenvoyer.indiceCyber = () => ({ total: 1.5 });
      testeur.middleware().reinitialise({
        serviceARenvoyer,
      });

      const { data } = await axios.get(
        'http://localhost:1234/api/service/456/indiceCyber'
      );

      expect(data.total).to.be(1.5);
    });
  });

  describe('quand requête GET sur `/api/service/:id/completude', () => {
    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: LECTURE, rubrique: SECURISER }],
        {
          method: 'get',
          url: 'http://localhost:1234/api/service/456/completude',
        },
        done
      );
    });

    it("aseptise l'id du service", (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['id'],
        {
          method: 'get',
          url: 'http://localhost:1234/api/service/456/completude',
        },
        done
      );
    });

    it('renvoie la complétude des mesures du service', async () => {
      const serviceARenvoyer = unService().construis();
      serviceARenvoyer.completudeMesures = () => ({
        nombreMesuresCompletes: 2,
        nombreTotalMesures: 10,
      });
      testeur.middleware().reinitialise({
        serviceARenvoyer,
      });

      const { data } = await axios.get(
        'http://localhost:1234/api/service/456/completude'
      );

      expect(data.completude).to.be(20);
    });
  });

  describe('quand requête POST sur `/api/service/:id/retourUtilisateurMesure', () => {
    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: ECRITURE, rubrique: SECURISER }],
        {
          method: 'post',
          url: 'http://localhost:1234/api/service/456/retourUtilisateurMesure',
        },
        done
      );
    });

    it('aseptise les données de la requête', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['id', 'idMesure', 'idRetour', 'commentaire'],
        {
          method: 'post',
          url: 'http://localhost:1234/api/service/456/retourUtilisateurMesure',
        },
        done
      );
    });

    it("retourne une erreur HTTP 424 si l'id du retour utilisateur est inconnu", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        424,
        {
          type: 'DONNEES_INCORRECTES',
          message: "L'identifiant de retour utilisateur est incorrect.",
        },
        {
          method: 'post',
          url: 'http://localhost:1234/api/service/456/retourUtilisateurMesure',
          data: { idRetour: 'idRetourInconnu' },
        }
      );
    });

    it("retourne une erreur HTTP 424 si l'id de mesure est inconnu", async () => {
      testeur.referentiel().recharge({
        retoursUtilisateurMesure: { idRetour: 'un retour utilisateur' },
      });
      await testeur.verifieRequeteGenereErreurHTTP(
        424,
        {
          type: 'DONNEES_INCORRECTES',
          message: "L'identifiant de mesure est incorrect.",
        },
        {
          method: 'post',
          url: 'http://localhost:1234/api/service/456/retourUtilisateurMesure',
          data: { idMesure: 'idMesureInconnu', idRetour: 'idRetour' },
        }
      );
    });

    it('consigne un événement de retour utilisateur sur une mesure', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      testeur.referentiel().recharge({
        retoursUtilisateurMesure: { bonneMesure: 'mesure satisfaisante' },
        mesures: { implementerMfa: {} },
      });
      let evenementRecu = {};
      testeur.adaptateurJournalMSS().consigneEvenement = async (donnees) => {
        evenementRecu = donnees;
      };

      await axios.post(
        'http://localhost:1234/api/service/456/retourUtilisateurMesure',
        {
          idMesure: 'implementerMfa',
          idRetour: 'bonneMesure',
          commentaire: 'un commentaire',
        }
      );

      expect(evenementRecu.type).to.equal('RETOUR_UTILISATEUR_MESURE_RECU');
    });
  });

  describe('quand requête DELETE sur `/api/service/:id/homologation/dossierCourant`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({
        autorisationACharger: Autorisation.NouvelleAutorisationProprietaire(),
      });
    });

    it('utilise le middleware de recherche du service', (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: ECRITURE, rubrique: HOMOLOGUER }],
        {
          method: 'delete',
          url: 'http://localhost:1234/api/service/123/homologation/dossierCourant',
        },
        done
      );
    });

    it('utilise le middleware de challenge du mot de passe', (done) => {
      testeurMSS().middleware().verifieChallengeMotDePasse(
        {
          method: 'delete',
          url: 'http://localhost:1234/api/service/123/homologation/dossierCourant',
        },
        done
      );
    });

    it("retourne une erreur HTTP 422 si le service n'a pas de dossier courant", async () => {
      const service = unService().construis();
      testeur.middleware().reinitialise({ serviceARenvoyer: service });

      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Les dossiers ne comportent pas de dossier courant',
        {
          method: 'delete',
          url: 'http://localhost:1234/api/service/123/homologation/dossierCourant',
        }
      );
    });

    it('demande au dépôt de mettre à jour le service', async () => {
      const referentiel = Referentiel.creeReferentiel({
        echeancesRenouvellement: { unAn: {} },
        statutsAvisDossierHomologation: { favorable: {} },
      });
      const service = unService(referentiel)
        .avecId('123')
        .avecDossiers([
          unDossier(referentiel).quiEstComplet().quiEstNonFinalise().donnees,
        ])
        .construis();
      let serviceMisAJour;

      testeur.middleware().reinitialise({ serviceARenvoyer: service });
      testeur.depotDonnees().metsAJourService = async (s) => {
        serviceMisAJour = s;
      };

      await axios.delete(
        'http://localhost:1234/api/service/123/homologation/dossierCourant'
      );

      expect(serviceMisAJour.id).to.be('123');
    });
  });

  describe('quand requête POST sur `/api/service/estimationNiveauSecurite`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur.middleware().verifieRequeteExigeAcceptationCGU(
        {
          method: 'post',
          url: 'http://localhost:1234/api/service/estimationNiveauSecurite',
        },
        done
      );
    });

    it('aseptise les paramètres', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        [
          'nomService',
          'organisationsResponsables.*',
          'nombreOrganisationsUtilisatrices.*',
        ],
        {
          method: 'post',
          url: 'http://localhost:1234/api/service/estimationNiveauSecurite',
        },
        done
      );
    });

    it('aseptise les listes de paramètres ainsi que leur contenu', async () => {
      await axios.post(
        'http://localhost:1234/api/service/estimationNiveauSecurite'
      );

      testeur
        .middleware()
        .verifieAseptisationListe('pointsAcces', ['description']);
      testeur
        .middleware()
        .verifieAseptisationListe('fonctionnalitesSpecifiques', [
          'description',
        ]);
      testeur
        .middleware()
        .verifieAseptisationListe('donneesSensiblesSpecifiques', [
          'description',
        ]);
    });

    it("retourne l'estimation du niveau de sécurité pour la description donnée", async () => {
      const donneesDescriptionNiveau1 = { nomService: 'Mon service' };
      const resultat = await axios.post(
        'http://localhost:1234/api/service/estimationNiveauSecurite',
        donneesDescriptionNiveau1
      );

      expect(resultat.status).to.be(200);
      expect(resultat.data.niveauDeSecuriteMinimal).to.be('niveau1');
    });

    it('retourne une erreur HTTP 400 si les données de description de service sont invalides', async () => {
      const donneesInvalides = { statutDeploiement: 'statutInvalide' };
      await testeur.verifieRequeteGenereErreurHTTP(
        400,
        'La description du service est invalide',
        {
          method: 'post',
          url: 'http://localhost:1234/api/service/estimationNiveauSecurite',
          data: donneesInvalides,
        }
      );
    });
  });

  describe('quand requête PUT sur `/api/service/:id/suggestionAction/:nature`', () => {
    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [],
        {
          method: 'put',
          url: 'http://localhost:1234/api/service/123/suggestionAction/peuimporte',
        },
        done
      );
    });

    it('aseptise les paramètres', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['id', 'nature'],
        {
          method: 'put',
          url: 'http://localhost:1234/api/service/123/suggestionAction/peuimporte',
        },
        done
      );
    });

    it('utilise le dépôt de données pour acquitter la suggestion', async () => {
      let donneesDepotAppele = null;
      testeur.depotDonnees().acquitteSuggestionAction = (
        idService,
        natureSuggestion
      ) => {
        donneesDepotAppele = { idService, natureSuggestion };
      };
      testeur.referentiel().recharge({
        naturesSuggestionsActions: {
          niveauRetrograde: {},
        },
      });

      const resultat = await axios.put(
        'http://localhost:1234/api/service/123/suggestionAction/niveauRetrograde'
      );

      expect(donneesDepotAppele).to.be.an('object');
      expect(donneesDepotAppele.idService).to.be('123');
      expect(donneesDepotAppele.natureSuggestion).to.be('niveauRetrograde');
      expect(resultat.status).to.be(200);
    });

    it('renvoie une erreur lorsque la nature n’est pas connue', async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        400,
        'La nature de la suggestion d’action est inconnue',
        {
          method: 'put',
          url: 'http://localhost:1234/api/service/123/suggestionAction/inconnue',
        }
      );
    });
  });
});
