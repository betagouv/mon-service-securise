const axios = require('axios');
const expect = require('expect.js');

const testeurMSS = require('../testeurMSS');

const uneDescriptionValide = require('../../constructeurs/constructeurDescriptionService');
const { unDossier } = require('../../constructeurs/constructeurDossier');
const { unService } = require('../../constructeurs/constructeurService');
const {
  ErreurDonneesObligatoiresManquantes,
  ErreurNomServiceDejaExistant,
} = require('../../../src/erreurs');
const AutorisationContributeur = require('../../../src/modeles/autorisations/autorisationContributeur');
const AutorisationCreateur = require('../../../src/modeles/autorisations/autorisationCreateur');
const Homologation = require('../../../src/modeles/homologation');
const {
  Permissions,
  Rubriques,
} = require('../../../src/modeles/autorisations/gestionDroits');
const {
  uneAutorisation,
} = require('../../constructeurs/constructeurAutorisation');

const { ECRITURE, LECTURE } = Permissions;
const { RISQUES, DECRIRE, SECURISER, CONTACTS, HOMOLOGUER } = Rubriques;

describe('Le serveur MSS des routes /api/service/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête POST sur `/api/service`', () => {
    beforeEach(() => {
      testeur.depotDonnees().nouvelleHomologation = () => Promise.resolve();
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
          ['nomService', 'organisationsResponsables.*'],
          { method: 'post', url: 'http://localhost:1234/api/service' },
          done
        );
    });

    it("aseptise la liste des points d'accès ainsi que son contenu", (done) => {
      axios
        .post('http://localhost:1234/api/service', {})
        .then(() => {
          testeur
            .middleware()
            .verifieAseptisationListe('pointsAcces', ['description']);
          done();
        })
        .catch(done);
    });

    it('aseptise la liste des fonctionnalités spécifiques ainsi que son contenu', (done) => {
      axios
        .post('http://localhost:1234/api/service', {})
        .then(() => {
          testeur
            .middleware()
            .verifieAseptisationListe('fonctionnalitesSpecifiques', [
              'description',
            ]);
          done();
        })
        .catch(done);
    });

    it('aseptise la liste des données sensibles spécifiques ainsi que son contenu', (done) => {
      axios
        .post('http://localhost:1234/api/service', {})
        .then(() => {
          testeur
            .middleware()
            .verifieAseptisationListe('donneesSensiblesSpecifiques', [
              'description',
            ]);
          done();
        })
        .catch(done);
    });

    it('retourne une erreur HTTP 422 si les données de description de service sont invalides', (done) => {
      testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Le statut de déploiement "statutInvalide" est invalide',
        {
          method: 'post',
          url: 'http://localhost:1234/api/service',
          data: { statutDeploiement: 'statutInvalide' },
        },
        done
      );
    });

    it('retourne une erreur HTTP 422 si données insuffisantes pour création service', (done) => {
      testeur.depotDonnees().nouvelleHomologation = () =>
        Promise.reject(new ErreurDonneesObligatoiresManquantes('oups'));

      testeur.verifieRequeteGenereErreurHTTP(
        422,
        'oups',
        {
          method: 'post',
          url: 'http://localhost:1234/api/service',
          data: {},
        },
        done
      );
    });

    it('retourne une erreur HTTP 422 si le nom du service existe déjà', (done) => {
      testeur.depotDonnees().nouvelleHomologation = () =>
        Promise.reject(new ErreurNomServiceDejaExistant('oups'));

      testeur.verifieRequeteGenereErreurHTTP(
        422,
        { erreur: { code: 'NOM_SERVICE_DEJA_EXISTANT' } },
        {
          method: 'post',
          url: 'http://localhost:1234/api/service',
          data: { nomService: 'Un nom déjà existant' },
        },
        done
      );
    });

    it("demande au dépôt de données d'enregistrer les nouveaux service", (done) => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      const donneesDescriptionService = uneDescriptionValide(
        testeur.referentiel()
      )
        .construis()
        .toJSON();

      testeur.depotDonnees().nouvelleHomologation = (
        idUtilisateur,
        { descriptionService }
      ) => {
        expect(idUtilisateur).to.equal('123');
        expect(descriptionService).to.eql(donneesDescriptionService);
        return Promise.resolve('456');
      };

      axios
        .post('http://localhost:1234/api/service', donneesDescriptionService)
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idService: '456' });
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });
  });

  describe('quand requête PUT sur `/api/service/:id`', () => {
    beforeEach(() => {
      testeur.depotDonnees().ajouteDescriptionServiceAHomologation = () =>
        Promise.resolve();
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
          ['nomService', 'organisationsResponsables.*'],
          { method: 'put', url: 'http://localhost:1234/api/service/456' },
          done
        );
    });

    it("aseptise la liste des points d'accès ainsi que son contenu", (done) => {
      axios
        .put('http://localhost:1234/api/service/456', {})
        .then(() => {
          testeur
            .middleware()
            .verifieAseptisationListe('pointsAcces', ['description']);
          done();
        })
        .catch(done);
    });

    it('aseptise la liste des fonctionnalités spécifiques ainsi que son contenu', (done) => {
      axios
        .put('http://localhost:1234/api/service/456', {})
        .then(() => {
          testeur
            .middleware()
            .verifieAseptisationListe('fonctionnalitesSpecifiques', [
              'description',
            ]);
          done();
        })
        .catch(done);
    });

    it('aseptise la liste des données sensibles spécifiques ainsi que son contenu', (done) => {
      axios
        .put('http://localhost:1234/api/service/456', {})
        .then(() => {
          testeur
            .middleware()
            .verifieAseptisationListe('donneesSensiblesSpecifiques', [
              'description',
            ]);
          done();
        })
        .catch(done);
    });

    it('demande au dépôt de données de mettre à jour le service', (done) => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      testeur.depotDonnees().ajouteDescriptionServiceAHomologation = (
        idUtilisateur,
        idService,
        infosGenerales
      ) => {
        expect(idUtilisateur).to.equal('123');
        expect(idService).to.equal('456');
        expect(infosGenerales.nomService).to.equal('Nouveau Nom');
        return Promise.resolve();
      };

      axios
        .put('http://localhost:1234/api/service/456', {
          nomService: 'Nouveau Nom',
        })
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idService: '456' });
          done();
        })
        .catch(done);
    });

    it('retourne une erreur HTTP 422 si le validateur du modèle échoue', (done) => {
      testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Le statut de déploiement "statutInvalide" est invalide',
        {
          method: 'put',
          url: 'http://localhost:1234/api/service/456',
          data: { statutDeploiement: 'statutInvalide' },
        },
        done
      );
    });

    it('retourne une erreur HTTP 422 si la validation des propriétés obligatoires échoue', (done) => {
      testeur.depotDonnees().ajouteDescriptionServiceAHomologation = () =>
        Promise.reject(new ErreurNomServiceDejaExistant('oups'));

      testeur.verifieRequeteGenereErreurHTTP(
        422,
        'oups',
        {
          method: 'put',
          url: 'http://localhost:1234/api/service/456',
          data: { nomService: 'service déjà existant' },
        },
        done
      );
    });
  });

  describe('quand requête POST sur `/api/service/:id/mesures', () => {
    beforeEach(() => {
      testeur.depotDonnees().ajouteMesuresAHomologation = () =>
        Promise.resolve();
      testeur.referentiel().recharge({
        categoriesMesures: { uneCategorie: 'Une catégorie' },
        mesures: { identifiantMesure: {} },
        statutsMesures: { fait: 'Fait' },
      });
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: ECRITURE, rubrique: SECURISER }],
        {
          method: 'post',
          url: 'http://localhost:1234/api/service/456/mesures',
        },
        done
      );
    });

    it('aseptise tous les paramètres de la requête', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        [
          'mesuresGenerales.*.statut',
          'mesuresGenerales.*.modalites',
          'mesuresSpecifiques.*.description',
          'mesuresSpecifiques.*.categorie',
          'mesuresSpecifiques.*.statut',
          'mesuresSpecifiques.*.modalites',
        ],
        {
          method: 'post',
          url: 'http://localhost:1234/api/service/456/mesures',
        },
        done
      );
    });

    it("demande au dépôt d'associer les mesures au service", (done) => {
      let mesuresAjoutees = false;

      testeur.depotDonnees().ajouteMesuresAHomologation = (
        idService,
        [generale],
        specifiques
      ) => {
        expect(idService).to.equal('456');
        expect(generale.id).to.equal('identifiantMesure');
        expect(generale.statut).to.equal('fait');
        expect(generale.modalites).to.equal("Des modalités d'application");

        expect(specifiques.nombre()).to.equal(1);
        expect(specifiques.item(0).description).to.equal(
          'Une mesure spécifique'
        );

        mesuresAjoutees = true;
        return Promise.resolve();
      };

      axios
        .post('http://localhost:1234/api/service/456/mesures', {
          mesuresGenerales: {
            identifiantMesure: {
              statut: 'fait',
              modalites: "Des modalités d'application",
            },
          },
          mesuresSpecifiques: [
            {
              description: 'Une mesure spécifique',
              categorie: 'uneCategorie',
              statut: 'fait',
            },
          ],
        })
        .then((reponse) => {
          expect(mesuresAjoutees).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idService: '456' });
          done();
        })
        .catch(done);
    });

    it('filtre les mesures spécifiques vides', (done) => {
      let mesuresRemplacees = false;
      testeur.depotDonnees().ajouteMesuresAHomologation = (
        _id,
        _generales,
        specifiques
      ) => {
        expect(specifiques.nombre()).to.equal(1);
        mesuresRemplacees = true;
        return Promise.resolve();
      };

      const mesuresSpecifiques = [];
      mesuresSpecifiques[2] = {
        description: 'Une mesure spécifique',
        categorie: 'uneCategorie',
        statut: 'fait',
      };

      axios
        .post('http://localhost:1234/api/service/456/mesures', {
          mesuresSpecifiques,
        })
        .then(() => expect(mesuresRemplacees).to.be(true))
        .then(() => done())
        .catch(done);
    });

    it("filtre les mesures spécifiques qui n'ont pas les propriétés requises", (done) => {
      let mesuresRemplacees = false;
      testeur.depotDonnees().ajouteMesuresAHomologation = (
        _id,
        _generales,
        specifiques
      ) => {
        expect(specifiques.nombre()).to.equal(1);
        mesuresRemplacees = true;
        return Promise.resolve();
      };

      const mesuresSpecifiques = [
        {
          description: 'Mesure bien renseignée',
          categorie: 'uneCategorie',
          statut: 'fait',
        },
        { categorie: 'uneCategorie', statut: 'fait' },
        { description: 'Mesure sans catégorie', statut: 'fait' },
        { description: 'Mesure sans statut', categorie: 'uneCategorie' },
        { modalites: 'Modalités' },
      ];

      axios
        .post('http://localhost:1234/api/service/456/mesures', {
          mesuresSpecifiques,
        })
        .then(() => expect(mesuresRemplacees).to.be(true))
        .then(() => done())
        .catch(done);
    });

    it('retourne une erreur HTTP 422 si les données sont invalides', (done) => {
      testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Données invalides',
        {
          method: 'post',
          url: 'http://localhost:1234/api/service/456/mesures',
          data: {
            mesuresGenerales: {
              identifiantInvalide: { statut: 'statutInvalide' },
            },
          },
        },
        done
      );
    });
  });

  describe('quand requête POST sur `/api/service/:id/rolesResponsabilites`', () => {
    beforeEach(() => {
      testeur.depotDonnees().ajouteRolesResponsabilitesAHomologation = () =>
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

    it("demande au dépôt d'associer les rôles et responsabilités au service", (done) => {
      let rolesResponsabilitesAjoutees = false;

      testeur.depotDonnees().ajouteRolesResponsabilitesAHomologation = (
        idService,
        role
      ) => {
        expect(idService).to.equal('456');
        expect(role.autoriteHomologation).to.equal('Jean Dupont');
        rolesResponsabilitesAjoutees = true;
        return Promise.resolve();
      };

      axios
        .post('http://localhost:1234/api/service/456/rolesResponsabilites', {
          autoriteHomologation: 'Jean Dupont',
        })
        .then((reponse) => {
          expect(rolesResponsabilitesAjoutees).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idService: '456' });
          done();
        })
        .catch(done);
    });

    it("aseptise la liste des acteurs de l'homologation ainsi que son contenu", (done) => {
      axios
        .post('http://localhost:1234/api/service/456/rolesResponsabilites', {})
        .then(() => {
          testeur
            .middleware()
            .verifieAseptisationListe('acteursHomologation', [
              'role',
              'nom',
              'fonction',
            ]);
          done();
        })
        .catch(done);
    });

    it('aseptise la liste des parties prenantes ainsi que son contenu', (done) => {
      axios
        .post('http://localhost:1234/api/service/456/rolesResponsabilites', {})
        .then(() => {
          testeur
            .middleware()
            .verifieAseptisationListe('partiesPrenantes', [
              'nom',
              'natureAcces',
              'pointContact',
            ]);
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête POST sur `/api/service/:id/risques`', () => {
    beforeEach(() => {
      testeur.depotDonnees().remplaceRisquesSpecifiquesPourHomologation = () =>
        Promise.resolve();
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

    it("demande au dépôt d'associer les risques généraux au service", (done) => {
      testeur.referentiel().recharge({
        risques: { unRisque: {} },
        niveauxGravite: { unNiveau: {} },
      });
      let risqueAjoute = false;

      testeur.depotDonnees().ajouteRisqueGeneralAHomologation = (
        idService,
        risque
      ) => {
        try {
          expect(idService).to.equal('456');
          expect(risque.id).to.equal('unRisque');
          expect(risque.commentaire).to.equal('Un commentaire');
          expect(risque.niveauGravite).to.equal('unNiveau');
          risqueAjoute = true;
          return Promise.resolve();
        } catch (e) {
          return done(e);
        }
      };

      axios
        .post('http://localhost:1234/api/service/456/risques', {
          'commentaire-unRisque': 'Un commentaire',
          'niveauGravite-unRisque': 'unNiveau',
        })
        .then((reponse) => {
          expect(risqueAjoute).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idService: '456' });
          done();
        })
        .catch(done);
    });

    it("demande au dépôt d'associer les risques spécifiques au service", (done) => {
      let risquesRemplaces = false;
      testeur.depotDonnees().remplaceRisquesSpecifiquesPourHomologation = (
        idService,
        risques
      ) => {
        expect(idService).to.equal('456');
        expect(risques.nombre()).to.equal(1);
        expect(risques.item(0).description).to.equal('Un risque spécifique');
        expect(risques.item(0).commentaire).to.equal('Un commentaire');
        risquesRemplaces = true;
        return Promise.resolve();
      };

      axios
        .post('http://localhost:1234/api/service/456/risques', {
          risquesSpecifiques: [
            {
              description: 'Un risque spécifique',
              commentaire: 'Un commentaire',
            },
          ],
        })
        .then(() => expect(risquesRemplaces).to.be(true))
        .then(() => done())
        .catch(done);
    });

    it('filtre les risques spécifiques vides', (done) => {
      testeur.referentiel().recharge({ niveauxGravite: { unNiveau: {} } });

      let risquesRemplaces = false;
      testeur.depotDonnees().remplaceRisquesSpecifiquesPourHomologation = (
        _,
        risques
      ) => {
        expect(risques.nombre()).to.equal(2);
        risquesRemplaces = true;
        return Promise.resolve();
      };

      const risquesSpecifiques = [];
      risquesSpecifiques[2] = { description: 'Un risque spécifique' };
      risquesSpecifiques[5] = { niveauGravite: 'unNiveau' };

      axios
        .post('http://localhost:1234/api/service/456/risques', {
          risquesSpecifiques,
        })
        .then(() => expect(risquesRemplaces).to.be(true))
        .then(() => done())
        .catch(done);
    });

    it('retourne une erreur HTTP 422 si les données sont invalides', (done) => {
      testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Données invalides',
        {
          method: 'post',
          url: 'http://localhost:1234/api/service/456/risques',
          data: { 'commentaire-unRisqueInvalide': 'Un commentaire' },
        },
        done
      );
    });
  });

  describe('quand requête PUT sur /api/service/:id/homologation/autorite', () => {
    beforeEach(() => {
      const homologationAvecDossier = new Homologation({
        id: '456',
        descriptionService: { nomService: 'un service' },
        dossiers: [{ id: '999' }],
      });
      testeur
        .middleware()
        .reinitialise({ homologationARenvoyer: homologationAvecDossier });
      testeur.depotDonnees().enregistreDossier = () => Promise.resolve();
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

    it("utilise le dépôt pour enregistrer l'autorité d'homologation", (done) => {
      let depotAppele = false;

      testeur.depotDonnees().enregistreDossier = (idHomologation, dossier) => {
        depotAppele = true;
        expect(idHomologation).to.equal('456');
        expect(dossier.autorite.nom).to.equal('Jean Dupond');
        expect(dossier.autorite.fonction).to.equal('RSSI');
        return Promise.resolve();
      };

      axios
        .put('http://localhost:1234/api/service/456/homologation/autorite', {
          nom: 'Jean Dupond',
          fonction: 'RSSI',
        })
        .then(() => expect(depotAppele).to.be(true))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });
  });

  describe('quand requête PUT sur /api/service/:id/homologation/decision', () => {
    beforeEach(() => {
      const homologationAvecDossier = new Homologation({
        id: '456',
        descriptionService: { nomService: 'un service' },
        dossiers: [{ id: '999' }],
      });
      testeur
        .middleware()
        .reinitialise({ homologationARenvoyer: homologationAvecDossier });
      testeur.depotDonnees().enregistreDossier = () => Promise.resolve();
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
      const homologationAvecDossier = new Homologation({
        id: '456',
        descriptionService: { nomService: 'un service' },
        dossiers: [{ id: '999' }],
      });
      testeur
        .middleware()
        .reinitialise({ homologationARenvoyer: homologationAvecDossier });
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
      const homologationAvecDossier = new Homologation(
        {
          id: '456',
          descriptionService: { nomService: 'un service' },
          dossiers: [{ id: '999' }],
        },
        testeur.referentiel()
      );
      testeur
        .middleware()
        .reinitialise({ homologationARenvoyer: homologationAvecDossier });
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
      const homologationAvecDossier = new Homologation(
        {
          id: '456',
          descriptionService: { nomService: 'un service' },
          dossiers: [{ id: '999' }],
        },
        testeur.referentiel()
      );
      testeur
        .middleware()
        .reinitialise({ homologationARenvoyer: homologationAvecDossier });
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
      const homologationAvecDossier = new Homologation(
        {
          id: '456',
          descriptionService: { nomService: 'un service' },
          dossiers: [unDossier().quiEstComplet().quiEstNonFinalise().donnees],
        },
        testeur.referentiel()
      );
      testeur
        .middleware()
        .reinitialise({ homologationARenvoyer: homologationAvecDossier });
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
      testeur.depotDonnees().autorisationPour = () =>
        Promise.resolve(new AutorisationCreateur());
      testeur.depotDonnees().supprimeHomologation = () => Promise.resolve();
    });

    it('vérifie que les CGU sont acceptées', (done) => {
      testeur.middleware().verifieRequeteExigeAcceptationCGU(
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

    it("demande au dépôt de vérifier l'autorisation d'accès au service pour l'utilisateur courant", (done) => {
      let autorisationVerifiee = false;

      testeur.middleware().reinitialise({ idUtilisateur: '999' });
      testeur.depotDonnees().autorisationPour = (idUtilisateur, idService) => {
        try {
          expect(idUtilisateur).to.equal('999');
          expect(idService).to.equal('123');
          autorisationVerifiee = true;

          return Promise.resolve(new AutorisationCreateur());
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios
        .delete('http://localhost:1234/api/service/123')
        .then(() => expect(autorisationVerifiee).to.be(true))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });

    it("retourne une erreur HTTP 403 si l'utilisateur courant n'a pas accès au service", (done) => {
      const autorisationNonTrouvee = undefined;
      testeur.depotDonnees().autorisationPour = () =>
        Promise.resolve(autorisationNonTrouvee);

      testeur.verifieRequeteGenereErreurHTTP(
        403,
        'Droits insuffisants pour supprimer le service',
        {
          method: 'delete',
          url: 'http://localhost:1234/api/service/123',
        },
        done
      );
    });

    it("retourne une erreur HTTP 403 si l'utilisateur courant n'a pas les droits de suppression du service", (done) => {
      testeur.depotDonnees().autorisationPour = () =>
        Promise.resolve(new AutorisationContributeur());

      testeur.verifieRequeteGenereErreurHTTP(
        403,
        'Droits insuffisants pour supprimer le service',
        {
          method: 'delete',
          url: 'http://localhost:1234/api/service/123',
        },
        done
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
      testeur.depotDonnees().dupliqueHomologation = () => Promise.resolve();
      testeur.depotDonnees().autorisationPour = () =>
        Promise.resolve(new AutorisationCreateur());
    });

    it('vérifie que les CGU sont acceptées', (done) => {
      testeur.middleware().verifieRequeteExigeAcceptationCGU(
        {
          method: 'copy',
          url: 'http://localhost:1234/api/service/123',
        },
        done
      );
    });

    it("demande au dépôt de vérifier que l'utilisateur courant a le droit de dupliquer le service", (done) => {
      let autorisationVerifiee = false;

      testeur.middleware().reinitialise({ idUtilisateur: '999' });
      testeur.depotDonnees().autorisationPour = (idUtilisateur, idService) => {
        try {
          expect(idUtilisateur).to.equal('999');
          expect(idService).to.equal('123');
          autorisationVerifiee = true;

          return Promise.resolve(new AutorisationCreateur());
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios({
        method: 'copy',
        url: 'http://localhost:1234/api/service/123',
      })
        .then(() => expect(autorisationVerifiee).to.be(true))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });

    it("retourne une erreur HTTP 403 si l'utilisateur courant n'a pas accès au service", (done) => {
      const autorisationNonTrouvee = undefined;
      testeur.depotDonnees().autorisationPour = () =>
        Promise.resolve(autorisationNonTrouvee);

      testeur.verifieRequeteGenereErreurHTTP(
        403,
        'Droits insuffisants pour dupliquer le service',
        {
          method: 'copy',
          url: 'http://localhost:1234/api/service/123',
        },
        done
      );
    });

    it("retourne une erreur HTTP 403 si l'utilisateur courant n'est pas le créateur du service", (done) => {
      testeur.depotDonnees().autorisationPour = () =>
        Promise.resolve(new AutorisationContributeur());

      testeur.verifieRequeteGenereErreurHTTP(
        403,
        'Droits insuffisants pour dupliquer le service',
        {
          method: 'copy',
          url: 'http://localhost:1234/api/service/123',
        },
        done
      );
    });

    it('retourne une erreur HTTP 424 si des données obligatoires ne sont pas renseignées', (done) => {
      testeur.depotDonnees().dupliqueHomologation = () =>
        Promise.reject(
          new ErreurDonneesObligatoiresManquantes(
            'Certaines données obligatoires ne sont pas renseignées'
          )
        );

      testeur.verifieRequeteGenereErreurHTTP(
        424,
        {
          type: 'DONNEES_OBLIGATOIRES_MANQUANTES',
          message:
            'La duplication a échoué car certaines données obligatoires ne sont pas renseignées',
        },
        {
          method: 'copy',
          url: 'http://localhost:1234/api/service/123',
        },
        done
      );
    });

    it('demande au dépôt de dupliquer le service', (done) => {
      let serviceDuplique = false;

      testeur.middleware().reinitialise({ idUtilisateur: '999' });
      testeur.depotDonnees().dupliqueHomologation = (idService) => {
        try {
          expect(idService).to.equal('123');
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

      testeur.depotDonnees().autorisationPour = async () =>
        uneAutorisation()
          .avecDroits({ [HOMOLOGUER]: LECTURE })
          .construis();

      const donneesDossier = unDossier(testeur.referentiel())
        .quiEstComplet()
        .quiEstNonFinalise().donnees;
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .avecDossiers([donneesDossier])
        .construis();
      testeur.middleware().reinitialise({
        homologationARenvoyer: serviceARenvoyer,
        idUtilisateur: '123',
      });
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [],
        {
          method: 'get',
          url: 'http://localhost:1234/api/service/456',
        },
        done
      );
    });

    it("aseptise l'id du service", (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['id'],
        {
          method: 'get',
          url: 'http://localhost:1234/api/service/456',
        },
        done
      );
    });

    it("interroge le dépôt pour obtenir l'autorisation associée", async () => {
      let donneesPassees = {};
      testeur.depotDonnees().autorisationPour = async (
        idUtilisateur,
        idService
      ) => {
        donneesPassees = { idUtilisateur, idService };
        return uneAutorisation().avecDroits({}).construis();
      };

      const reponse = await axios('http://localhost:1234/api/service/456');
      expect(donneesPassees.idUtilisateur).to.equal('123');
      expect(donneesPassees.idService).to.equal('456');
    });

    it('retourne la représentation du service grâce à `objetGetService`', async () => {
      const reponse = await axios('http://localhost:1234/api/service/456');

      expect(reponse.data).to.eql({
        id: '456',
        nomService: 'Nom service',
        organisationsResponsables: ['ANSSI'],
        createur: {
          id: 'AAA',
          prenomNom: 'jean.dujardin@beta.gouv.com',
          initiales: '',
          poste: '',
        },
        contributeurs: [],
        statutHomologation: { id: 'nonRealisee', enCoursEdition: true },
        nombreContributeurs: 1,
        estCreateur: false,
        documentsPdfDisponibles: ['annexes', 'syntheseSecurite'],
        permissions: { suppressionContributeur: false },
      });
    });
  });
});
