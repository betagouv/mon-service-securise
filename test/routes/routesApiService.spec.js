const axios = require('axios');
const expect = require('expect.js');

const testeurMSS = require('./testeurMSS');

const uneDescriptionValide = require('../constructeurs/constructeurDescriptionService');
const { ErreurModele, ErreurDonneesObligatoiresManquantes, ErreurNomServiceDejaExistant } = require('../../src/erreurs');
const AutorisationContributeur = require('../../src/modeles/autorisations/autorisationContributeur');
const AutorisationCreateur = require('../../src/modeles/autorisations/autorisationCreateur');
const Homologation = require('../../src/modeles/homologation');

describe('Le serveur MSS des routes /api/service/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête POST sur `/api/service`', () => {
    beforeEach(() => {
      testeur.depotDonnees().nouvelleHomologation = () => Promise.resolve();
    });

    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur.middleware().verifieRequeteExigeAcceptationCGU(
        { method: 'post', url: 'http://localhost:1234/api/service' }, done
      );
    });

    it('aseptise les paramètres', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['nomService'],
        { method: 'post', url: 'http://localhost:1234/api/service' },
        done
      );
    });

    it("aseptise la liste des points d'accès ainsi que son contenu", (done) => {
      axios.post('http://localhost:1234/api/service', {})
        .then(() => {
          testeur.middleware().verifieAseptisationListe('pointsAcces', ['description']);
          done();
        })
        .catch(done);
    });

    it('aseptise la liste des fonctionnalités spécifiques ainsi que son contenu', (done) => {
      axios.post('http://localhost:1234/api/service', {})
        .then(() => {
          testeur.middleware().verifieAseptisationListe('fonctionnalitesSpecifiques', ['description']);
          done();
        })
        .catch(done);
    });

    it('aseptise la liste des données sensibles spécifiques ainsi que son contenu', (done) => {
      axios.post('http://localhost:1234/api/service', {})
        .then(() => {
          testeur.middleware().verifieAseptisationListe('donneesSensiblesSpecifiques', ['description']);
          done();
        })
        .catch(done);
    });

    it('retourne une erreur HTTP 422 si les données de description de service sont invalides', (done) => {
      testeur.verifieRequeteGenereErreurHTTP(422, 'Le statut de déploiement "statutInvalide" est invalide', {
        method: 'post',
        url: 'http://localhost:1234/api/service',
        data: { statutDeploiement: 'statutInvalide' },
      }, done);
    });

    it('retourne une erreur HTTP 422 si données insuffisantes pour création service', (done) => {
      testeur.depotDonnees().nouvelleHomologation = () => Promise.reject(new ErreurDonneesObligatoiresManquantes('oups'));

      testeur.verifieRequeteGenereErreurHTTP(422, 'oups', {
        method: 'post',
        url: 'http://localhost:1234/api/service',
        data: {},
      }, done);
    });

    it('retourne une erreur HTTP 422 si le nom du service existe déjà', (done) => {
      testeur.depotDonnees().nouvelleHomologation = () => Promise.reject(new ErreurNomServiceDejaExistant('oups'));

      testeur.verifieRequeteGenereErreurHTTP(422, 'oups', {
        method: 'post',
        url: 'http://localhost:1234/api/service',
        data: { nomService: 'Un nom déjà existant' },
      }, done);
    });

    it("demande au dépôt de données d'enregistrer les nouveaux service", (done) => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      const donneesDescriptionService = uneDescriptionValide(testeur.referentiel())
        .construis()
        .toJSON();

      testeur.depotDonnees().nouvelleHomologation = (idUtilisateur, { descriptionService }) => {
        expect(idUtilisateur).to.equal('123');
        expect(descriptionService).to.eql(donneesDescriptionService);
        return Promise.resolve('456');
      };

      axios.post('http://localhost:1234/api/service', donneesDescriptionService)
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
      testeur.depotDonnees().ajouteDescriptionServiceAHomologation = () => Promise.resolve();
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        { method: 'put', url: 'http://localhost:1234/api/service/456' }, done
      );
    });

    it('aseptise les paramètres', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['nomService'],
        { method: 'put', url: 'http://localhost:1234/api/service/456' },
        done
      );
    });

    it("aseptise la liste des points d'accès ainsi que son contenu", (done) => {
      axios.put('http://localhost:1234/api/service/456', {})
        .then(() => {
          testeur.middleware().verifieAseptisationListe('pointsAcces', ['description']);
          done();
        })
        .catch(done);
    });

    it('aseptise la liste des fonctionnalités spécifiques ainsi que son contenu', (done) => {
      axios.put('http://localhost:1234/api/service/456', {})
        .then(() => {
          testeur.middleware().verifieAseptisationListe('fonctionnalitesSpecifiques', ['description']);
          done();
        })
        .catch(done);
    });

    it('aseptise la liste des données sensibles spécifiques ainsi que son contenu', (done) => {
      axios.put('http://localhost:1234/api/service/456', {})
        .then(() => {
          testeur.middleware().verifieAseptisationListe('donneesSensiblesSpecifiques', ['description']);
          done();
        })
        .catch(done);
    });

    it('demande au dépôt de données de mettre à jour le service', (done) => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      testeur.depotDonnees().ajouteDescriptionServiceAHomologation = (
        (idUtilisateur, idService, infosGenerales) => {
          expect(idUtilisateur).to.equal('123');
          expect(idService).to.equal('456');
          expect(infosGenerales.nomService).to.equal('Nouveau Nom');
          return Promise.resolve();
        }
      );

      axios.put('http://localhost:1234/api/service/456', { nomService: 'Nouveau Nom' })
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idService: '456' });
          done();
        })
        .catch(done);
    });

    it('retourne une erreur HTTP 422 si le validateur du modèle échoue', (done) => {
      testeur.verifieRequeteGenereErreurHTTP(422, 'Le statut de déploiement "statutInvalide" est invalide', {
        method: 'put',
        url: 'http://localhost:1234/api/service/456',
        data: { statutDeploiement: 'statutInvalide' },
      }, done);
    });

    it('retourne une erreur HTTP 422 si la validation des propriétés obligatoires échoue', (done) => {
      testeur.depotDonnees().ajouteDescriptionServiceAHomologation = () => Promise.reject(
        new ErreurNomServiceDejaExistant('oups')
      );

      testeur.verifieRequeteGenereErreurHTTP(422, 'oups', {
        method: 'put',
        url: 'http://localhost:1234/api/service/456',
        data: { nomService: 'service déjà existant' },
      }, done);
    });
  });

  describe('quand requête POST sur `/api/service/:id/mesures', () => {
    beforeEach(() => {
      testeur.depotDonnees().ajouteMesuresAHomologation = () => Promise.resolve();
      testeur.referentiel().recharge({
        categoriesMesures: { uneCategorie: 'Une catégorie' },
        mesures: { identifiantMesure: {} },
        statutsMesures: { fait: 'Fait' },
      });
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService({
        method: 'post',
        url: 'http://localhost:1234/api/service/456/mesures',
      }, done);
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
        { method: 'post', url: 'http://localhost:1234/api/service/456/mesures' },
        done
      );
    });

    it("demande au dépôt d'associer les mesures au service", (done) => {
      let mesuresAjoutees = false;

      testeur.depotDonnees().ajouteMesuresAHomologation = (
        idService,
        [generale],
        specifiques,
      ) => {
        expect(idService).to.equal('456');
        expect(generale.id).to.equal('identifiantMesure');
        expect(generale.statut).to.equal('fait');
        expect(generale.modalites).to.equal("Des modalités d'application");

        expect(specifiques.nombre()).to.equal(1);
        expect(specifiques.item(0).description).to.equal('Une mesure spécifique');

        mesuresAjoutees = true;
        return Promise.resolve();
      };

      axios.post('http://localhost:1234/api/service/456/mesures', {
        mesuresGenerales: {
          identifiantMesure: { statut: 'fait', modalites: "Des modalités d'application" },
        },
        mesuresSpecifiques: [{ description: 'Une mesure spécifique', categorie: 'uneCategorie', statut: 'fait' }],
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
      testeur.depotDonnees().ajouteMesuresAHomologation = (_id, _generales, specifiques) => {
        expect(specifiques.nombre()).to.equal(1);
        mesuresRemplacees = true;
        return Promise.resolve();
      };

      const mesuresSpecifiques = [];
      mesuresSpecifiques[2] = { description: 'Une mesure spécifique', categorie: 'uneCategorie', statut: 'fait' };

      axios.post('http://localhost:1234/api/service/456/mesures', { mesuresSpecifiques })
        .then(() => expect(mesuresRemplacees).to.be(true))
        .then(() => done())
        .catch(done);
    });

    it("filtre les mesures spécifiques qui n'ont pas les propriétés requises", (done) => {
      let mesuresRemplacees = false;
      testeur.depotDonnees().ajouteMesuresAHomologation = (_id, _generales, specifiques) => {
        expect(specifiques.nombre()).to.equal(1);
        mesuresRemplacees = true;
        return Promise.resolve();
      };

      const mesuresSpecifiques = [
        { description: 'Mesure bien renseignée', categorie: 'uneCategorie', statut: 'fait' },
        { categorie: 'uneCategorie', statut: 'fait' },
        { description: 'Mesure sans catégorie', statut: 'fait' },
        { description: 'Mesure sans statut', categorie: 'uneCategorie' },
        { modalites: 'Modalités' },
      ];

      axios.post('http://localhost:1234/api/service/456/mesures', { mesuresSpecifiques })
        .then(() => expect(mesuresRemplacees).to.be(true))
        .then(() => done())
        .catch(done);
    });

    it('retourne une erreur HTTP 422 si les données sont invalides', (done) => {
      testeur.verifieRequeteGenereErreurHTTP(422, 'Données invalides', {
        method: 'post',
        url: 'http://localhost:1234/api/service/456/mesures',
        data: { mesuresGenerales: { identifiantInvalide: { statut: 'statutInvalide' } } },
      }, done);
    });
  });

  describe('quand requête POST sur `/api/service/:id/rolesResponsabilites`', () => {
    beforeEach(() => {
      testeur.depotDonnees().ajouteRolesResponsabilitesAHomologation = () => Promise.resolve();
      testeur.depotDonnees().ajouteEntitesExternesAHomologation = () => Promise.resolve();
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService({
        method: 'post',
        url: 'http://localhost:1234/api/service/456/rolesResponsabilites',
      }, done);
    });

    it("demande au dépôt d'associer les rôles et responsabilités au service", (done) => {
      let rolesResponsabilitesAjoutees = false;

      testeur.depotDonnees().ajouteRolesResponsabilitesAHomologation = (idService, role) => {
        expect(idService).to.equal('456');
        expect(role.autoriteHomologation).to.equal('Jean Dupont');
        rolesResponsabilitesAjoutees = true;
        return Promise.resolve();
      };

      axios.post('http://localhost:1234/api/service/456/rolesResponsabilites', {
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
      axios.post('http://localhost:1234/api/service/456/rolesResponsabilites', {})
        .then(() => {
          testeur.middleware().verifieAseptisationListe('acteursHomologation', ['role', 'nom', 'fonction']);
          done();
        })
        .catch(done);
    });

    it('aseptise la liste des parties prenantes ainsi que son contenu', (done) => {
      axios.post('http://localhost:1234/api/service/456/rolesResponsabilites', {})
        .then(() => {
          testeur.middleware().verifieAseptisationListe('partiesPrenantes', ['nom', 'natureAcces', 'pointContact']);
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête POST sur `/api/service/:id/risques`', () => {
    beforeEach(() => {
      testeur.depotDonnees().remplaceRisquesSpecifiquesPourHomologation = () => Promise.resolve();
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService({
        method: 'post',
        url: 'http://localhost:1234/api/service/456/risques',
      }, done);
    });

    it('aseptise les paramètres de la requête', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        [
          '*',
          'risquesSpecifiques.*.description',
          'risquesSpecifiques.*.niveauGravite',
          'risquesSpecifiques.*.commentaire',
        ],
        { method: 'post', url: 'http://localhost:1234/api/service/456/risques' },
        done
      );
    });

    it("demande au dépôt d'associer les risques généraux au service", (done) => {
      testeur.referentiel().recharge({
        risques: { unRisque: {} },
        niveauxGravite: { unNiveau: {} },
      });
      let risqueAjoute = false;

      testeur.depotDonnees().ajouteRisqueGeneralAHomologation = (idService, risque) => {
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

      axios.post('http://localhost:1234/api/service/456/risques', {
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
        idService, risques
      ) => {
        expect(idService).to.equal('456');
        expect(risques.nombre()).to.equal(1);
        expect(risques.item(0).description).to.equal('Un risque spécifique');
        expect(risques.item(0).commentaire).to.equal('Un commentaire');
        risquesRemplaces = true;
        return Promise.resolve();
      };

      axios.post('http://localhost:1234/api/service/456/risques', {
        risquesSpecifiques: [{ description: 'Un risque spécifique', commentaire: 'Un commentaire' }],
      })
        .then(() => expect(risquesRemplaces).to.be(true))
        .then(() => done())
        .catch(done);
    });

    it('filtre les risques spécifiques vides', (done) => {
      testeur.referentiel().recharge({ niveauxGravite: { unNiveau: {} } });

      let risquesRemplaces = false;
      testeur.depotDonnees().remplaceRisquesSpecifiquesPourHomologation = (_, risques) => {
        expect(risques.nombre()).to.equal(2);
        risquesRemplaces = true;
        return Promise.resolve();
      };

      const risquesSpecifiques = [];
      risquesSpecifiques[2] = { description: 'Un risque spécifique' };
      risquesSpecifiques[5] = { niveauGravite: 'unNiveau' };

      axios.post('http://localhost:1234/api/service/456/risques', { risquesSpecifiques })
        .then(() => expect(risquesRemplaces).to.be(true))
        .then(() => done())
        .catch(done);
    });

    it('retourne une erreur HTTP 422 si les données sont invalides', (done) => {
      testeur.verifieRequeteGenereErreurHTTP(422, 'Données invalides', {
        method: 'post',
        url: 'http://localhost:1234/api/service/456/risques',
        data: { 'commentaire-unRisqueInvalide': 'Un commentaire' },
      }, done);
    });
  });

  describe('quand requête POST sur `/api/service/:id/avisExpertCyber`', () => {
    beforeEach(() => (
      testeur.depotDonnees().ajouteAvisExpertCyberAHomologation = () => Promise.resolve()
    ));

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService({
        method: 'post',
        url: 'http://localhost:1234/api/service/456/avisExpertCyber',
      }, done);
    });

    it("demande au dépôt d'associer l'avis d'expert au service", (done) => {
      let avisAjoute = false;

      testeur.depotDonnees().ajouteAvisExpertCyberAHomologation = (idService, avis) => {
        expect(idService).to.equal('456');
        expect(avis.commentaire).to.equal('Un commentaire');
        avisAjoute = true;
        return Promise.resolve();
      };

      axios.post('http://localhost:1234/api/service/456/avisExpertCyber', {
        commentaire: 'Un commentaire',
      })
        .then((reponse) => {
          expect(avisAjoute).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idService: '456' });
          done();
        })
        .catch(done);
    });

    it('retourne une erreur HTTP 422 si les données sont invalides', (done) => {
      testeur.verifieRequeteGenereErreurHTTP(422, 'Données invalides', {
        method: 'post',
        url: 'http://localhost:1234/api/service/456/avisExpertCyber',
        data: { avis: 'avisInvalide' },
      }, done);
    });
  });

  describe('quand requête PUT sur `/api/service/:id/dossier`', () => {
    beforeEach(() => {
      testeur.depotDonnees().metsAJourDossierCourant = () => Promise.resolve();
      testeur.referentiel().recharge({ echeancesRenouvellement: { unAn: {} } });
    });

    it('aseptise les paramètres', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['dateHomologation', 'dureeValidite'],
        { method: 'put', url: 'http://localhost:1234/api/service/456/dossier' },
        done
      );
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService({
        method: 'put',
        url: 'http://localhost:1234/api/service/456/dossier',
      }, done);
    });

    it('demande au dépôt de persister les données du dossier', (done) => {
      let dossierSauve = false;
      testeur.depotDonnees().metsAJourDossierCourant = (idService, dossier) => {
        try {
          expect(idService).to.equal('456');
          expect(dossier.decision.dateHomologation).to.equal('2022-12-01');
          expect(dossier.decision.dureeValidite).to.equal('unAn');
          dossierSauve = true;

          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios.put('http://localhost:1234/api/service/456/dossier', {
        dateHomologation: '2022-12-01',
        dureeValidite: 'unAn',
      })
        .then((reponse) => {
          expect(dossierSauve).to.be(true);
          expect(reponse.data).to.eql({ idService: '456' });
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("retourne une erreur HTTP 422 s'il manque la date d'homologation", (done) => {
      testeur.verifieRequeteGenereErreurHTTP(422, "Date d'homologation manquante", {
        method: 'put',
        url: 'http://localhost:1234/api/service/456/dossier',
        data: { dureeValidite: 'unAn' },
      }, done);
    });

    it("retourne une erreur HTTP 422 s'il manque la durée de validité", (done) => {
      testeur.verifieRequeteGenereErreurHTTP(422, 'Durée de validité manquante', {
        method: 'put',
        url: 'http://localhost:1234/api/service/456/dossier',
        data: { dateHomologation: '2022-12-01' },
      }, done);
    });

    it('finalise le dossier si le paramètre est présent dans la requête', (done) => {
      let dossierFinalise = false;
      testeur.depotDonnees().metsAJourDossierCourant = (idService) => {
        try {
          expect(idService).to.equal('456');
          dossierFinalise = true;

          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios.put('http://localhost:1234/api/service/456/dossier', { finalise: true })
        .then((reponse) => {
          expect(dossierFinalise).to.be(true);
          expect(reponse.data).to.eql({ idService: '456' });
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });
  });

  describe('quand requête PUT sur /api/service/:id/dossier/autorite', () => {
    beforeEach(() => {
      const homologationAvecDossier = new Homologation({ id: '456', descriptionService: { nomService: 'un service' }, dossiers: [{ id: '999' }] });
      testeur.middleware().reinitialise({ homologationARenvoyer: homologationAvecDossier });
      testeur.depotDonnees().metsAJourDossierCourant = () => Promise.resolve();
    });

    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheService(
        { url: 'http://localhost:1234/api/service/456/dossier/autorite', method: 'put' },
        done,
      );
    });

    it('aseptise les paramètres reçus', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['nom', 'fonction'],
        { url: 'http://localhost:1234/api/service/456/dossier/autorite', method: 'put' },
        done
      );
    });

    it("utilise le dépôt pour enregistrer l'autorité d'homologation", (done) => {
      let depotAppele = false;

      testeur.depotDonnees().metsAJourDossierCourant = (idHomologation, dossier) => {
        depotAppele = true;
        expect(idHomologation).to.equal('456');
        expect(dossier.autorite.nom).to.equal('Jean Dupond');
        expect(dossier.autorite.fonction).to.equal('RSSI');
        return Promise.resolve();
      };

      axios.put('http://localhost:1234/api/service/456/dossier/autorite', { nom: 'Jean Dupond', fonction: 'RSSI' })
        .then(() => expect(depotAppele).to.be(true))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });

    it("reste robuste lorsque l'homologation n'a pas de dossier courant", (done) => {
      const homologationSansDossier = new Homologation({ id: '456', descriptionService: { nomService: 'un service' } });
      testeur.middleware().reinitialise({ homologationARenvoyer: homologationSansDossier });

      axios.put('http://localhost:1234/api/service/456/dossier/autorite')
        .catch(({ response }) => {
          expect(response.status).to.be(404);
          expect(response.data).to.equal('Homologation sans dossier courant');
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête PUT sur `/api/service/:id/dossier/document/:idDocument', () => {
    beforeEach(() => {
      const homologationAvecDossier = new Homologation({ id: '456', descriptionService: { nomService: 'un service' }, dossiers: [{ id: '999' }] });
      testeur.middleware().reinitialise({ homologationARenvoyer: homologationAvecDossier });
      testeur.depotDonnees().metsAJourDossierCourant = () => Promise.resolve();
      testeur.referentiel().recharge({ documentsHomologation: { decision: {} } });
    });

    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheService(
        { url: 'http://localhost:1234/api/service/456/dossier/document/decision', method: 'put' },
        done,
      );
    });

    it('utilise le dépôt pour enregistrer la date du téléchargement', (done) => {
      let depotAppele = false;
      const maintenant = new Date('2023-02-21');

      testeur.adaptateurHorloge().maintenant = () => maintenant;

      testeur.depotDonnees().metsAJourDossierCourant = (idHomologation, dossier) => {
        depotAppele = true;
        expect(idHomologation).to.equal('456');
        expect(dossier.datesTelechargements.decision).to.equal(maintenant);
        return Promise.resolve();
      };

      axios.put('http://localhost:1234/api/service/456/dossier/document/decision')
        .then(() => expect(depotAppele).to.be(true))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });

    it("reste robuste lorsque l'homologation n'a pas de dossier courant", (done) => {
      const homologationSansDossier = new Homologation({ id: '456', descriptionService: { nomService: 'un service' } });
      testeur.middleware().reinitialise({ homologationARenvoyer: homologationSansDossier });

      axios.put('http://localhost:1234/api/service/456/dossier/document/decision')
        .catch(({ response }) => {
          expect(response.status).to.be(404);
          expect(response.data).to.equal('Homologation sans dossier courant');
          done();
        })
        .catch(done);
    });

    it("reste robuste si l'id de document ne correspond pas à un document connu", (done) => {
      axios.put('http://localhost:1234/api/service/456/dossier/document/mauvaisId')
        .catch(({ response }) => {
          expect(response.status).to.be(422);
          expect(response.data).to.equal('Identifiant de document invalide');
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête PUT sur /api/service/:id/dossier/avis', () => {
    beforeEach(() => {
      const homologationAvecDossier = new Homologation({ id: '456', descriptionService: { nomService: 'un service' }, dossiers: [{ id: '999' }] }, testeur.referentiel());
      testeur.middleware().reinitialise({ homologationARenvoyer: homologationAvecDossier });
      testeur.depotDonnees().metsAJourDossierCourant = () => Promise.resolve();
      testeur.referentiel().recharge({
        echeancesRenouvellement: { unAn: {} },
        statutAvisDossierHomologation: { favorable: {} },
      });
    });

    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheService(
        { url: 'http://localhost:1234/api/service/456/dossier/avis', method: 'put' },
        done,
      );
    });

    it('aseptise la liste des avis', (done) => {
      axios.put('http://localhost:1234/api/service/456/dossier/avis', { avis: [] })
        .then(() => {
          testeur.middleware().verifieAseptisationListe('avis', ['statut', 'dureeValidite', 'commentaires']);
          done();
        })
        .catch(done);
    });

    it('aseptise les collaborateurs mentionnés dans les avis', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['avis.*.collaborateurs.*'], { url: 'http://localhost:1234/api/service/456/dossier/avis', method: 'put' }, done
      );
    });

    it("renvoie une 400 si aucun avis n'est envoyé", (done) => {
      axios.put('http://localhost:1234/api/service/456/dossier/avis', {})
        .then(() => {
          done('Une erreur aurait du être renvoyée');
        })
        .catch((e) => {
          expect(e.response.status).to.be(400);
          done();
        })
        .catch(done);
    });

    it('utilise le dépôt pour enregistrer les avis', (done) => {
      let depotAppele = false;
      testeur.depotDonnees().metsAJourDossierCourant = (idHomologation, dossier) => {
        depotAppele = true;
        expect(idHomologation).to.equal('456');
        expect(dossier.avis.avis.length).to.equal(1);
        expect(dossier.avis.avis[0].donneesSerialisees()).to.eql({ collaborateurs: ['Jean Dupond'], statut: 'favorable', dureeValidite: 'unAn', commentaires: 'Ok' });
        return Promise.resolve();
      };

      axios.put('http://localhost:1234/api/service/456/dossier/avis', { avis: [{ collaborateurs: ['Jean Dupond'], statut: 'favorable', dureeValidite: 'unAn', commentaires: 'Ok' }] })
        .then(() => expect(depotAppele).to.be(true))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });

    it("reste robuste lorsque l'homologation n'a pas de dossier courant", (done) => {
      const homologationSansDossier = new Homologation({ id: '456', descriptionService: { nomService: 'un service' } });
      testeur.middleware().reinitialise({ homologationARenvoyer: homologationSansDossier });

      axios.put('http://localhost:1234/api/service/456/dossier/avis', { avis: [] })
        .catch(({ response }) => {
          expect(response.status).to.be(404);
          expect(response.data).to.equal('Homologation sans dossier courant');
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête DELETE sur `/api/service/:id/autorisationContributeur`', () => {
    beforeEach(() => {
      testeur.depotDonnees().autorisationPour = () => Promise.resolve(new AutorisationCreateur());
      testeur.depotDonnees().supprimeContributeur = () => Promise.resolve();
    });

    it('vérifie que les CGU sont acceptées', (done) => {
      testeur.middleware().verifieRequeteExigeAcceptationCGU({
        method: 'delete',
        url: 'http://localhost:1234/api/service/123/autorisationContributeur',
      }, done);
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

      axios.delete('http://localhost:1234/api/service/123/autorisationContributeur')
        .then(() => expect(autorisationVerifiee).to.be(true))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });

    it("retourne une erreur HTTP 403 si l'utilisateur courant n'a pas accès au service", (done) => {
      const autorisationNonTrouvee = undefined;
      testeur.depotDonnees().autorisationPour = () => Promise.resolve(autorisationNonTrouvee);

      testeur.verifieRequeteGenereErreurHTTP(403, 'Droits insuffisants pour supprimer un collaborateur du service "123"', {
        method: 'delete',
        url: 'http://localhost:1234/api/service/123/autorisationContributeur',
      }, done);
    });

    it("retourne une erreur HTTP 403 si l'utilisateur courant est simple contributeur du service", (done) => {
      testeur.depotDonnees().autorisationPour = () => Promise.resolve(
        new AutorisationContributeur()
      );

      testeur.verifieRequeteGenereErreurHTTP(403, 'Droits insuffisants pour supprimer un collaborateur du service "123"', {
        method: 'delete',
        url: 'http://localhost:1234/api/service/123/autorisationContributeur',
      }, done);
    });

    it("demande au dépôt de supprimer l'accès au service pour le contributeur", (done) => {
      let contributeurSupprime = false;

      testeur.depotDonnees().supprimeContributeur = (idContributeur, idService) => {
        try {
          expect(idContributeur).to.equal('000');
          expect(idService).to.equal('123');
          contributeurSupprime = true;

          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios({
        method: 'delete',
        url: 'http://localhost:1234/api/service/123/autorisationContributeur',
        data: { idContributeur: '000' },
      })
        .then((reponse) => {
          expect(contributeurSupprime).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.equal("Contributeur \"000\" supprimé pour l'homologation \"123\"");
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it('retourne une erreur HTTP 422 si le dépôt a levé une `ErreurModele`', (done) => {
      testeur.depotDonnees().supprimeContributeur = () => Promise.reject(new ErreurModele('Données invalides'));

      testeur.verifieRequeteGenereErreurHTTP(422, 'Données invalides', {
        method: 'delete',
        url: 'http://localhost:1234/api/service/123/autorisationContributeur',
      }, done);
    });
  });

  describe('quand requête DELETE sur `/api/service/:id`', () => {
    beforeEach(() => {
      testeur.depotDonnees().autorisationPour = () => Promise.resolve(new AutorisationCreateur());
      testeur.depotDonnees().supprimeHomologation = () => Promise.resolve();
    });

    it('vérifie que les CGU sont acceptées', (done) => {
      testeur.middleware().verifieRequeteExigeAcceptationCGU({
        method: 'delete',
        url: 'http://localhost:1234/api/service/123',
      }, done);
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

      axios.delete('http://localhost:1234/api/service/123')
        .then(() => expect(autorisationVerifiee).to.be(true))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });

    it("retourne une erreur HTTP 403 si l'utilisateur courant n'a pas accès au service", (done) => {
      const autorisationNonTrouvee = undefined;
      testeur.depotDonnees().autorisationPour = () => Promise.resolve(autorisationNonTrouvee);

      testeur.verifieRequeteGenereErreurHTTP(403, 'Droits insuffisants pour supprimer le service', {
        method: 'delete',
        url: 'http://localhost:1234/api/service/123',
      }, done);
    });

    it("retourne une erreur HTTP 403 si l'utilisateur courant n'a pas les droits de suppression du service", (done) => {
      testeur.depotDonnees().autorisationPour = () => Promise.resolve(
        new AutorisationContributeur()
      );

      testeur.verifieRequeteGenereErreurHTTP(403, 'Droits insuffisants pour supprimer le service', {
        method: 'delete',
        url: 'http://localhost:1234/api/service/123',
      }, done);
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
      testeur.depotDonnees().autorisationPour = () => Promise.resolve(new AutorisationCreateur());
    });

    it('vérifie que les CGU sont acceptées', (done) => {
      testeur.middleware().verifieRequeteExigeAcceptationCGU({
        method: 'copy',
        url: 'http://localhost:1234/api/service/123',
      }, done);
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
      testeur.depotDonnees().autorisationPour = () => Promise.resolve(autorisationNonTrouvee);

      testeur.verifieRequeteGenereErreurHTTP(403, 'Droits insuffisants pour dupliquer le service', {
        method: 'copy',
        url: 'http://localhost:1234/api/service/123',
      }, done);
    });

    it("retourne une erreur HTTP 403 si l'utilisateur courant n'est pas le créateur du service", (done) => {
      testeur.depotDonnees().autorisationPour = () => Promise.resolve(
        new AutorisationContributeur()
      );

      testeur.verifieRequeteGenereErreurHTTP(403, 'Droits insuffisants pour dupliquer le service', {
        method: 'copy',
        url: 'http://localhost:1234/api/service/123',
      }, done);
    });

    it('retourne une erreur HTTP 424 si des données obligatoires ne sont pas renseignées', (done) => {
      testeur.depotDonnees().dupliqueHomologation = () => Promise.reject(
        new ErreurDonneesObligatoiresManquantes('Certaines données obligatoires ne sont pas renseignées')
      );

      testeur.verifieRequeteGenereErreurHTTP(424, {
        type: 'DONNEES_OBLIGATOIRES_MANQUANTES',
        message: 'La duplication a échoué car certaines données obligatoires ne sont pas renseignées',
      }, {
        method: 'copy',
        url: 'http://localhost:1234/api/service/123',
      }, done);
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
});
