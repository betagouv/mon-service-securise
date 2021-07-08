const axios = require('axios');
const expect = require('expect.js');

const { ErreurUtilisateurExistant } = require('../src/erreurs');
const MSS = require('../src/mss');
const Referentiel = require('../src/referentiel');
const DepotDonnees = require('../src/depotDonnees');
const Homologation = require('../src/modeles/homologation');

describe('Le serveur MSS', () => {
  let idUtilisateurCourant;
  let suppressionCookieEffectuee;
  let verificationJWTMenee;
  let authentificationBasiqueMenee;

  const verifieRequeteExigeSuppressionCookie = (requete, done) => {
    expect(suppressionCookieEffectuee).to.be(false);
    axios(requete)
      .then(() => {
        expect(suppressionCookieEffectuee).to.be(true);
        done();
      })
      .catch((erreur) => done(erreur));
  };

  const verifieRequeteExigeJWT = (requete, done) => {
    expect(verificationJWTMenee).to.be(false);

    idUtilisateurCourant = '123';
    axios(requete)
      .then(() => {
        expect(verificationJWTMenee).to.be(true);
        done();
      })
      .catch((erreur) => {
        const erreurHTTP = erreur.response && erreur.response.status;
        if (erreurHTTP >= 400 && erreurHTTP < 500) {
          expect(verificationJWTMenee).to.be(true);
          done();
        } else throw erreur;
      })
      .catch((erreur) => done(erreur));
  };

  const verifieJetonDepose = (reponse, done) => {
    expect(reponse.headers['set-cookie'][0]).to.match(
      /^token=.+; path=\/; expires=.+; samesite=strict; httponly$/
    );
    done();
  };

  const verifieRequeteExigeAuthentificationBasique = (requete, done) => {
    expect(authentificationBasiqueMenee).to.be(false);

    axios(requete)
      .then(() => {
        expect(authentificationBasiqueMenee).to.be(true);
        done();
      })
      .catch((erreur) => done(erreur));
  };

  const middleware = {
    suppressionCookie: (requete, reponse, suite) => {
      suppressionCookieEffectuee = true;
      suite();
    },
    verificationJWT: (requete, reponse, suite) => {
      requete.idUtilisateurCourant = idUtilisateurCourant;
      verificationJWTMenee = true;
      suite();
    },
    authentificationBasique: (requete, reponse, suite) => {
      authentificationBasiqueMenee = true;
      suite();
    },
  };

  let depotDonnees;
  let referentiel;
  let serveur;

  beforeEach((done) => {
    idUtilisateurCourant = undefined;
    suppressionCookieEffectuee = false;
    verificationJWTMenee = false;
    authentificationBasiqueMenee = false;

    depotDonnees = DepotDonnees.creeDepotVide();
    referentiel = Referentiel.creeReferentielVide();
    serveur = MSS.creeServeur(depotDonnees, middleware, referentiel, false);
    serveur.ecoute(1234, done);
  });

  afterEach(() => { serveur.arreteEcoute(); });

  it('sert des pages HTML', (done) => {
    axios.get('http://localhost:1234/')
      .then((reponse) => {
        expect(reponse.status).to.equal(200);
        done();
      })
      .catch((erreur) => done(erreur));
  });

  describe('quand requête GET sur `/connexion`', () => {
    it("déconnecte l'utilisateur courant", (done) => {
      verifieRequeteExigeSuppressionCookie('http://localhost:1234/connexion', done);
    });
  });

  describe('quand requête GET sur `/admin/inscription`', () => {
    it("déconnecte l'utilisateur courant", (done) => {
      verifieRequeteExigeSuppressionCookie('http://localhost:1234/admin/inscription', done);
    });

    it("verrouille l'accès par une authentification basique", (done) => {
      verifieRequeteExigeAuthentificationBasique('http://localhost:1234/admin/inscription', done);
    });
  });

  describe('quand requête GET sur `/api/homologations`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      verifieRequeteExigeJWT(
        { method: 'get', url: 'http://localhost:1234/api/homologations' }, done
      );
    });

    it("interroge le dépôt de données pour récupérer les homologations de l'utilisateur", (done) => {
      idUtilisateurCourant = '123';

      const homologation = { toJSON: () => ({ id: '456' }) };
      depotDonnees.homologations = (idUtilisateur) => {
        expect(idUtilisateur).to.equal('123');
        return [homologation];
      };

      axios.get('http://localhost:1234/api/homologations')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);

          const { homologations } = reponse.data;
          expect(homologations.length).to.equal(1);
          expect(homologations[0].id).to.equal('456');
          done();
        })
        .catch((erreur) => done(erreur));
    });
  });

  describe('quand requête GET sur `/homologation/:id`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      verifieRequeteExigeJWT(
        { method: 'get', url: 'http://localhost:1234/homologation/456' }, done
      );
    });

    it('retourne une erreur HTTP 404 si homologation inexistante', (done) => {
      expect(depotDonnees.homologation('456')).to.be(undefined);
      axios.get('http://localhost:1234/homologation/456')
        .then(() => done('Réponse HTTP OK inattendue'))
        .catch((erreur) => {
          expect(erreur.response.status).to.equal(404);
          expect(erreur.response.data).to.equal('Homologation non trouvée');
          done();
        })
        .catch((erreur) => done(erreur));
    });

    it("retrouve l'homologation à partir de son identifiant", (done) => {
      idUtilisateurCourant = '123';

      depotDonnees.homologation = (idHomologation) => {
        expect(idHomologation).to.equal('456');
        return new Homologation({ id: '456', idUtilisateur: '123', nomService: 'Super Service' });
      };

      axios.get('http://localhost:1234/homologation/456')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.contain('Super Service');
          done();
        })
        .catch((erreur) => done(erreur));
    });

    it("retourne une erreur HTTP 403 si l'homologation n'est pas liée à l'utilisateur courant", (done) => {
      idUtilisateurCourant = '123';

      depotDonnees.homologation = () => new Homologation({
        id: '456', idUtilisateur: '999', nomService: 'Super Service',
      });

      axios.get('http://localhost:1234/homologation/456')
        .then(() => done('Réponse HTTP OK inattendue'))
        .catch((erreur) => {
          expect(erreur.response.status).to.equal(403);
          expect(erreur.response.data).to.equal("Accès à l'homologation refusé");
          done();
        })
        .catch((erreur) => done(erreur));
    });
  });

  describe('quand requête GET sur `/homologation/:id/edition`', () => {
    beforeEach(() => (
      depotDonnees.homologation = () => new Homologation({
        id: '456', idUtilisateur: '999', nomService: 'Super Service',
      })
    ));

    it("vérifie que l'utilisateur est authentifié", (done) => {
      verifieRequeteExigeJWT(
        { method: 'get', url: 'http://localhost:1234/homologation/456/edition' }, done
      );
    });
  });

  describe('quand requête GET sur `/homologation/:id/caracteristiquesComplementaires`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      depotDonnees.homologation = () => new Homologation({
        id: '456', idUtilisateur: '999', nomService: 'Super Service',
      });

      verifieRequeteExigeJWT({
        method: 'get',
        url: 'http://localhost:1234/homologation/456/caracteristiquesComplementaires',
      }, done);
    });
  });

  describe('quand requête GET sur `/homologation/:id/decision`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      verifieRequeteExigeJWT(
        { method: 'get', url: 'http://localhost:1234/homologation/456/decision' }, done
      );
    });

    it('retourne une erreur HTTP 404 si homologation inexistante', (done) => {
      expect(depotDonnees.homologation('456')).to.be(undefined);
      axios.get('http://localhost:1234/homologation/456/decision')
        .then(() => done('Réponse HTTP OK inattendue'))
        .catch((erreur) => {
          expect(erreur.response.status).to.equal(404);
          expect(erreur.response.data).to.equal('Homologation non trouvée');
          done();
        })
        .catch((erreur) => done(erreur));
    });

    it("retourne une erreur HTTP 403 si l'homologation n'est pas liée à l'utilisateur courant", (done) => {
      idUtilisateurCourant = '123';

      depotDonnees.homologation = () => new Homologation({
        id: '456', idUtilisateur: '999', nomService: 'Super Service',
      });

      axios.get('http://localhost:1234/homologation/456/decision')
        .then(() => done('Réponse HTTP OK inattendue'))
        .catch((erreur) => {
          expect(erreur.response.status).to.equal(403);
          expect(erreur.response.data).to.equal("Accès à l'homologation refusé");
          done();
        })
        .catch((erreur) => done(erreur));
    });
  });

  describe('quand requête GET sur `/homologation/:id/mesures`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      depotDonnees.homologation = () => new Homologation({
        id: '456', idUtilisateur: '999', nomService: 'Super Service',
      });

      verifieRequeteExigeJWT(
        { method: 'get', url: 'http://localhost:1234/homologation/456/mesures' }, done
      );
    });
  });

  describe('quand requete GET sur `/homologation/:id/partiesPrenantes`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      depotDonnees.homologation = () => new Homologation({
        id: '456', idUtilisateur: '999', nomService: 'Super Service',
      });

      verifieRequeteExigeJWT(
        { method: 'get', url: 'http://localhost:1234/homologation/456/partiesPrenantes' }, done
      );
    });
  });

  describe('quand requête GET sur `/homologation/:id/risques`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      depotDonnees.homologation = () => new Homologation({
        id: '456', idUtilisateur: '999', nomService: 'Super Service',
      });

      verifieRequeteExigeJWT(
        { method: 'get', url: 'http://localhost:1234/homologation/456/risques' }, done
      );
    });
  });

  describe('quand requête POST sur `/api/homologation`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      verifieRequeteExigeJWT(
        { method: 'post', url: 'http://localhost:1234/api/homologation' }, done
      );
    });

    it('retourne une erreur HTTP 422 si données insuffisantes pour création homologation', (done) => {
      axios.post('http://localhost:1234/api/homologation', {})
        .then(() => done('Réponse HTTP OK inattendue'))
        .catch((erreur) => {
          expect(erreur.response.status).to.equal(422);
          expect(erreur.response.data).to.equal("Données insuffisantes pour créer l'homologation");
          done();
        })
        .catch((erreur) => done(erreur));
    });

    it("demande au dépôt de données d'enregistrer les nouvelles homologations", (done) => {
      idUtilisateurCourant = '123';

      depotDonnees.nouvelleHomologation = (idUtilisateur, donneesHomologation) => {
        expect(idUtilisateur).to.equal('123');
        expect(donneesHomologation).to.eql({
          nomService: 'Super Service',
          natureService: undefined,
          provenanceService: undefined,
          dejaMisEnLigne: undefined,
          fonctionnalites: undefined,
          donneesCaracterePersonnel: undefined,
          delaiAvantImpactCritique: undefined,
          presenceResponsable: undefined,
        });
        return '456';
      };

      axios.post('http://localhost:1234/api/homologation', { nomService: 'Super Service' })
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idHomologation: '456' });
          done();
        })
        .catch((erreur) => done(erreur));
    });
  });

  describe('quand requête PUT sur `/api/homologation/:id`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      depotDonnees.metsAJourHomologation = () => {};

      verifieRequeteExigeJWT(
        { method: 'put', url: 'http://localhost:1234/api/homologation/456' }, done
      );
    });

    it("demande au dépôt de données de mettre à jour l'homologation", (done) => {
      idUtilisateurCourant = '123';

      depotDonnees.metsAJourHomologation = (identifiant, donneesHomologation) => {
        expect(identifiant).to.equal('456');
        expect(donneesHomologation.nomService).to.equal('Nouveau Nom');
        return '456';
      };

      axios.put('http://localhost:1234/api/homologation/456', { nomService: 'Nouveau Nom' })
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idHomologation: '456' });
          done();
        })
        .catch((erreur) => done(erreur));
    });
  });

  describe('quand requête POST sur `/api/homologation/:id/caracteristiquesComplementaires', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      depotDonnees.ajouteCaracteristiquesAHomologation = () => {};

      verifieRequeteExigeJWT({
        method: 'post',
        url: 'http://localhost:1234/api/homologation/456/caracteristiquesComplementaires',
      }, done);
    });

    it("demande au dépôt d'associer les caractéristiques à l'homologation", (done) => {
      let caracteristiquesAjoutees = false;

      depotDonnees.ajouteCaracteristiquesAHomologation = (idHomologation, caracteristiques) => {
        expect(idHomologation).to.equal('456');
        expect(caracteristiques.presentation).to.equal('Une présentation');
        caracteristiquesAjoutees = true;
      };

      axios.post('http://localhost:1234/api/homologation/456/caracteristiquesComplementaires', {
        presentation: 'Une présentation',
      })
        .then((reponse) => {
          expect(caracteristiquesAjoutees).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idHomologation: '456' });
          done();
        })
        .catch((erreur) => done(erreur));
    });
  });

  describe('quand requête POST sur `/api/homologation/:id/mesures', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      verifieRequeteExigeJWT(
        { method: 'post', url: 'http://localhost:1234/api/homologation/456/mesures' }, done
      );
    });

    it("demande au dépôt d'associer les mesures à l'homologation", (done) => {
      referentiel.recharge({ mesures: { identifiantMesure: {} } });
      let mesureAjoutee = false;

      depotDonnees.ajouteMesureAHomologation = (idHomologation, mesure) => {
        expect(idHomologation).to.equal('456');
        expect(mesure.id).to.equal('identifiantMesure');
        expect(mesure.statut).to.equal('fait');
        expect(mesure.modalites).to.equal("Des modalités d'application");
        mesureAjoutee = true;
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
        .catch((erreur) => done(erreur));
    });
  });

  describe('quand requête POST sur `/api/homologation/:id/partiesPrenantes`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      depotDonnees.ajoutePartiesPrenantesAHomologation = () => {};

      verifieRequeteExigeJWT({
        method: 'post',
        url: 'http://localhost:1234/api/homologation/456/partiesPrenantes',
      }, done);
    });

    it("demande au dépôt d'associer les parties prenantes à l'homologation", (done) => {
      let partiesPrenantesAjoutees = false;

      depotDonnees.ajoutePartiesPrenantesAHomologation = (idHomologation, pp) => {
        expect(idHomologation).to.equal('456');
        expect(pp.autoriteHomologation).to.equal('Jean Dupont');
        partiesPrenantesAjoutees = true;
      };

      axios.post('http://localhost:1234/api/homologation/456/partiesPrenantes', {
        autoriteHomologation: 'Jean Dupont',
      })
        .then((reponse) => {
          expect(partiesPrenantesAjoutees).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idHomologation: '456' });
          done();
        })
        .catch((erreur) => done(erreur));
    });
  });

  describe('quand requête POST sur `/api/homologation/:id/risques', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      verifieRequeteExigeJWT(
        { method: 'post', url: 'http://localhost:1234/api/homologation/456/risques' }, done
      );
    });

    it("demande au dépôt d'associer les risques à l'homologation", (done) => {
      referentiel.recharge({ risques: { unRisque: {} } });
      let risqueAjoute = false;

      depotDonnees.ajouteRisqueAHomologation = (idHomologation, risque) => {
        expect(idHomologation).to.equal('456');
        expect(risque.id).to.equal('unRisque');
        expect(risque.commentaire).to.equal('Un commentaire');
        risqueAjoute = true;
      };

      axios.post('http://localhost:1234/api/homologation/456/risques', {
        'commentaire-unRisque': 'Un commentaire',
      })
        .then((reponse) => {
          expect(risqueAjoute).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idHomologation: '456' });
          done();
        })
        .catch((erreur) => done(erreur));
    });
  });

  describe('quand requête POST sur `/api/utilisateur`', () => {
    const utilisateur = { id: '123', genereToken: () => 'un token' };

    it("demande au dépôt de créer l'utilisateur", (done) => {
      const donneesRequete = {
        prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'mdp_12345',
      };

      depotDonnees.nouvelUtilisateur = (donneesUtilisateur) => {
        expect(donneesUtilisateur).to.eql(donneesRequete);
        return new Promise((resolve) => resolve(utilisateur));
      };

      axios.post('http://localhost:1234/api/utilisateur', donneesRequete)
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idUtilisateur: '123' });
          done();
        })
        .catch((erreur) => done(erreur));
    });

    it('dépose le jeton dans un cookie', (done) => {
      depotDonnees.nouvelUtilisateur = () => new Promise((resolve) => resolve(utilisateur));

      axios.post('http://localhost:1234/api/utilisateur', { desDonnees: 'des donnees' })
        .then((reponse) => verifieJetonDepose(reponse, done))
        .catch((erreur) => done(erreur));
    });

    it("génère une erreur HTTP 422 si l'utilisateur existe déjà", (done) => {
      depotDonnees.nouvelUtilisateur = () => { throw new ErreurUtilisateurExistant(); };

      axios.post('http://localhost:1234/api/utilisateur', { desDonnees: 'des donnees' })
        .then(() => done('Reponse HTTP OK inattendue'))
        .catch((erreur) => {
          expect(erreur.response.status).to.equal(422);
          expect(erreur.response.data).to.equal('Utilisateur déjà existant pour cette adresse email.');
          done();
        })
        .catch((erreur) => done(erreur));
    });
  });

  describe('quand requête POST sur `/api/token`', () => {
    describe("avec authentification réussie de l'utilisateur", () => {
      beforeEach(() => {
        const utilisateur = {
          toJSON: () => ({ prenomNom: 'Jean Dupont' }),
          genereToken: () => 'un token',
        };

        depotDonnees.utilisateurAuthentifie = (login, motDePasse) => new Promise(
          (resolve) => {
            expect(login).to.equal('jean.dupont@mail.fr');
            expect(motDePasse).to.equal('mdp_12345');
            resolve(utilisateur);
          }
        );
      });

      it("retourne les informations de l'utilisateur", (done) => {
        axios.post('http://localhost:1234/api/token', { login: 'jean.dupont@mail.fr', motDePasse: 'mdp_12345' })
          .then((reponse) => {
            expect(reponse.status).to.equal(200);
            expect(reponse.data).to.eql({ utilisateur: { prenomNom: 'Jean Dupont' } });
            done();
          })
          .catch((erreur) => done(erreur));
      });

      it('pose un cookie', (done) => {
        axios.post('http://localhost:1234/api/token', { login: 'jean.dupont@mail.fr', motDePasse: 'mdp_12345' })
          .then((reponse) => verifieJetonDepose(reponse, done))
          .catch((erreur) => done(erreur));
      });

      it("retourne les infos de l'utilisateur", (done) => {
        axios.post('http://localhost:1234/api/token', { login: 'jean.dupont@mail.fr', motDePasse: 'mdp_12345' })
          .then((reponse) => {
            expect(reponse.data).to.eql({ utilisateur: { prenomNom: 'Jean Dupont' } });
            done();
          })
          .catch((erreur) => done(erreur));
      });
    });

    describe("avec échec de l'authentification de l'utilisateur", () => {
      before(() => (
        depotDonnees.utilisateurAuthentifie = () => new Promise(
          (resolve) => resolve(undefined)
        )
      ));

      it('retourne un HTTP 401', (done) => {
        axios.post('http://localhost:1234/api/token', { login: 'jean.dupont@mail.fr', motDePasse: 'mdp_12345' })
          .then(() => done('Réponse OK inattendue.'))
          .catch((erreur) => {
            expect(erreur.response.status).to.equal(401);
            expect(erreur.response.data).to.equal("L'authentification a échoué.");
            done();
          })
          .catch((erreur) => done(erreur));
      });
    });
  });
});
