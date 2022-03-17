const expect = require('expect.js');
const Middleware = require('../src/middleware');

const prepareVerificationReponse = (reponse, status, ...params) => {
  let message;
  let suite;

  if (params.length === 1) [suite] = params;
  if (params.length === 2) [message, suite] = params;

  reponse.status = (s) => {
    try {
      expect(s).to.equal(status);
      return reponse;
    } catch (e) {
      suite(e);
      return undefined;
    }
  };

  reponse.send = (m) => {
    try {
      if (typeof message !== 'undefined') expect(m).to.equal(message);
      suite();
    } catch (e) {
      /* eslint-disable no-console */
      console.log(e);
      /* eslint-enable no-console */
    }
  };
};

const prepareVerificationRedirection = (reponse, urlRedirection, done) => {
  reponse.redirect = (url) => {
    expect(url).to.equal(urlRedirection);
    done();
  };
};

const verifieValeurHeader = (nomHeader, regExpValeurAttendue, reponse) => {
  expect(reponse.headers).to.have.property(nomHeader);
  expect(reponse.headers[nomHeader]).to.match(new RegExp(regExpValeurAttendue));
};

describe('Le middleware MSS', () => {
  const requete = {};
  const reponse = {};
  const depotDonnees = {};

  beforeEach(() => {
    requete.session = { token: 'XXX' };
    requete.params = {};
    requete.body = {};

    reponse.headers = {};
    reponse.redirect = () => {};
    reponse.set = (clefsValeurs) => Object.assign(reponse.headers, clefsValeurs);
    reponse.status = () => reponse;
    reponse.send = () => {};

    depotDonnees.homologation = () => Promise.resolve();
    depotDonnees.utilisateurExiste = () => Promise.resolve(true);
  });

  it("redirige l'utilisateur vers la mire de login quand échec vérification JWT", (done) => {
    const adaptateurJWT = { decode: (token) => { expect(token).to.equal('XXX'); } };
    expect(adaptateurJWT.decode('XXX')).to.be(undefined);

    prepareVerificationRedirection(reponse, '/connexion', done);

    const middleware = Middleware({ adaptateurJWT });
    middleware.verificationJWT(requete, reponse);
  });

  it('redirige vers mire login si identifiant dans token ne correspond à aucun utilisateur', (done) => {
    const adaptateurJWT = { decode: () => ({ idUtilisateur: '123' }) };

    depotDonnees.utilisateurExiste = (id) => {
      expect(id).to.equal('123');
      return Promise.resolve(false);
    };

    prepareVerificationRedirection(reponse, '/connexion', done);

    const middleware = Middleware({ adaptateurJWT, depotDonnees });
    const suite = () => done("Le middleware suivant n'aurait pas dû être appelé");
    middleware.verificationJWT(requete, reponse, suite);
  });

  it('repousse la date expiration du cookie de session en mettant à jour le cookie', (done) => {
    const middleware = Middleware({});

    const suite = () => {
      try {
        const dateAttendueArrondieAMinuteInferieure = 2;
        expect(requete.session.maintenant).to.equal(dateAttendueArrondieAMinuteInferieure);
        done();
      } catch (e) {
        done(e);
      }
    };

    Date.now = () => 120_999;
    middleware.repousseExpirationCookie(requete, reponse, suite);
  });

  it("vérifie que les CGU sont acceptées et redirige l'utilisateur si besoin", (done) => {
    const adaptateurJWT = { decode: () => ({ cguAcceptees: false }) };
    const middleware = Middleware({ adaptateurJWT, depotDonnees });

    reponse.redirect = (url) => {
      expect(url).to.equal('/utilisateur/edition');
      done();
    };

    middleware.verificationAcceptationCGU(requete, reponse);
  });

  it('efface les cookies sur demande', (done) => {
    expect(requete.session).to.not.be(null);

    const middleware = Middleware();
    middleware.suppressionCookie(requete, reponse, () => {
      expect(requete.session).to.be(null);
      done();
    });
  });

  describe('sur authentification basique', () => {
    it('retourne une erreur HTTP 401 et demande un challenge si échec authentification', (done) => {
      const middleware = Middleware({ login: 'admin', motDePasse: 'password' });

      requete.headers = {};

      reponse.set = (nomHeader, valeurHeader) => {
        expect(nomHeader).to.equal('WWW-Authenticate');
        expect(valeurHeader).to.equal('Basic realm="Administration Mon Service Sécurisé"');
      };

      prepareVerificationReponse(reponse, 401, done);

      middleware.authentificationBasique(requete, reponse, () => done('Exécution suite chaîne inattendue'));
    });

    it('poursuit normalement si succès authentification', (done) => {
      const middleware = Middleware({ login: 'admin', motDePasse: 'password' });

      requete.headers = { authorization: 'Basic YWRtaW46cGFzc3dvcmQ=' }; // admin:password

      middleware.authentificationBasique(requete, reponse, () => {
        expect(requete.auth.user).to.equal('admin');
        expect(requete.auth.password).to.equal('password');
        done();
      });
    });
  });

  describe('sur recherche homologation existante', () => {
    const adaptateurJWT = { decode: () => ({ idUtilisateur: '999', cguAcceptees: true }) };
    beforeEach(() => (depotDonnees.homologation = () => Promise.resolve()));

    it('requête le dépôt de données', (done) => {
      depotDonnees.homologation = (id) => {
        expect(id).to.equal('123');
        done();
      };
      const middleware = Middleware({ adaptateurJWT, depotDonnees });

      requete.params = { id: '123' };
      middleware.trouveHomologation(requete, reponse);
    });

    it('renvoie une erreur HTTP 404 si homologation non trouvée', (done) => {
      const middleware = Middleware({ adaptateurJWT, depotDonnees });

      prepareVerificationReponse(reponse, 404, 'Homologation non trouvée', done);

      const suite = () => done("Le middleware suivant n'aurait pas dû être appelé");
      middleware.trouveHomologation(requete, reponse, suite);
    });

    it("renvoie une erreur HTTP 403 si l'utilisateur courant n'a pas accès à l'homologation", (done) => {
      depotDonnees.homologation = () => Promise.resolve({});
      depotDonnees.accesAutorise = () => Promise.resolve(false);
      const middleware = Middleware({ adaptateurJWT, depotDonnees });

      prepareVerificationReponse(reponse, 403, "Accès à l'homologation refusé", done);

      const suite = () => done("Le middleware suivant n'aurait pas dû être appelé");
      middleware.trouveHomologation(requete, reponse, suite);
    });

    it("retourne une erreur HTTP 422 si l'homologation n'a pas pu être instanciée", (done) => {
      depotDonnees.homologation = () => Promise.reject(new Error('oups'));
      const middleware = Middleware({ adaptateurJWT, depotDonnees });

      prepareVerificationReponse(reponse, 422, "L'homologation n'a pas pu être récupérée", done);

      const suite = () => done("Le middleware suivant n'aurait pas dû être appelé");
      middleware.trouveHomologation(requete, reponse, suite);
    });

    it("retourne l'homologation trouvée et appelle le middleware suivant", (done) => {
      const homologation = {};
      depotDonnees.homologation = () => Promise.resolve(homologation);
      depotDonnees.accesAutorise = () => Promise.resolve(true);
      const middleware = Middleware({ adaptateurJWT, depotDonnees });

      middleware.trouveHomologation(requete, reponse, () => {
        try {
          expect(requete.homologation).to.equal(homologation);
          done();
        } catch (e) { done(e); }
      });
    });
  });

  describe("sur demande d'aseptisation", () => {
    it('supprime les espaces au début et à la fin du paramètre', (done) => {
      const middleware = Middleware();
      requete.body.param = '  une valeur ';
      middleware.aseptise('param')(requete, reponse, () => {
        expect(requete.body.param).to.equal('une valeur');
        done();
      })
        .catch(done);
    });

    it('prend en compte plusieurs paramètres', (done) => {
      const middleware = Middleware();
      requete.body.paramRenseigne = '  une valeur ';
      middleware.aseptise('paramAbsent', 'paramRenseigne')(requete, reponse, () => {
        expect(requete.body.paramRenseigne).to.equal('une valeur');
        done();
      })
        .catch(done);
    });

    it('ne cherche pas à aseptiser les tableaux vides', (done) => {
      const middleware = Middleware();
      requete.body.param = [];
      middleware.aseptise('*')(requete, reponse, () => {
        expect(Array.isArray(requete.body.param)).to.be(true);
        expect(requete.body.param).to.eql([]);
        done();
      })
        .catch(done);
    });

    it('neutralise le code HTML', (done) => {
      const middleware = Middleware();
      requete.body.paramRenseigne = '<script>alert("hacked!");</script>';
      middleware.aseptise('paramAbsent', 'paramRenseigne')(requete, reponse, () => {
        expect(requete.body.paramRenseigne).to.equal(
          '&lt;script&gt;alert(&quot;hacked!&quot;);&lt;&#x2F;script&gt;'
        );
        done();
      })
        .catch(done);
    });

    it('aseptise les paramètres de la requête', (done) => {
      const middleware = Middleware();
      requete.params.paramRenseigne = '<script>alert("hacked!");</script>';
      middleware.aseptise('paramAbsent', 'paramRenseigne')(requete, reponse, () => {
        expect(requete.params.paramRenseigne).to.equal(
          '&lt;script&gt;alert(&quot;hacked!&quot;);&lt;&#x2F;script&gt;'
        );
        done();
      })
        .catch(done);
    });
  });

  describe('sur demande positionnement headers avec un nonce', () => {
    const verifieHeaderAvecNonce = (nonce, nomHeader, regExpValeurAttendue, suite) => {
      const adaptateurChiffrement = { nonce: () => Promise.resolve(nonce) };
      const middleware = Middleware({ adaptateurChiffrement });

      middleware.positionneHeadersAvecNonce(requete, reponse, () => {
        verifieValeurHeader(nomHeader, regExpValeurAttendue, reponse);
        suite();
      });
    };

    it('ajoute un nonce dans la requête', (done) => {
      const adaptateurChiffrement = { nonce: () => Promise.resolve('12345') };
      const middleware = Middleware({ adaptateurChiffrement });

      middleware.positionneHeadersAvecNonce(requete, reponse, (e) => {
        if (e) return done(e);

        expect(requete.nonce).to.equal('12345');
        return done();
      });
    });

    it('autorise le chargement des styles avec ce nonce', (done) => {
      verifieHeaderAvecNonce(
        '12345',
        'content-security-policy',
        "style-src 'self' 'nonce-12345';",
        done,
      );
    });

    it('autorise le chargement des scripts avec ce nonce', (done) => {
      verifieHeaderAvecNonce(
        '12345',
        'content-security-policy',
        "script-src 'self' 'nonce-12345';",
        done,
      );
    });
  });

  describe('sur demande positionnement des headers', () => {
    beforeEach(() => (requete.nonce = undefined));

    const verifiePositionnementHeader = (nomHeader, regExpValeurAttendue, suite) => {
      const middleware = Middleware();
      middleware.positionneHeaders(requete, reponse, () => {
        verifieValeurHeader(nomHeader, regExpValeurAttendue, reponse);
        suite();
      });
    };

    it('autorise le chargement de toutes les ressources du domaine', (done) => {
      verifiePositionnementHeader('content-security-policy', "default-src 'self'", done);
    });

    it("autorise le chargement des images dont l'URL commence par `data:`", (done) => {
      verifiePositionnementHeader('content-security-policy', "img-src 'self' data:;", done);
    });

    it('autorise le chargement de tous les scripts extérieurs utilisés dans la vue', (done) => {
      verifiePositionnementHeader(
        'content-security-policy',
        /script-src[^;]* unpkg.com code.jquery.com/,
        done
      );
    });

    it('interdit le chargement de la page dans une iFrame', (done) => {
      verifiePositionnementHeader('x-frame-options', /^deny$/, done);
    });

    it("n'affiche pas l'URL de provenance quand l'utilisateur change de page", (done) => {
      verifiePositionnementHeader('referrer-policy', /^no-referrer$/, done);
    });
  });

  describe("sur une demande d'aseptisation d'une liste", () => {
    it('supprime les éléments dont toutes les propriétés sont vides', (done) => {
      const middleware = Middleware();
      requete.body.listeAvecProprieteVide = [
        { description: 'une description' }, { description: null },
      ];
      middleware.aseptiseListe('listeAvecProprieteVide', ['description'])(requete, reponse, () => {
        expect(requete.body.listeAvecProprieteVide).to.have.length(1);
        done();
      });
    });

    it('conserve les éléments dont au moins une propriété est renseignée', (done) => {
      const middleware = Middleware();
      requete.body.listeAvecProprietesPartiellementVides = [
        { description: 'une description', nom: null },
      ];
      middleware.aseptiseListe('listeAvecProprietesPartiellementVides', ['description', 'nom'])(requete, reponse, () => {
        expect(requete.body.listeAvecProprietesPartiellementVides).to.have.length(1);
        done();
      });
    });

    it('ne supprime pas les éléments dont les propriétés sont des tableaux vides', (done) => {
      const middleware = Middleware();
      requete.body.listeAvecProprieteTableauVide = [
        { description: [] },
      ];
      middleware.aseptiseListe('listeAvecProprieteTableauVide', ['description'])(requete, reponse, () => {
        expect(requete.body.listeAvecProprieteTableauVide).to.have.length(1);
        done();
      });
    });
  });

  describe("sur une demande d'aseptisation de plusieurs listes", () => {
    it('supprime dans chaque liste les éléments dont toutes les propriétés sont vides', (done) => {
      const middleware = Middleware();
      requete.body.listeUn = [
        { description: 'une description' }, { description: null },
      ];
      requete.body.listeDeux = [
        { description: 'une description' }, { description: null },
      ];
      middleware.aseptiseListes([{ nom: 'listeUn', proprietes: ['description'] }, { nom: 'listeDeux', proprietes: ['description'] }])(requete, reponse, () => {
        expect(requete.body.listeUn).to.have.length(1);
        expect(requete.body.listeDeux).to.have.length(1);
        done();
      });
    });

    it('aseptise les paramètres en correspondants aux propriétés', (done) => {
      const middleware = Middleware();
      requete.body.listeUn = [
        { description: '  une description  ' },
      ];
      middleware.aseptiseListes([{ nom: 'listeUn', proprietes: ['description'] }])(requete, reponse, () => {
        expect(requete.body.listeUn[0].description).to.equal('une description');
        done();
      });
    });
  });
});
