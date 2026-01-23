import expect from 'expect.js';
import Middleware from '../../src/http/middleware.js';
import {
  ErreurDroitsIncoherents,
  ErreurChainageMiddleware,
} from '../../src/erreurs.js';
import { uneAutorisation } from '../constructeurs/constructeurAutorisation.js';
import ParcoursUtilisateur from '../../src/modeles/parcoursUtilisateur.js';
import { creeReferentiel } from '../../src/referentiel.js';
import Utilisateur from '../../src/modeles/utilisateur.js';
import { TYPES_REQUETES } from '../../src/http/configurationServeur.js';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { fabriqueAdaptateurChiffrement } from '../../src/adaptateurs/fabriqueAdaptateurChiffrement.js';
import {
  Permissions,
  Rubriques,
} from '../../src/modeles/autorisations/gestionDroits.js';
import { SourceAuthentification } from '../../src/modeles/sourceAuthentification.js';
import { unUUID, unUUIDRandom } from '../constructeurs/UUID.js';

const { DECRIRE, SECURISER, HOMOLOGUER } = Rubriques;
const { LECTURE, ECRITURE, INVISIBLE } = Permissions;

const prepareVerificationReponse = (reponse, status, message) => {
  reponse.render = () => {};
  reponse.status = (s) => {
    try {
      expect(s).to.equal(status);
      return reponse;
    } catch (e) {
      expect().fail(e);
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

const prepareVerificationRedirection = (reponse, urlRedirection) => {
  reponse.redirect = (url) => {
    expect(url).to.equal(urlRedirection);
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

  const leMiddleware = ({
    adaptateurJWT,
    adaptateurEnvironnement,
    adaptateurGestionErreur,
    adaptateurChiffrement = fabriqueAdaptateurChiffrement(),
  } = {}) =>
    Middleware({
      adaptateurJWT: adaptateurJWT || { decode: () => ({}) },
      adaptateurEnvironnement,
      adaptateurGestionErreur: adaptateurGestionErreur || {
        identifieUtilisateur: () => {},
      },
      depotDonnees,
      adaptateurChiffrement,
    });

  beforeEach(() => {
    requete.session = { token: 'XXX', cguAcceptees: true, estInvite: false };
    requete.params = {};
    requete.body = {};
    requete.cookies = {};
    requete.originalUrl = undefined;

    reponse.headers = {};
    reponse.locals = {};
    reponse.redirect = () => {};
    reponse.set = (clefsValeurs) =>
      Object.assign(reponse.headers, clefsValeurs);
    reponse.status = () => reponse;
    reponse.send = () => {};
    reponse.render = () => {};

    depotDonnees.service = async () => {};
    depotDonnees.utilisateur = async () =>
      unUtilisateur().avecId('123').construis();
  });

  it("redirige l'utilisateur vers l'url de base s'il vient d'un sous domaine", async () => {
    requete.headers = { host: 'sousdomaine.domaine:1234' };
    requete.originalUrl = '/monUrlDemandee';
    const adaptateurEnvironnement = {
      mss: () => ({ urlBase: () => 'http://domaine:1234' }),
    };

    prepareVerificationRedirection(
      reponse,
      'http://domaine:1234/monUrlDemandee'
    );

    const middleware = leMiddleware({ adaptateurEnvironnement });
    middleware.redirigeVersUrlBase(requete, reponse);
  });

  it("ne redirige pas l'utilisateur vers l'url de base s'il en provient déjà", async () => {
    requete.headers = { host: 'domaine:1234' };
    requete.originalUrl = '/monUrlDemandee';
    const adaptateurEnvironnement = {
      mss: () => ({ urlBase: () => 'http://domaine:1234' }),
    };

    const middleware = leMiddleware({ adaptateurEnvironnement });

    let aFini = false;
    await middleware.redirigeVersUrlBase(requete, reponse, () => {
      aFini = true;
    });

    expect(aFini).to.be(true);
  });

  describe('sur vérification du token JWT', () => {
    it("redirige l'utilisateur vers la mire de login quand échec vérification JWT", async () => {
      const adaptateurJWT = {
        decode: (token) => {
          expect(token).to.equal('XXX');
        },
      };

      prepareVerificationRedirection(reponse, '/connexion');

      const middleware = leMiddleware({ adaptateurJWT });
      await middleware.verificationJWT(requete, reponse);
    });

    it("ajoute l'URL originale à la redirection si elle commence par un '/'", async () => {
      const adaptateurJWT = { decode: () => null };
      requete.originalUrl = '/tableauDeBord';
      prepareVerificationRedirection(
        reponse,
        '/connexion?urlRedirection=%2FtableauDeBord'
      );

      const middleware = leMiddleware({ adaptateurJWT });
      await middleware.verificationJWT(requete, reponse);
    });

    it("n'ajoute pas l'URL originale à la redirection si elle commence par '/api'", async () => {
      const adaptateurJWT = { decode: () => null };
      requete.originalUrl = '/api/service';
      prepareVerificationRedirection(reponse, '/connexion');

      const middleware = leMiddleware({ adaptateurJWT });
      await middleware.verificationJWT(requete, reponse);
    });

    it('redirige vers mire login si identifiant dans token ne correspond à aucun utilisateur', async () => {
      const adaptateurJWT = { decode: () => ({ idUtilisateur: '123' }) };

      depotDonnees.utilisateur = (id) => {
        expect(id).to.equal('123');
        return Promise.resolve(undefined);
      };

      prepareVerificationRedirection(reponse, '/connexion');

      const middleware = leMiddleware({ adaptateurJWT, depotDonnees });
      const suite = () =>
        expect().fail("Le middleware suivant n'aurait pas dû être appelé");
      await middleware.verificationJWT(requete, reponse, suite);
    });

    describe("identifie l'utilisateur pour la gestion d'erreur", () => {
      it("par l'identifiant présent dans son token", async () => {
        let idCourant;
        const adaptateurGestionErreur = {
          identifieUtilisateur: (idUtilisateur) => {
            idCourant = idUtilisateur;
          },
        };

        const middleware = leMiddleware({
          adaptateurJWT: { decode: () => ({ idUtilisateur: '123' }) },
          adaptateurGestionErreur,
        });

        await middleware.verificationJWT(requete, reponse, () => {});

        expect(idCourant).to.be('123');
      });

      it('en conservant le timestamp de création de son token', async () => {
        let timestampToken;
        const adaptateurGestionErreur = {
          identifieUtilisateur: (_idUtilisateur, timestampTokenJwt) => {
            timestampToken = timestampTokenJwt;
          },
        };

        const middleware = leMiddleware({
          adaptateurJWT: { decode: () => ({ iat: 123456789 }) },
          adaptateurGestionErreur,
        });

        await middleware.verificationJWT(requete, reponse, () => {});

        expect(timestampToken).to.be(123456789);
      });
    });

    it('ajoute les informations de `cguAcceptees` provenant de la session à la requête', async () => {
      const middleware = leMiddleware();
      requete.session.cguAcceptees = 'CGU';

      await middleware.verificationJWT(requete, reponse, () => {});

      expect(requete.cguAcceptees).to.be('CGU');
    });

    it('ajoute les informations de `estInvite` provenant de la session à la requête', async () => {
      const middleware = leMiddleware();
      requete.session.estInvite = 'INVITÉ';

      await middleware.verificationJWT(requete, reponse, () => {});

      expect(requete.estInvite).to.be('INVITÉ');
    });

    describe('quand le JWT est expiré', () => {
      const adaptateurJWT = {
        decode: () => {
          throw new Error('Erreur JWT');
        },
      };
      const middleware = leMiddleware({ adaptateurJWT });
      it('redirige vers la page de connexion pour une requête de type NAVIGATION', async () => {
        requete.typeRequete = TYPES_REQUETES.NAVIGATION;
        let urlRecue;
        reponse.redirect = (url) => {
          urlRecue = url;
        };

        await middleware.verificationJWT(requete, reponse, () => {});

        expect(urlRecue).to.be('/connexion');
      });

      it("redirige vers la page de connexion en ajoutant l'URL originale à la redirection", async () => {
        requete.typeRequete = TYPES_REQUETES.NAVIGATION;
        requete.originalUrl = '/tableauDeBord';
        let urlRecue;
        reponse.redirect = (url) => {
          urlRecue = url;
        };

        await middleware.verificationJWT(requete, reponse);

        expect(urlRecue).to.be('/connexion?urlRedirection=%2FtableauDeBord');
      });

      it('retourne une erreur technique pour une requête de type API', async () => {
        requete.typeRequete = TYPES_REQUETES.API;
        let donneesRecues;
        let statutRecu;
        reponse.status = (statut) => {
          statutRecu = statut;
          return reponse;
        };
        reponse.send = (donnees) => {
          donneesRecues = donnees;
        };

        await middleware.verificationJWT(requete, reponse, () => {});

        expect(donneesRecues).to.eql({ cause: 'TOKEN_EXPIRE' });
        expect(statutRecu).to.be(401);
      });
    });
  });

  describe("sur vérification de l'acceptation des CGU", () => {
    beforeEach(() => {
      depotDonnees.utilisateur = () => ({ genereToken: () => 'NOUVEAU_TOKEN' });
    });

    describe('pour un utilisateur invité', () => {
      it("redirige l'utilisateur connecté via MSS", async () => {
        requete.session = { ...requete.session, estInvite: true };
        const adaptateurJWT = {
          decode: () => ({ source: 'MSS' }),
        };
        const middleware = leMiddleware({ adaptateurJWT, depotDonnees });

        reponse.redirect = (url) => {
          expect(url).to.equal('/connexion');
        };

        let suiteAppelee = false;
        await middleware.verificationAcceptationCGU(requete, reponse, () => {
          suiteAppelee = true;
        });
        expect(suiteAppelee).to.be(false);
      });

      it("redirige l'utilisateur connecté via Agent Connect", async () => {
        requete.session = { ...requete.session, estInvite: true };
        const adaptateurJWT = {
          decode: () => ({ source: 'AGENT_CONNECT' }),
        };
        const middleware = leMiddleware({ adaptateurJWT, depotDonnees });

        reponse.redirect = (url) => {
          expect(url).to.equal('/oidc/connexion');
        };

        let suiteAppelee = false;
        await middleware.verificationAcceptationCGU(requete, reponse, () => {
          suiteAppelee = true;
        });
        expect(suiteAppelee).to.be(false);
      });
    });

    describe("si l'utilisateur n'est pas un invité", () => {
      const adaptateurJWT = {
        decode: () => ({}),
      };

      it('si la dernière version des CGU est acceptée, appelle le middleware suivant', async () => {
        const middleware = leMiddleware({ adaptateurJWT, depotDonnees });

        let suiteAppelee = false;
        await middleware.verificationAcceptationCGU(requete, reponse, () => {
          suiteAppelee = true;
        });
        expect(suiteAppelee).to.be(true);
      });

      it("si la dernière version des CGU n'est pas acceptée, redirige vers la page des cgu", async () => {
        requete.session = { ...requete.session, cguAcceptees: false };
        const middleware = leMiddleware({ adaptateurJWT, depotDonnees });

        reponse.redirect = (url) => {
          expect(url).to.equal('/cgu');
        };

        let suiteAppelee = false;
        await middleware.verificationAcceptationCGU(requete, reponse, () => {
          suiteAppelee = true;
        });
        expect(suiteAppelee).to.be(false);
      });
    });
  });

  it('efface les cookies sur demande', async () => {
    expect(requete.session).to.not.be(null);

    const middleware = leMiddleware();
    middleware.suppressionCookie(requete, reponse, () => {
      expect(requete.session).to.be(null);
    });
  });

  describe("sur recherche d'un service existant", () => {
    let idService;

    const adaptateurJWT = {
      decode: () => ({ idUtilisateur: '999' }),
    };
    beforeEach(() => {
      idService = unUUIDRandom();
      depotDonnees.service = () => Promise.resolve();
      depotDonnees.utilisateur = () => ({ genereToken: () => 'NOUVEAU_TOKEN' });
    });

    it("jette une erreur si l'id est invalide", async () => {
      let statutRenvoye;
      reponse.sendStatus = (statut) => {
        statutRenvoye = statut;
      };
      const middleware = leMiddleware();
      requete.params = { id: 'pasUnUUID' };

      await middleware.trouveService({})(requete, reponse);

      expect(statutRenvoye).to.be(400);
    });

    it("ne jette pas d'erreur si d'autres paramètres sont présent dans la requête", async () => {
      let statutRenvoye = 'AUCUNE_ERREUR';
      reponse.sendStatus = (statut) => {
        statutRenvoye = statut;
      };
      const middleware = leMiddleware();
      requete.params = { id: idService, autreParametre: 'unParametre' };

      await middleware.trouveService({})(requete, reponse);

      expect(statutRenvoye).to.be('AUCUNE_ERREUR');
    });

    it('requête le dépôt de données', async () => {
      let idRecu;
      depotDonnees.service = async (id) => {
        idRecu = id;
      };
      const middleware = leMiddleware({ adaptateurJWT, depotDonnees });

      requete.params = { id: idService };
      await middleware.trouveService({})(requete, reponse);

      expect(idRecu).to.be(idService);
    });

    it('renvoie une erreur HTTP 404 si service non trouvée', async () => {
      const middleware = leMiddleware({ adaptateurJWT, depotDonnees });

      prepareVerificationReponse(reponse, 404, 'Service non trouvé');

      const suite = () =>
        expect().fail("Le middleware suivant n'aurait pas dû être appelé");
      await middleware.trouveService({})(requete, reponse, suite);
    });

    it("jette une erreur technique si l'objet de droits est incohérent", async () => {
      const middleware = leMiddleware();

      try {
        await middleware.trouveService({ mauvaiseCle: 'mauvaiseValeur' })(
          requete,
          reponse
        );
        expect().fail('Aurait dû lever une erreur');
      } catch (e) {
        expect(e).to.be.an(ErreurDroitsIncoherents);
        expect(e.message).to.equal(
          "L'objet de droits doit être de la forme `{ [Rubrique]: niveau }`"
        );
      }
    });

    it("renvoie une erreur HTTP 403 si l'utilisateur courant n'a pas accès au service", async () => {
      depotDonnees.service = async () => ({});
      depotDonnees.accesAutorise = async () => false;
      const middleware = leMiddleware({ adaptateurJWT, depotDonnees });

      prepareVerificationReponse(reponse, 403, 'Accès au service refusé');

      const suite = () =>
        expect().fail("Le middleware suivant n'aurait pas dû être appelé");
      await middleware.trouveService({})(requete, reponse, suite);
    });

    it("retourne une erreur HTTP 422 si le service n'a pas pu être instanciée", async () => {
      depotDonnees.service = async () => {
        throw new Error('oups');
      };
      const middleware = leMiddleware({ adaptateurJWT, depotDonnees });

      prepareVerificationReponse(
        reponse,
        422,
        "Le service n'a pas pu être récupéré"
      );

      const suite = () =>
        expect().fail("Le middleware suivant n'aurait pas dû être appelé");
      await middleware.trouveService({})(requete, reponse, suite);
    });

    it('retourne le service trouvé et appelle le middleware suivant', async () => {
      const service = {};
      depotDonnees.service = async () => service;
      depotDonnees.accesAutorise = async () => true;
      const middleware = leMiddleware({ adaptateurJWT });

      let appele = false;
      await middleware.trouveService({})(requete, reponse, () => {
        appele = true;
        expect(requete.service).to.equal(service);
      });
      expect(appele).to.be(true);
    });
  });

  describe("sur recherche du dossier courant d'une homologation existante", () => {
    it("renvoie une erreur HTTP 404 si le service n'a pas de dossier courant'", async () => {
      const service = { dossierCourant: () => null };
      requete.service = service;
      const middleware = leMiddleware();

      prepareVerificationReponse(reponse, 404, 'Service sans dossier courant');

      const suite = () =>
        expect().fail("Le middleware suivant n'aurait pas dû être appelé");
      middleware.trouveDossierCourant(requete, reponse, suite);
    });

    it("jette une erreur technique si le service n'est pas présent dans la requête", async () => {
      requete.service = null;
      const middleware = leMiddleware();

      expect(() =>
        middleware.trouveDossierCourant(requete, reponse)
      ).to.throwError((e) => {
        expect(e).to.be.an(ErreurChainageMiddleware);
        expect(e.message).to.equal(
          'Un service doit être présent dans la requête. Manque-t-il un appel à `trouveService` ?'
        );
      });
    });

    it('retourne le dossier courant trouvé et appelle le middleware suivant', async () => {
      const dossierCourant = {};
      const service = { dossierCourant: () => dossierCourant };

      requete.service = service;
      const middleware = leMiddleware();

      let appele = false;
      middleware.trouveDossierCourant(requete, reponse, () => {
        appele = true;
        expect(requete.dossierCourant).to.eql(dossierCourant);
      });
      expect(appele).to.be(true);
    });
  });

  describe('sur demande positionnement des headers', () => {
    beforeEach(() => (requete.nonce = undefined));

    const verifiePositionnementHeader = (nomHeader, regExpValeurAttendue) => {
      const middleware = leMiddleware();
      middleware.positionneHeaders(requete, reponse, () => {
        verifieValeurHeader(nomHeader, regExpValeurAttendue, reponse);
      });
    };

    describe('concernant les CSP', () => {
      it('autorise le chargement de toutes les ressources du domaine', async () => {
        verifiePositionnementHeader(
          'content-security-policy',
          "default-src 'self'"
        );
      });

      it("autorise le chargement des images venant de CRISP et du S3 de l'UI Kit", async () => {
        verifiePositionnementHeader(
          'content-security-policy',
          "img-src 'self' https://storage.crisp.chat https://lab-anssi-ui-kit-prod-s3-assets.cellar-c2.services.clever-cloud.com;"
        );
      });

      it("autorise le chargement des vidéos provenant du 'CellarStorage' de MSS", async () => {
        verifiePositionnementHeader(
          'content-security-policy',
          "media-src 'self' https://monservicesecurise-ressources.cellar-c2.services.clever-cloud.com;"
        );
      });

      it('autorise le chargement de tous les scripts du domaine et de sentry côté client', async () => {
        verifiePositionnementHeader(
          'content-security-policy',
          "script-src 'self' https://browser.sentry-cdn.com"
        );
      });

      it('autorise le chargement de tous les styles du domaine et via un nonce', async () => {
        verifiePositionnementHeader(
          'content-security-policy',
          "style-src 'self' 'nonce-"
        );
      });

      it('autorise le chargement de tous les éléments de style du domaine et via un nonce', async () => {
        verifiePositionnementHeader(
          'content-security-policy',
          "style-src-elem 'self' 'nonce-"
        );
      });

      it('autorise la connexion vers MSS, Sentry et stats.beta.gouv (pour Matomo)', async () => {
        verifiePositionnementHeader(
          'content-security-policy',
          "connect-src 'self' https://sentry.incubateur.net https://stats.beta.gouv.fr/matomo.php"
        );
      });

      it('autorise le chargements des iframes venant du domaine du « journal Metabase MSS »', async () => {
        const adaptateurEnvironnement = {
          supervision: () => ({
            domaineMetabaseMSS: () => 'https://journal-mss.fr/',
          }),
        };

        const middleware = leMiddleware({ adaptateurEnvironnement });

        middleware.positionneHeaders(requete, reponse, () => {
          verifieValeurHeader(
            'content-security-policy',
            'frame-src https://journal-mss.fr/',
            reponse
          );
        });
      });
    });

    it('interdit le chargement de la page dans une iFrame', async () => {
      verifiePositionnementHeader('x-frame-options', /^deny$/);
    });

    it("n'affiche pas l'URL de provenance quand l'utilisateur change de page", async () => {
      verifiePositionnementHeader('referrer-policy', /^no-referrer$/);
    });

    it("applique une politique 'same-origin' sur les 'cross-origin-opener'", async () => {
      verifiePositionnementHeader(
        'cross-origin-opener-policy',
        /^same-origin$/
      );
    });

    it("applique une politique 'same-origin' sur les 'cross-origin-resource'", async () => {
      verifiePositionnementHeader(
        'cross-origin-resource-policy',
        /^same-origin$/
      );
    });

    it('positionne un nonce dans le reponse.locals', async () => {
      const middleware = leMiddleware({
        adaptateurChiffrement: {
          nonce: () => 'UN-NONCE',
        },
      });
      middleware.positionneHeaders(requete, reponse, () => {
        expect(reponse.locals.nonce).to.eql('UN-NONCE');
      });
    });
  });

  describe("sur demande de filtrage d'adresse IP", () => {
    it("jette une erreur 401 si l'adresse IP n'est pas valide", async () => {
      const middleware = leMiddleware();
      requete.ip = '192.168.1.1';

      const suite = () =>
        expect().fail("Le middleware suivant n'aurait pas dû être appelé");
      prepareVerificationReponse(reponse, 401, 'Non autorisé');

      middleware.verificationAddresseIP(['192.168.0.1/24'])(
        requete,
        reponse,
        suite
      );
    });

    it("passe au middleware suivant si l'adresse est valide", async () => {
      const middleware = leMiddleware();
      requete.ip = '192.168.0.1';
      let appele = false;

      middleware.verificationAddresseIP(['192.168.0.1/24'])(
        requete,
        reponse,
        () => {
          appele = true;
        }
      );

      expect(appele).to.be(true);
    });
  });

  describe('sur challenge du mot de passe', () => {
    beforeEach(() => {
      depotDonnees.verifieMotDePasse = async () => {};
    });

    it.each([null, undefined, ''])(
      'jette une erreur si le champ `motDePasseChallenge` vaut %s',
      (valeur) => {
        let statutRenvoye;
        reponse.sendStatus = (statut) => {
          statutRenvoye = statut;
        };
        requete.body.motDePasseChallenge = valeur;
        requete.idUtilisateurCourant = '123';
        const middleware = leMiddleware();

        middleware.challengeMotDePasse(requete, reponse);

        expect(statutRenvoye).to.be(400);
      }
    );

    it("ne jette pas d'erreur si d'autres paramètres sont présent dans le body de la requête", async () => {
      let statutRenvoye = 'AUCUNE_ERREUR';
      reponse.sendStatus = (statut) => {
        statutRenvoye = statut;
      };
      const middleware = leMiddleware();
      requete.body = {
        motDePasseChallenge: 'unMotDePasse',
        autreParametre: 'unParametre',
      };
      requete.idUtilisateurCourant = '123';

      middleware.challengeMotDePasse(requete, reponse);

      expect(statutRenvoye).to.be('AUCUNE_ERREUR');
    });

    it("jette une erreur technique si l'ID de l'utilisateur courant n'est pas présent dans la requête", async () => {
      requete.idUtilisateurCourant = null;

      const middleware = leMiddleware();

      expect(() =>
        middleware.challengeMotDePasse(requete, reponse)
      ).to.throwError((e) => {
        expect(e).to.be.an(ErreurChainageMiddleware);
        expect(e.message).to.equal(
          'Un utilisateur courant doit être présent dans la requête. Manque-t-il un appel à `verificationJWT` ?'
        );
      });
    });

    it('renvoie une erreur HTTP 401 si le mot de passe est incorrect', async () => {
      requete.idUtilisateurCourant = '123';
      requete.body = { motDePasseChallenge: 'MAUVAIS_MDP' };
      depotDonnees.verifieMotDePasse = () => Promise.reject();

      prepareVerificationReponse(reponse, 401, 'Mot de passe incorrect');
      const suite = () =>
        expect().fail("Le middleware suivant n'aurait pas dû être appelé");

      const middleware = leMiddleware({ depotDonnees });
      middleware.challengeMotDePasse(requete, reponse, suite);
    });

    it('utilise le dépôt de données pour vérifier le mot de passe', async () => {
      let donneesPassees = {};
      requete.idUtilisateurCourant = '123';
      requete.body = { motDePasseChallenge: 'MDP' };

      depotDonnees.verifieMotDePasse = async (
        idUtilisateur,
        motDePasseChallenge
      ) => {
        donneesPassees = { idUtilisateur, motDePasseChallenge };
      };

      const middleware = leMiddleware({ depotDonnees });
      await middleware.challengeMotDePasse(requete, reponse, () => {});

      expect(donneesPassees).to.eql({
        idUtilisateur: '123',
        motDePasseChallenge: 'MDP',
      });
    });

    it('appelle le middleware suivant quand le mot de passe est correct', async () => {
      let middlewareSuivantAppele = false;
      requete.idUtilisateurCourant = '123';
      requete.body = { motDePasseChallenge: 'MDP' };

      const verificationOk = () => async () => {};
      depotDonnees.verifieMotDePasse = verificationOk();

      const suite = () => {
        middlewareSuivantAppele = true;
      };

      const middleware = leMiddleware({ depotDonnees });
      await middleware.challengeMotDePasse(requete, reponse, suite);

      expect(middlewareSuivantAppele).to.be(true);
    });
  });

  describe('sur demande de chargement des préférences utilisateurs', () => {
    it('ajoute un objet de préférences à `reponse.locals`, le rendant ainsi accessible aux `.pug`', async () => {
      const middleware = leMiddleware();

      middleware.chargePreferencesUtilisateur(requete, reponse, () => {
        expect(reponse.locals.preferencesUtilisateur).not.to.be(undefined);
      });
    });

    it("lit l'état d'ouverture/fermeture du menu de navigation", async () => {
      const middleware = leMiddleware();

      requete.cookies['etat-menu-navigation'] = 'ferme';
      middleware.chargePreferencesUtilisateur(requete, reponse, () => {
        const { preferencesUtilisateur } = reponse.locals;
        expect(preferencesUtilisateur.etatMenuNavigation).to.be('ferme');
      });
    });
  });

  describe('sur demande de chargement des autorisations pour un service', () => {
    beforeEach(() => {
      requete.idUtilisateurCourant = '999';
      requete.service = { id: '123' };
      depotDonnees.autorisationPour = async () =>
        uneAutorisation().avecDroits({}).construis();
    });

    it("jette une erreur technique si le service ou l'utilisateur ne sont pas présents dans la requête", async () => {
      requete.service = null;
      const middleware = leMiddleware({ depotDonnees });

      expect(() =>
        middleware.chargeAutorisationsService(requete, reponse, () => {})
      ).to.throwError((e) => {
        expect(e).to.be.an(ErreurChainageMiddleware);
        expect(e.message).to.equal(
          'Un utilisateur courant et un service doivent être présent dans la requête. Manque-t-il un appel à `verificationJWT` et `trouveService` ?'
        );
      });
    });

    it("utilise le dépôt de données pour lire l'autorisation", async () => {
      let donneesPassees = {};
      depotDonnees.autorisationPour = async (idUtilisateur, idService) => {
        donneesPassees = { idUtilisateur, idService };
        return uneAutorisation().avecDroits({}).construis();
      };

      const middleware = leMiddleware({ depotDonnees });

      middleware.chargeAutorisationsService(requete, reponse, () => {
        expect(donneesPassees).to.eql({
          idUtilisateur: '999',
          idService: '123',
        });
      });
    });

    it("ajoute l'autorisation à la *`requete`* pour qu'elle soit accessibles aux routes utilisant le middleware", async () => {
      const middleware = leMiddleware({ depotDonnees });
      const autorisationChargee = uneAutorisation()
        .avecDroits({
          [DECRIRE]: ECRITURE,
          [SECURISER]: LECTURE,
          [HOMOLOGUER]: INVISIBLE,
        })
        .construis();
      depotDonnees.autorisationPour = async () => autorisationChargee;

      middleware.chargeAutorisationsService(requete, reponse, () => {
        expect(requete.autorisationService).to.be(autorisationChargee);
      });
    });

    it("remanie l'objet d'autorisation à la *`reponse`* pour qu'il soit utilisable par le `.pug`", async () => {
      const middleware = leMiddleware({ depotDonnees });
      depotDonnees.autorisationPour = async () =>
        uneAutorisation()
          .avecDroits({
            [DECRIRE]: ECRITURE,
            [SECURISER]: LECTURE,
            [HOMOLOGUER]: INVISIBLE,
          })
          .construis();

      middleware.chargeAutorisationsService(requete, reponse, () => {
        expect(reponse.locals.autorisationsService).to.eql({
          DECRIRE: { estLectureSeule: false, estMasque: false },
          SECURISER: { estLectureSeule: true, estMasque: false },
          HOMOLOGUER: { estLectureSeule: false, estMasque: true },
          peutHomologuer: false,
        });
      });
    });
  });

  describe("sur demande de chargement de l'état de la visite guidée", () => {
    describe('quand la fonctionnalité visite guidée est active', () => {
      let middleware;

      beforeEach(() => {
        const referentiel = creeReferentiel({
          etapesVisiteGuidee: { DECRIRE: {} },
        });

        depotDonnees.lisParcoursUtilisateur = async () =>
          new ParcoursUtilisateur(
            { idUtilisateur: '1234', etatVisiteGuidee: { dejaTerminee: true } },
            referentiel
          );

        depotDonnees.utilisateur = async () =>
          new Utilisateur({
            email: 'jeanne.delajardiniere@gouv.fr',
            prenom: 'Jeanne',
            dateCreation: '2025-01-01',
          });

        middleware = leMiddleware({ depotDonnees });
      });

      it("jette une une erreur technique si l'utilisateur n'est pas présent dans la requête", async () => {
        requete.idUtilisateurCourant = undefined;

        try {
          await middleware.chargeEtatVisiteGuidee(requete, reponse, () => {});
          expect().fail(
            "Le chargement de l'état de la visite guidée aurait dû lever une exception"
          );
        } catch (e) {
          expect(e).to.be.an(ErreurChainageMiddleware);
          expect(e.message).to.equal(
            'Un utilisateur courant doit être présent dans la requête. Manque-t-il un appel à `verificationJWT` ?'
          );
        }
      });

      it("ajoute l'état de la visite guidée de l'utilisateur à `reponse.locals`", async () => {
        requete.idUtilisateurCourant = '1234';

        middleware.chargeEtatVisiteGuidee(requete, reponse, () => {
          expect(reponse.locals.etatVisiteGuidee.dejaTerminee).to.equal(true);

          expect(
            reponse.locals.etatVisiteGuidee.nombreEtapesRestantes
          ).to.equal(1);

          expect(reponse.locals.etatVisiteGuidee.utilisateurCourant).to.eql({
            prenom: 'Jeanne',
            profilComplet: false,
            dateInscription: '2025-01-01',
          });
        });
      });
    });
  });

  describe("sur demande de chargement de l'état de l'explication du nouveau référentiel", () => {
    let middleware;

    beforeEach(() => {
      const referentiel = creeReferentiel();

      depotDonnees.lisParcoursUtilisateur = async () =>
        new ParcoursUtilisateur(
          {
            idUtilisateur: '1234',
            etatVisiteGuidee: { dejaTerminee: true },
            explicationNouveauReferentiel: { dejaTermine: false },
          },
          referentiel
        );

      middleware = leMiddleware({ depotDonnees });
    });

    it("jette une une erreur technique si l'utilisateur n'est pas présent dans la requête", async () => {
      requete.idUtilisateurCourant = undefined;

      try {
        await middleware.chargeExplicationNouveauReferentiel(
          requete,
          reponse,
          () => {}
        );
        expect().fail(
          "Le chargement de l'état d'explication du nouveau référentiel aurait dû lever une exception"
        );
      } catch (e) {
        expect(e).to.be.an(ErreurChainageMiddleware);
        expect(e.message).to.equal(
          'Un utilisateur courant doit être présent dans la requête. Manque-t-il un appel à `verificationJWT` ?'
        );
      }
    });

    it("ajoute l'état d'affichage de l'explication du nouveau référentiel à `reponse.locals`", async () => {
      reponse.locals.afficheExplicationNouveauReferentiel = undefined;
      requete.idUtilisateurCourant = '1234';
      middleware = leMiddleware();

      middleware.chargeExplicationNouveauReferentiel(requete, reponse, () => {
        expect(reponse.locals.afficheExplicationNouveauReferentiel).not.to.be(
          undefined
        );
      });
    });
  });

  describe("sur demande de chargement de l'explication de la fin des comptes legacy (compte login + mot de passe)", () => {
    describe('pour une connexion par compte Legacy', () => {
      it("demande l'affichage de l'explication", async () => {
        let doitAfficher;
        depotDonnees.lisParcoursUtilisateur = async () =>
          ParcoursUtilisateur.pourUtilisateur(unUUID('1'), creeReferentiel());

        const middleware = leMiddleware();
        requete.session.sourceAuthentification = SourceAuthentification.MSS;

        await middleware.chargeExplicationFinCompteLegacy(
          requete,
          reponse,
          () => {
            doitAfficher = reponse.locals.afficheExplicationFinCompteLegacy;
          }
        );

        expect(doitAfficher).to.be(true);
      });

      it("ne demande pas l'affichage si le tableau de bord a déjà été vu pendant la navigation", async () => {
        let doitAfficher;
        depotDonnees.lisParcoursUtilisateur = async () => {
          const aNavigueSurTDB = ParcoursUtilisateur.pourUtilisateur(
            unUUID('1'),
            creeReferentiel()
          );
          aNavigueSurTDB.marqueTableauDeBordVu();
          return aNavigueSurTDB;
        };

        const middleware = leMiddleware();
        requete.session.sourceAuthentification = SourceAuthentification.MSS;

        await middleware.chargeExplicationFinCompteLegacy(
          requete,
          reponse,
          () => {
            doitAfficher = reponse.locals.afficheExplicationFinCompteLegacy;
          }
        );

        expect(doitAfficher).to.be(false);
      });
    });

    it("ne demande pas l'affichage de l'explication pour une requête connectée avec ProConnect comme source d'authentification", async () => {
      let doitAfficher;
      const middleware = leMiddleware();
      requete.session.sourceAuthentification =
        SourceAuthentification.AGENT_CONNECT;

      await middleware.chargeExplicationFinCompteLegacy(
        requete,
        reponse,
        () => {
          doitAfficher = reponse.locals.afficheExplicationFinCompteLegacy;
        }
      );

      expect(doitAfficher).to.be(false);
    });

    it("ne demande pas l'affichage pour une requête non connectée", async () => {
      let doitAfficher;
      const middleware = leMiddleware();
      requete.session = null;

      await middleware.chargeExplicationFinCompteLegacy(
        requete,
        reponse,
        () => {
          doitAfficher = reponse.locals.afficheExplicationFinCompteLegacy;
        }
      );

      expect(doitAfficher).to.be(false);
    });
  });

  describe("sur demande de chargement de l'explication de l'utilisation du MFA (ProConnect)", () => {
    describe('pour une connexion par compte ProConnect', () => {
      it("demande l'affichage de l'explication si le MFA n'a pas été utilisé", async () => {
        let doitAfficher;
        depotDonnees.lisParcoursUtilisateur = async () =>
          ParcoursUtilisateur.pourUtilisateur(unUUID('1'), creeReferentiel());

        const middleware = leMiddleware();
        requete.session.sourceAuthentification =
          SourceAuthentification.AGENT_CONNECT;
        requete.session.connexionAvecMFA = false;

        await middleware.chargeExplicationUtilisationMFA(
          requete,
          reponse,
          () => {
            doitAfficher = reponse.locals.afficheExplicationUtilisationMFA;
          }
        );

        expect(doitAfficher).to.be(true);
      });

      it("ne demande pas l'affichage si le tableau de bord a déjà été vu pendant la navigation", async () => {
        let doitAfficher;
        depotDonnees.lisParcoursUtilisateur = async () => {
          const aNavigueSurTDB = ParcoursUtilisateur.pourUtilisateur(
            unUUID('1'),
            creeReferentiel()
          );
          aNavigueSurTDB.marqueTableauDeBordVu();
          return aNavigueSurTDB;
        };

        const middleware = leMiddleware();
        requete.session.sourceAuthentification =
          SourceAuthentification.AGENT_CONNECT;

        await middleware.chargeExplicationUtilisationMFA(
          requete,
          reponse,
          () => {
            doitAfficher = reponse.locals.afficheExplicationUtilisationMFA;
          }
        );

        expect(doitAfficher).to.be(false);
      });
    });

    it("ne demande pas l'affichage de l'explication pour une requête connectée avec un compte legacy", async () => {
      let doitAfficher;
      const middleware = leMiddleware();
      requete.session.sourceAuthentification = SourceAuthentification.MSS;

      await middleware.chargeExplicationUtilisationMFA(requete, reponse, () => {
        doitAfficher = reponse.locals.afficheExplicationUtilisationMFA;
      });

      expect(doitAfficher).to.be(false);
    });

    it("ne demande pas l'affichage pour une requête non connectée", async () => {
      let doitAfficher;
      const middleware = leMiddleware();
      requete.session = null;

      await middleware.chargeExplicationUtilisationMFA(requete, reponse, () => {
        doitAfficher = reponse.locals.afficheExplicationUtilisationMFA;
      });

      expect(doitAfficher).to.be(false);
    });
  });

  it('ajoute la version de build dans `reponse.locals`, le rendant ainsi accessible aux `.pug`', async () => {
    const adaptateurEnvironnement = {
      versionDeBuild: () => '1.1',
    };

    const middleware = leMiddleware({ adaptateurEnvironnement });

    middleware.ajouteVersionFichierCompiles(requete, reponse, () => {
      expect(reponse.locals.version).to.be('1.1');
    });
  });

  describe('concernant le mode maintenance', () => {
    let adaptateurEnvironnement;

    beforeEach(() => {
      adaptateurEnvironnement = {
        modeMaintenance: () => ({
          actif: () => false,
          enPreparation: () => false,
          detailsPreparation: () => {},
        }),
      };
    });

    it('ajoute le contenu de la préparation de maintenance dans `reponse.locals`, le rendant ainsi accessible aux `.pug`', async () => {
      adaptateurEnvironnement = {
        modeMaintenance: () => ({
          actif: () => false,
          enPreparation: () => true,
          detailsPreparation: () => 'JOUR - HEURE',
        }),
      };

      const middleware = leMiddleware({ adaptateurEnvironnement });

      middleware.verificationModeMaintenance(requete, reponse, () => {
        expect(reponse.locals.avertissementMaintenance).to.eql({
          jour: 'JOUR',
          heure: 'HEURE',
        });
      });
    });

    describe('quand il est actif', () => {
      beforeEach(() => {
        adaptateurEnvironnement = {
          modeMaintenance: () => ({
            actif: () => true,
            enPreparation: () => false,
            detailsPreparation: () => {},
          }),
        };
      });

      it('renvoie une erreur 503', () => {
        let statutRecu;
        reponse.status = (s) => {
          statutRecu = s;
          return reponse;
        };

        const middleware = leMiddleware({ adaptateurEnvironnement });

        middleware.verificationModeMaintenance(requete, reponse, () => {});

        expect(statutRecu).to.be(503);
      });

      it('sert la page de maintenance', () => {
        let pageServie;
        reponse.render = (page) => {
          pageServie = page;
          return reponse;
        };

        const middleware = leMiddleware({ adaptateurEnvironnement });

        middleware.verificationModeMaintenance(requete, reponse, () => {});

        expect(pageServie).to.be('maintenance');
      });
    });

    describe("quand il n'est pas actif", () => {
      it('appelle le middleware suivant', () => {
        adaptateurEnvironnement = {
          modeMaintenance: () => ({
            actif: () => false,
            enPreparation: () => false,
            detailsPreparation: () => {},
          }),
        };
        let suiteAppelee = false;
        let requeteInterceptee = false;
        reponse.status = () => {
          requeteInterceptee = true;
          return reponse;
        };
        reponse.send = () => {
          requeteInterceptee = true;
          return reponse;
        };

        const middleware = leMiddleware({ adaptateurEnvironnement });

        middleware.verificationModeMaintenance(requete, reponse, () => {
          suiteAppelee = true;
        });

        expect(suiteAppelee).to.be(true);
        expect(requeteInterceptee).to.be(false);
      });
    });
  });

  it("ajoute le feature flag 'agentConnectActif' si les variables d'environnement sont présentes", async () => {
    const adaptateurEnvironnement = {
      featureFlag: () => ({ avecAgentConnect: () => true }),
    };

    const middleware = leMiddleware({ adaptateurEnvironnement });

    await middleware.chargeEtatAgentConnect(requete, reponse, () => {
      expect(reponse.locals.agentConnectActif).to.be(true);
    });
  });

  describe('concernant le type de requête', () => {
    it('sait charger le type de requête', async () => {
      const middleware = leMiddleware({});

      middleware.chargeTypeRequete('API')(requete, reponse, () => {
        expect(requete.typeRequete).to.be('API');
      });
    });
  });

  describe("sur demande d'interdiction de mise en cache", () => {
    it('interdit la mise en cache', async () => {
      const middleware = leMiddleware({});

      middleware.interdisLaMiseEnCache(requete, reponse, () => {
        expect(reponse.headers['cache-control']).to.be(
          'no-store, no-cache, must-revalidate, proxy-revalidate'
        );
        expect(reponse.headers.pragma).to.be('no-cache');
        expect(reponse.headers.expires).to.be('0');
        expect(reponse.headers['surrogate-control']).to.be('no-store');
      });
    });
  });

  describe('sur demande de chargement des `feature flags`', () => {
    let middleware;
    let adaptateurHorloge;
    let adaptateurEnvironnement;
    const featureFlag = {
      avecDecrireV2: () => true,
      dateDebutBandeauMSC: () => '2025-01-01 00:00:00Z',
    };

    beforeEach(() => {
      adaptateurEnvironnement = { featureFlag: () => featureFlag };
      adaptateurHorloge = {
        maintenant: () => new Date('2024-01-01 00:00:00Z'),
      };
      middleware = Middleware({ adaptateurEnvironnement, adaptateurHorloge });
    });

    it('ajoute un objet de feature flags à `reponse.locals`, le rendant ainsi accessible aux `.pug`', async () => {
      middleware.chargeFeatureFlags(requete, reponse, () => {
        expect(reponse.locals.featureFlags).not.to.be(undefined);
      });
    });

    describe("concernant l'affichage du bandeau de promotion MesServicesCyber", () => {
      it("n'affiche pas le bandeau si la date du jour est antérieure à la date d'affichage", async () => {
        middleware.chargeFeatureFlags(requete, reponse, () => {
          expect(reponse.locals.featureFlags.avecBandeauMSC).to.be(false);
        });
      });

      it("affiche le bandeau si la date d'affichage est passée", async () => {
        adaptateurHorloge.maintenant = () => new Date('2026-01-01 00:00:00Z');
        middleware = Middleware({ adaptateurEnvironnement, adaptateurHorloge });

        middleware.chargeFeatureFlags(requete, reponse, () => {
          expect(reponse.locals.featureFlags.avecBandeauMSC).to.be(true);
        });
      });
    });

    it('active décrire V2 si le feature flag est défini', () => {
      middleware.chargeFeatureFlags(requete, reponse, () => {
        expect(reponse.locals.featureFlags.avecDecrireV2).to.be(true);
      });
    });
  });
});
