const axios = require('axios');
const expect = require('expect.js');

const DepotDonnees = require('../../src/depotDonnees');
const { ErreurNomServiceManquant, ErreurNomServiceDejaExistant } = require('../../src/erreurs');
const MSS = require('../../src/mss');
const Referentiel = require('../../src/referentiel');

const middleware = require('../mocks/middleware');

const verifieRequeteGenereErreurHTTP = (status, messageErreur, requete, suite) => {
  axios(requete)
    .then(() => suite('Réponse OK inattendue'))
    .catch((erreur) => {
      expect(erreur.response.status).to.equal(status);
      expect(erreur.response.data).to.equal(messageErreur);
      suite();
    })
    .catch(suite);
};

describe('Le serveur MSS des routes /api/homologation/*', () => {
  let depotDonnees;
  let referentiel;
  let serveur;

  beforeEach((done) => {
    middleware.reinitialise();
    referentiel = Referentiel.creeReferentielVide();
    DepotDonnees.creeDepotVide()
      .then((depot) => {
        depotDonnees = depot;
        serveur = MSS.creeServeur(depotDonnees, middleware, referentiel, {}, false);
        serveur.ecoute(1234, done);
      });
  });

  afterEach(() => { serveur.arreteEcoute(); });

  describe('quand requête POST sur `/api/homologation`', () => {
    beforeEach(() => {
      depotDonnees.nouvelleHomologation = () => Promise.resolve();
    });

    it("vérifie que l'utilisateur est authentifié", (done) => {
      middleware.verifieRequeteExigeAcceptationCGU(
        { method: 'post', url: 'http://localhost:1234/api/homologation' }, done
      );
    });

    it('aseptise les paramètres', (done) => {
      middleware.verifieAseptisationParametres(
        ['nomService'],
        { method: 'post', url: 'http://localhost:1234/api/homologation' },
        done
      );
    });

    it("aseptise la liste des points d'accès ainsi que son contenu", (done) => {
      axios.post('http://localhost:1234/api/homologation', {})
        .then(() => {
          middleware.verifieAseptisationListe('pointsAcces', ['description']);
          done();
        })
        .catch(done);
    });

    it('aseptise la liste des fonctionnalités spécifiques ainsi que son contenu', (done) => {
      axios.post('http://localhost:1234/api/homologation', {})
        .then(() => {
          middleware.verifieAseptisationListe('fonctionnalitesSpecifiques', ['description']);
          done();
        })
        .catch(done);
    });

    it('aseptise la liste des données sensibles spécifiques ainsi que son contenu', (done) => {
      axios.post('http://localhost:1234/api/homologation', {})
        .then(() => {
          middleware.verifieAseptisationListe('donneesSensiblesSpecifiques', ['description']);
          done();
        })
        .catch(done);
    });

    it('retourne une erreur HTTP 422 si données insuffisantes pour création homologation', (done) => {
      depotDonnees.nouvelleHomologation = () => Promise.reject(new ErreurNomServiceManquant('oups'));

      verifieRequeteGenereErreurHTTP(422, 'oups', {
        method: 'post',
        url: 'http://localhost:1234/api/homologation',
        data: {},
      }, done);
    });

    it('retourne une erreur HTTP 422 si le nom du service existe déjà', (done) => {
      depotDonnees.nouvelleHomologation = () => Promise.reject(new ErreurNomServiceDejaExistant('oups'));

      verifieRequeteGenereErreurHTTP(422, 'oups', {
        method: 'post',
        url: 'http://localhost:1234/api/homologation',
        data: { nomService: 'Un nom déjà existant' },
      }, done);
    });

    it("demande au dépôt de données d'enregistrer les nouvelles homologations", (done) => {
      middleware.reinitialise('123');

      depotDonnees.nouvelleHomologation = (idUtilisateur, donneesHomologation) => {
        expect(idUtilisateur).to.equal('123');
        expect(donneesHomologation).to.eql({
          nomService: 'Super Service',
          typeService: undefined,
          provenanceService: undefined,
          fonctionnalites: undefined,
          fonctionnalitesSpecifiques: undefined,
          donneesCaracterePersonnel: undefined,
          donneesSensiblesSpecifiques: undefined,
          delaiAvantImpactCritique: undefined,
          localisationDonnees: undefined,
          presenceResponsable: undefined,
          presentation: undefined,
          pointsAcces: undefined,
          statutDeploiement: undefined,
        });
        return Promise.resolve('456');
      };

      axios.post('http://localhost:1234/api/homologation', { nomService: 'Super Service' })
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idHomologation: '456' });
          done();
        })
        .catch(done);
    });
  });
  describe('quand requête PUT sur `/api/homologation/:id`', () => {
    beforeEach(() => {
      depotDonnees.ajouteDescriptionServiceAHomologation = () => Promise.resolve();
    });

    it("recherche l'homologation correspondante", (done) => {
      middleware.verifieRechercheHomologation(
        { method: 'put', url: 'http://localhost:1234/api/homologation/456' }, done
      );
    });

    it('aseptise les paramètres', (done) => {
      middleware.verifieAseptisationParametres(
        ['nomService'],
        { method: 'put', url: 'http://localhost:1234/api/homologation/456' },
        done
      );
    });

    it("aseptise la liste des points d'accès ainsi que son contenu", (done) => {
      axios.put('http://localhost:1234/api/homologation/456', {})
        .then(() => {
          middleware.verifieAseptisationListe('pointsAcces', ['description']);
          done();
        })
        .catch(done);
    });

    it('aseptise la liste des fonctionnalités spécifiques ainsi que son contenu', (done) => {
      axios.put('http://localhost:1234/api/homologation/456', {})
        .then(() => {
          middleware.verifieAseptisationListe('fonctionnalitesSpecifiques', ['description']);
          done();
        })
        .catch(done);
    });

    it('aseptise la liste des données sensibles spécifiques ainsi que son contenu', (done) => {
      axios.put('http://localhost:1234/api/homologation/456', {})
        .then(() => {
          middleware.verifieAseptisationListe('donneesSensiblesSpecifiques', ['description']);
          done();
        })
        .catch(done);
    });

    it("demande au dépôt de données de mettre à jour l'homologation", (done) => {
      middleware.reinitialise('123');

      depotDonnees.ajouteDescriptionServiceAHomologation = (
        (idUtilisateur, idHomologation, infosGenerales) => {
          expect(idUtilisateur).to.equal('123');
          expect(idHomologation).to.equal('456');
          expect(infosGenerales.nomService).to.equal('Nouveau Nom');
          return Promise.resolve();
        }
      );

      axios.put('http://localhost:1234/api/homologation/456', { nomService: 'Nouveau Nom' })
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idHomologation: '456' });
          done();
        })
        .catch(done);
    });

    it('retourne une erreur HTTP 422 si la validation des données échoue', (done) => {
      depotDonnees.ajouteDescriptionServiceAHomologation = () => Promise.reject(
        new ErreurNomServiceDejaExistant('oups')
      );

      verifieRequeteGenereErreurHTTP(422, 'oups', {
        method: 'put',
        url: 'http://localhost:1234/api/homologation/456',
        data: { nomService: 'service déjà existant' },
      }, done);
    });
  });

  describe('quand requête POST sur `/api/homologation/:id/caracteristiquesComplementaires', () => {
    beforeEach(() => {
      depotDonnees.ajouteCaracteristiquesAHomologation = () => Promise.resolve();
      depotDonnees.ajouteHebergementAHomologation = () => Promise.resolve();
      depotDonnees.ajouteDeveloppementFournitureAHomologation = () => Promise.resolve();
    });

    it("recherche l'homologation correspondante", (done) => {
      middleware.verifieRechercheHomologation({
        method: 'post',
        url: 'http://localhost:1234/api/homologation/456/caracteristiquesComplementaires',
      }, done);
    });

    it('aseptise les paramètres entités externes', (done) => {
      middleware.verifieAseptisationParametres(
        ['entitesExternes.*.nom', 'entitesExternes.*.contact', 'entitesExternes.*.acces'],
        {
          method: 'post',
          url: 'http://localhost:1234/api/homologation/456/caracteristiquesComplementaires',
        },
        done
      );
    });

    it("demande au dépôt d'associer les caractéristiques à l'homologation", (done) => {
      let caracteristiquesAjoutees = false;

      depotDonnees.ajouteCaracteristiquesAHomologation = (
        (idHomologation, caracteristiques) => new Promise((resolve) => {
          expect(idHomologation).to.equal('456');
          expect(caracteristiques.hebergeur).to.equal('Un hébergeur');
          caracteristiquesAjoutees = true;
          resolve();
        })
      );

      axios.post('http://localhost:1234/api/homologation/456/caracteristiquesComplementaires', {
        hebergeur: 'Un hébergeur',
      })
        .then((reponse) => {
          expect(caracteristiquesAjoutees).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idHomologation: '456' });
          done();
        })
        .catch(done);
    });

    it("demande au dépôt d'ajouter la structure ayant développé dans les parties prenantes", (done) => {
      let structureDeveloppementAjoutee = false;

      depotDonnees.ajouteDeveloppementFournitureAHomologation = (
        (idHomologation, structureDeveloppement) => new Promise((resolve) => {
          expect(idHomologation).to.equal('456');
          expect(structureDeveloppement).to.equal('Une structure');
          structureDeveloppementAjoutee = true;
          resolve();
        })
      );

      axios.post('http://localhost:1234/api/homologation/456/caracteristiquesComplementaires', {
        structureDeveloppement: 'Une structure',
      })
        .then((reponse) => {
          expect(structureDeveloppementAjoutee).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idHomologation: '456' });
          done();
        })
        .catch(done);
    });

    it('filtre les entités externes vides', (done) => {
      depotDonnees.ajouteCaracteristiquesAHomologation = (_, caracteristiques) => (
        new Promise((resolve) => {
          expect(caracteristiques.entitesExternes.nombre()).to.equal(1);
          resolve();
        })
      );

      const entitesExternes = [];
      entitesExternes[2] = { nom: 'Une entité', acces: 'Accès administrateur' };

      axios.post(
        'http://localhost:1234/api/homologation/456/caracteristiquesComplementaires',
        { entitesExternes },
      )
        .then(() => done())
        .catch(done);
    });
  });

  describe('quand requête POST sur `/api/homologation/:id/mesures', () => {
    beforeEach(() => (
      depotDonnees.remplaceMesuresSpecifiquesPourHomologation = () => Promise.resolve()
    ));

    it("recherche l'homologation correspondante", (done) => {
      middleware.verifieRechercheHomologation({
        method: 'post',
        url: 'http://localhost:1234/api/homologation/456/mesures',
      }, done);
    });

    it('aseptise tous les paramètres de la requête', (done) => {
      middleware.verifieAseptisationParametres(
        [
          '*',
          'mesuresSpecifiques.*.description',
          'mesuresSpecifiques.*.categorie',
          'mesuresSpecifiques.*.statut',
          'mesuresSpecifiques.*.modalites',
        ],
        { method: 'post', url: 'http://localhost:1234/api/homologation/456/mesures' },
        done
      );
    });

    it("demande au dépôt d'associer les mesures générales à l'homologation", (done) => {
      referentiel.recharge({ mesures: { identifiantMesure: {} } });
      let mesureAjoutee = false;

      depotDonnees.ajouteMesureGeneraleAHomologation = (idHomologation, mesure) => {
        expect(idHomologation).to.equal('456');
        expect(mesure.id).to.equal('identifiantMesure');
        expect(mesure.statut).to.equal('fait');
        expect(mesure.modalites).to.equal("Des modalités d'application");
        mesureAjoutee = true;
        return Promise.resolve();
      };

      axios.post('http://localhost:1234/api/homologation/456/mesures', {
        identifiantMesure: 'fait',
        'modalites-identifiantMesure': "Des modalités d'application",
      })
        .then((reponse) => {
          expect(mesureAjoutee).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idHomologation: '456' });
          done();
        })
        .catch(done);
    });

    it("demande au dépôt d'associer les mesures spécifiques à l'homologation", (done) => {
      let mesuresRemplacees = false;
      depotDonnees.remplaceMesuresSpecifiquesPourHomologation = (idHomologation, mesures) => {
        expect(idHomologation).to.equal('456');
        expect(mesures.nombre()).to.equal(1);
        expect(mesures.item(0).description).to.equal('Une mesure spécifique');
        mesuresRemplacees = true;
        return Promise.resolve();
      };

      referentiel.recharge({ categoriesMesures: { uneCategorie: 'Une catégorie' } });
      axios.post('http://localhost:1234/api/homologation/456/mesures', {
        mesuresSpecifiques: [{ description: 'Une mesure spécifique', categorie: 'uneCategorie' }],
      })
        .then(() => expect(mesuresRemplacees).to.be(true))
        .then(() => done())
        .catch(done);
    });

    it('filtre les mesures spécifiques vides', (done) => {
      let mesuresRemplacees = false;
      depotDonnees.remplaceMesuresSpecifiquesPourHomologation = (_, mesures) => {
        expect(mesures.nombre()).to.equal(1);
        mesuresRemplacees = true;
        return Promise.resolve();
      };

      const mesuresSpecifiques = [];
      mesuresSpecifiques[2] = { description: 'Une mesure spécifique' };

      axios.post('http://localhost:1234/api/homologation/456/mesures', { mesuresSpecifiques })
        .then(() => expect(mesuresRemplacees).to.be(true))
        .then(() => done())
        .catch(done);
    });

    it('retourne une erreur HTTP 422 si les données sont invalides', (done) => {
      verifieRequeteGenereErreurHTTP(422, 'Données invalides', {
        method: 'post',
        url: 'http://localhost:1234/api/homologation/456/mesures',
        data: { identifiantInvalide: 'statutInvalide' },
      }, done);
    });
  });

  describe('quand requête POST sur `/api/homologation/:id/partiesPrenantes`', () => {
    beforeEach(() => {
      depotDonnees.ajoutePartiesPrenantesAHomologation = () => new Promise((resolve) => resolve());
      depotDonnees.ajouteHebergementAHomologation = () => new Promise((resolve) => resolve());
    });

    it("recherche l'homologation correspondante", (done) => {
      middleware.verifieRechercheHomologation({
        method: 'post',
        url: 'http://localhost:1234/api/homologation/456/partiesPrenantes',
      }, done);
    });

    it("demande au dépôt d'associer les parties prenantes à l'homologation", (done) => {
      let partiesPrenantesAjoutees = false;

      depotDonnees.ajoutePartiesPrenantesAHomologation = (idHomologation, pp) => new Promise(
        (resolve) => {
          expect(idHomologation).to.equal('456');
          expect(pp.autoriteHomologation).to.equal('Jean Dupont');
          partiesPrenantesAjoutees = true;
          resolve();
        }
      );

      axios.post('http://localhost:1234/api/homologation/456/partiesPrenantes', {
        autoriteHomologation: 'Jean Dupont',
      })
        .then((reponse) => {
          expect(partiesPrenantesAjoutees).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idHomologation: '456' });
          done();
        })
        .catch(done);
    });

    it("aseptise la liste des acteurs de l'homologation ainsi que son contenu", (done) => {
      axios.post('http://localhost:1234/api/homologation/456/partiesPrenantes', {})
        .then(() => {
          middleware.verifieAseptisationListe('acteursHomologation', ['role', 'nom', 'fonction']);
          done();
        })
        .catch(done);
    });

    it("demande au dépôt d'ajouter l'hébergement dans les caractéristiques complémentaires", (done) => {
      let hebergeurAjoute = false;

      depotDonnees.ajouteHebergementAHomologation = (
        (idHomologation, nomHebergeur) => new Promise((resolve) => {
          expect(idHomologation).to.equal('456');
          expect(nomHebergeur).to.equal('Un hébergeur');
          hebergeurAjoute = true;
          resolve();
        })
      );

      axios.post('http://localhost:1234/api/homologation/456/partiesPrenantes', {
        partiesPrenantes: [{ type: 'Hebergement', nom: 'Un hébergeur' }],
      })
        .then((reponse) => {
          expect(hebergeurAjoute).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idHomologation: '456' });
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête POST sur `/api/homologation/:id/risques`', () => {
    beforeEach(() => {
      depotDonnees.remplaceRisquesSpecifiquesPourHomologation = () => Promise.resolve();
    });

    it("recherche l'homologation correspondante", (done) => {
      middleware.verifieRechercheHomologation({
        method: 'post',
        url: 'http://localhost:1234/api/homologation/456/risques',
      }, done);
    });

    it('aseptise les paramètres de la requête', (done) => {
      middleware.verifieAseptisationParametres(
        [
          '*',
          'risquesSpecifiques.*.description',
          'risquesSpecifiques.*.niveauGravite',
          'risquesSpecifiques.*.commentaire',
        ],
        { method: 'post', url: 'http://localhost:1234/api/homologation/456/risques' },
        done
      );
    });

    it("demande au dépôt d'associer les risques généraux à l'homologation", (done) => {
      referentiel.recharge({ risques: { unRisque: {} }, niveauxGravite: { unNiveau: {} } });
      let risqueAjoute = false;

      depotDonnees.ajouteRisqueGeneralAHomologation = (idHomologation, risque) => {
        try {
          expect(idHomologation).to.equal('456');
          expect(risque.id).to.equal('unRisque');
          expect(risque.commentaire).to.equal('Un commentaire');
          expect(risque.niveauGravite).to.equal('unNiveau');
          risqueAjoute = true;
          return Promise.resolve();
        } catch (e) {
          return done(e);
        }
      };

      axios.post('http://localhost:1234/api/homologation/456/risques', {
        'commentaire-unRisque': 'Un commentaire',
        'niveauGravite-unRisque': 'unNiveau',
      })
        .then((reponse) => {
          expect(risqueAjoute).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idHomologation: '456' });
          done();
        })
        .catch(done);
    });

    it("demande au dépôt d'associer les risques spécifiques à l'homologation", (done) => {
      let risquesRemplaces = false;
      depotDonnees.remplaceRisquesSpecifiquesPourHomologation = (idHomologation, risques) => {
        expect(idHomologation).to.equal('456');
        expect(risques.nombre()).to.equal(1);
        expect(risques.item(0).description).to.equal('Un risque spécifique');
        expect(risques.item(0).commentaire).to.equal('Un commentaire');
        risquesRemplaces = true;
        return Promise.resolve();
      };

      axios.post('http://localhost:1234/api/homologation/456/risques', {
        risquesSpecifiques: [{ description: 'Un risque spécifique', commentaire: 'Un commentaire' }],
      })
        .then(() => expect(risquesRemplaces).to.be(true))
        .then(() => done())
        .catch(done);
    });

    it('filtre les risques spécifiques vides', (done) => {
      referentiel.recharge({ niveauxGravite: { unNiveau: {} } });

      let risquesRemplaces = false;
      depotDonnees.remplaceRisquesSpecifiquesPourHomologation = (_, risques) => {
        expect(risques.nombre()).to.equal(2);
        risquesRemplaces = true;
        return Promise.resolve();
      };

      const risquesSpecifiques = [];
      risquesSpecifiques[2] = { description: 'Un risque spécifique' };
      risquesSpecifiques[5] = { niveauGravite: 'unNiveau' };

      axios.post('http://localhost:1234/api/homologation/456/risques', { risquesSpecifiques })
        .then(() => expect(risquesRemplaces).to.be(true))
        .then(() => done())
        .catch(done);
    });

    it('retourne une erreur HTTP 422 si les données sont invalides', (done) => {
      verifieRequeteGenereErreurHTTP(422, 'Données invalides', {
        method: 'post',
        url: 'http://localhost:1234/api/homologation/456/risques',
        data: { 'commentaire-unRisqueInvalide': 'Un commentaire' },
      }, done);
    });
  });

  describe('quand requête POST sur `/api/homologation/:id/avisExpertCyber`', () => {
    beforeEach(() => (
      depotDonnees.ajouteAvisExpertCyberAHomologation = () => Promise.resolve()
    ));

    it("recherche l'homologation correspondante", (done) => {
      middleware.verifieRechercheHomologation({
        method: 'post',
        url: 'http://localhost:1234/api/homologation/456/avisExpertCyber',
      }, done);
    });

    it("demande au dépôt d'associer l'avis d'expert à l'homologation", (done) => {
      let avisAjoute = false;

      depotDonnees.ajouteAvisExpertCyberAHomologation = (idHomologation, avis) => new Promise(
        (resolve) => {
          expect(idHomologation).to.equal('456');
          expect(avis.commentaire).to.equal('Un commentaire');
          avisAjoute = true;
          resolve();
        }
      );

      axios.post('http://localhost:1234/api/homologation/456/avisExpertCyber', {
        commentaire: 'Un commentaire',
      })
        .then((reponse) => {
          expect(avisAjoute).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idHomologation: '456' });
          done();
        })
        .catch(done);
    });

    it('retourne une erreur HTTP 422 si les données sont invalides', (done) => {
      verifieRequeteGenereErreurHTTP(422, 'Données invalides', {
        method: 'post',
        url: 'http://localhost:1234/api/homologation/456/avisExpertCyber',
        data: { avis: 'avisInvalide' },
      }, done);
    });
  });
});
