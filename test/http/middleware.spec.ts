import { NextFunction, Response } from 'express';
import Middleware, { RequeteMSS } from '../../src/http/middleware.ts';
import {
  ErreurChainageMiddleware,
  ErreurDroitsIncoherents,
} from '../../src/erreurs.ts';
import { uneAutorisation } from '../constructeurs/constructeurAutorisation.js';
import ParcoursUtilisateur, {
  DonneesParcoursUtilisateur,
} from '../../src/modeles/parcoursUtilisateur.ts';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { fabriqueAdaptateurChiffrement } from '../../src/adaptateurs/fabriqueAdaptateurChiffrement.js';
import {
  Droits,
  Permissions,
  Rubriques,
} from '../../src/modeles/autorisations/gestionDroits.ts';
import { SourceAuthentification } from '../../src/modeles/sourceAuthentification.ts';
import { unUUIDRandom } from '../constructeurs/UUID.ts';
import { DepotDonnees } from '../../src/depotDonnees.interface.ts';
import { AdaptateurJWT } from '../../src/adaptateurs/adaptateurJWT.interface.ts';
import { AdaptateurEnvironnement } from '../../src/adaptateurs/adaptateurEnvironnement.interface.ts';
import { AdaptateurGestionErreur } from '../../src/adaptateurs/adaptateurGestionErreur.interface.ts';
import { AdaptateurChiffrement } from '../../src/adaptateurs/adaptateurChiffrement.interface.ts';
import { AdaptateurProtection } from '../../src/adaptateurs/adaptateurProtection.interface.ts';
import { Middleware as TypeMiddleware } from '../../src/http/middleware.interface.ts';
import Service from '../../src/modeles/service.js';

const { DECRIRE, SECURISER, HOMOLOGUER } = Rubriques;
const { LECTURE, ECRITURE, INVISIBLE } = Permissions;

const ID_UTILISATEUR_COURANT = unUUIDRandom();
const ID_SERVICE = unUUIDRandom();

const unParcoursUtilisateur = (donnees: Partial<DonneesParcoursUtilisateur>) =>
  new ParcoursUtilisateur({
    aVuTableauDeBordDepuisConnexion: false,
    idUtilisateur: ID_UTILISATEUR_COURANT,
    etatVisiteGuidee: { dejaTerminee: false },
    ...donnees,
  });

type ReponseDeTest = Response & { headers: Record<string, string> };

type DepotDonneesDeTest = {
  [Methode in keyof DepotDonnees]?: (...args: never[]) => unknown;
};

type ConfigurationDeTest = {
  adaptateurJWT?: unknown;
  adaptateurEnvironnement?: unknown;
  adaptateurGestionErreur?: unknown;
  adaptateurChiffrement?: unknown;
};

const appelleJusquALaSuite = (
  middleware: (
    requete: RequeteMSS,
    reponse: Response,
    suite: NextFunction
  ) => unknown,
  requete: RequeteMSS,
  reponse: Response
) =>
  new Promise<void>((resolve) => {
    middleware(requete, reponse, () => resolve());
  });

describe('Le middleware MSS', () => {
  const requete = {} as RequeteMSS;
  const reponse = {} as ReponseDeTest;
  const depotDonnees: DepotDonneesDeTest = {};

  const leMiddleware = ({
    adaptateurJWT,
    adaptateurEnvironnement,
    adaptateurGestionErreur,
    adaptateurChiffrement = fabriqueAdaptateurChiffrement(),
  }: ConfigurationDeTest = {}): TypeMiddleware =>
    Middleware({
      adaptateurJWT: (adaptateurJWT || {
        decode: () => ({}),
      }) as AdaptateurJWT,
      adaptateurEnvironnement:
        adaptateurEnvironnement as AdaptateurEnvironnement,
      adaptateurGestionErreur: (adaptateurGestionErreur || {
        identifieUtilisateur: () => {},
      }) as AdaptateurGestionErreur,
      depotDonnees: depotDonnees as unknown as DepotDonnees,
      adaptateurChiffrement: adaptateurChiffrement as AdaptateurChiffrement,
      adaptateurProtection: {} as AdaptateurProtection,
    });

  const suiteInterdite = () => {
    throw new Error("Le middleware suivant n'aurait pas dû être appelé");
  };

  beforeEach(() => {
    requete.session = { token: 'XXX', cguAcceptees: true, estInvite: false };
    requete.params = {};
    requete.body = {};
    requete.cookies = {};
    requete.originalUrl = undefined as unknown as string;

    reponse.headers = {};
    reponse.locals = {};
    reponse.redirect = vi.fn();
    reponse.set = vi.fn((clefsValeurs: Record<string, string>) => {
      Object.assign(reponse.headers, clefsValeurs);
      return reponse;
    }) as unknown as ReponseDeTest['set'];
    reponse.status = vi.fn().mockReturnValue(reponse);
    reponse.send = vi.fn();
    reponse.sendStatus = vi.fn();
    reponse.render = vi.fn();

    depotDonnees.service = async () => {};
    depotDonnees.utilisateur = async () =>
      unUtilisateur().avecId('123').quiSAppelle('Jean Dujardin').construis();
    depotDonnees.estAdmin = async () => true;
    depotDonnees.estSuperviseur = async () => false;
    depotDonnees.estJwtRevoque = async () => false;
  });

  it("redirige l'utilisateur vers l'url de base s'il vient d'un sous domaine", async () => {
    requete.headers = { host: 'sousdomaine.domaine:1234' };
    requete.originalUrl = '/monUrlDemandee';
    const adaptateurEnvironnement = {
      mss: () => ({ urlBase: () => 'http://domaine:1234' }),
    };

    const middleware = leMiddleware({ adaptateurEnvironnement });
    middleware.redirigeVersUrlBase(requete, reponse, suiteInterdite);

    expect(reponse.redirect).toHaveBeenCalledWith(
      'http://domaine:1234/monUrlDemandee'
    );
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

    expect(aFini).toBe(true);
  });

  describe('sur vérification du token JWT', () => {
    beforeEach(() => {
      depotDonnees.estJwtRevoque = async () => false;
    });

    it("redirige l'utilisateur vers la mire de login quand échec vérification JWT", async () => {
      const adaptateurJWT = { decode: vi.fn() };

      const middleware = leMiddleware({ adaptateurJWT });
      await middleware.verificationJWT(requete, reponse, suiteInterdite);

      expect(adaptateurJWT.decode).toHaveBeenCalledWith('XXX');
      expect(reponse.redirect).toHaveBeenCalledWith('/connexion');
    });

    it("redirige l'utilisateur vers la mire de login quand le JWT a été révoqué", async () => {
      const adaptateurJWT = {
        decode: () => ({
          idUtilisateur: 'U1',
          iat: 123,
          source: SourceAuthentification.AGENT_CONNECT,
        }),
      };
      depotDonnees.utilisateur = () => ({ genereToken: () => 'NOUVEAU_TOKEN' });
      depotDonnees.estJwtRevoque = async () => true;

      const middleware = leMiddleware({ adaptateurJWT });
      await middleware.verificationJWT(requete, reponse, () => {});

      expect(reponse.redirect).toHaveBeenCalledWith('/connexion');
    });

    it("ajoute l'URL originale à la redirection si elle commence par un '/'", async () => {
      const adaptateurJWT = { decode: () => null };
      requete.originalUrl = '/tableauDeBord';

      const middleware = leMiddleware({ adaptateurJWT });
      await middleware.verificationJWT(requete, reponse, suiteInterdite);

      expect(reponse.redirect).toHaveBeenCalledWith(
        '/connexion?urlRedirection=%2FtableauDeBord'
      );
    });

    it("n'ajoute pas l'URL originale à la redirection si elle commence par '/api'", async () => {
      const adaptateurJWT = { decode: () => null };
      requete.originalUrl = '/api/service';

      const middleware = leMiddleware({ adaptateurJWT });
      await middleware.verificationJWT(requete, reponse, suiteInterdite);

      expect(reponse.redirect).toHaveBeenCalledWith('/connexion');
    });

    it('redirige vers mire login si identifiant dans token ne correspond à aucun utilisateur', async () => {
      const adaptateurJWT = { decode: () => ({ idUtilisateur: '123' }) };
      const lectureUtilisateur = vi.fn().mockResolvedValue(undefined);
      depotDonnees.utilisateur = lectureUtilisateur;

      const middleware = leMiddleware({ adaptateurJWT });
      await middleware.verificationJWT(requete, reponse, suiteInterdite);

      expect(lectureUtilisateur).toHaveBeenCalledWith('123');
      expect(reponse.redirect).toHaveBeenCalledWith('/connexion');
    });

    describe("identifie l'utilisateur pour la gestion d'erreur", () => {
      it("par l'identifiant présent dans son token", async () => {
        const adaptateurGestionErreur = { identifieUtilisateur: vi.fn() };

        const middleware = leMiddleware({
          adaptateurJWT: { decode: () => ({ idUtilisateur: '123' }) },
          adaptateurGestionErreur,
        });

        await middleware.verificationJWT(requete, reponse, () => {});

        expect(
          adaptateurGestionErreur.identifieUtilisateur
        ).toHaveBeenCalledWith('123', undefined);
      });

      it('en conservant le timestamp de création de son token', async () => {
        const adaptateurGestionErreur = { identifieUtilisateur: vi.fn() };

        const middleware = leMiddleware({
          adaptateurJWT: { decode: () => ({ iat: 123456789 }) },
          adaptateurGestionErreur,
        });

        await middleware.verificationJWT(requete, reponse, () => {});

        expect(
          adaptateurGestionErreur.identifieUtilisateur
        ).toHaveBeenCalledWith(expect.anything(), 123456789);
      });
    });

    it('ajoute les informations de `cguAcceptees` provenant de la session à la requête', async () => {
      const middleware = leMiddleware();
      requete.session!.cguAcceptees = 'CGU';

      await middleware.verificationJWT(requete, reponse, () => {});

      expect(requete.cguAcceptees).toBe('CGU');
    });

    it('ajoute les informations de `estInvite` provenant de la session à la requête', async () => {
      const middleware = leMiddleware();
      requete.session!.estInvite = 'INVITÉ';

      await middleware.verificationJWT(requete, reponse, () => {});

      expect(requete.estInvite).toBe('INVITÉ');
    });

    it("ajoute l'utilisateur connecté à `reponse.locals`", async () => {
      const middleware = leMiddleware();

      await middleware.verificationJWT(requete, reponse, () => {});

      expect(reponse.locals.utilisateurConnecte).toEqual({
        prenomNom: 'Jean Dujardin',
        email: 'jean.dujardin@beta.gouv.com',
        estAdmin: true,
        estSuperviseur: false,
      });
    });

    describe('quand le JWT est expiré', () => {
      const adaptateurJWT = {
        decode: () => {
          throw new Error('Erreur JWT');
        },
      };
      const middleware = leMiddleware({ adaptateurJWT });

      it('redirige vers la page de connexion pour une requête de type NAVIGATION', async () => {
        requete.typeRequete = 'NAVIGATION';

        await middleware.verificationJWT(requete, reponse, () => {});

        expect(reponse.redirect).toHaveBeenCalledWith('/connexion');
      });

      it("redirige vers la page de connexion en ajoutant l'URL originale à la redirection", async () => {
        requete.typeRequete = 'NAVIGATION';
        requete.originalUrl = '/tableauDeBord';

        await middleware.verificationJWT(requete, reponse, suiteInterdite);

        expect(reponse.redirect).toHaveBeenCalledWith(
          '/connexion?urlRedirection=%2FtableauDeBord'
        );
      });

      it('retourne une erreur technique pour une requête de type API', async () => {
        requete.typeRequete = 'API';

        await middleware.verificationJWT(requete, reponse, () => {});

        expect(reponse.send).toHaveBeenCalledWith({ cause: 'TOKEN_EXPIRE' });
        expect(reponse.status).toHaveBeenCalledWith(401);
      });
    });
  });

  describe("sur vérification de l'acceptation des CGU", () => {
    beforeEach(() => {
      depotDonnees.utilisateur = () => ({
        genereToken: () => 'NOUVEAU_TOKEN',
        prenomNom: () => 'Jean Dujardin',
      });
    });

    describe('pour un utilisateur invité', () => {
      it("redirige l'utilisateur connecté via Agent Connect", async () => {
        requete.session = { ...requete.session, estInvite: true };
        const adaptateurJWT = {
          decode: () => ({ source: 'AGENT_CONNECT' }),
        };
        const middleware = leMiddleware({ adaptateurJWT });

        let suiteAppelee = false;
        await middleware.verificationAcceptationCGU(requete, reponse, () => {
          suiteAppelee = true;
        });

        expect(suiteAppelee).toBe(false);
        expect(reponse.redirect).toHaveBeenCalledWith('/oidc/connexion');
      });
    });

    describe("si l'utilisateur n'est pas un invité", () => {
      const adaptateurJWT = {
        decode: () => ({}),
      };

      it('si la dernière version des CGU est acceptée, appelle le middleware suivant', async () => {
        const middleware = leMiddleware({ adaptateurJWT });

        let suiteAppelee = false;
        await middleware.verificationAcceptationCGU(requete, reponse, () => {
          suiteAppelee = true;
        });

        expect(suiteAppelee).toBe(true);
      });

      it("si la dernière version des CGU n'est pas acceptée, redirige vers la page des cgu", async () => {
        requete.session = { ...requete.session, cguAcceptees: false };
        const middleware = leMiddleware({ adaptateurJWT });

        let suiteAppelee = false;
        await middleware.verificationAcceptationCGU(requete, reponse, () => {
          suiteAppelee = true;
        });

        expect(suiteAppelee).toBe(false);
        expect(reponse.redirect).toHaveBeenCalledWith('/cgu');
      });
    });
  });

  it('efface les cookies sur demande', async () => {
    expect(requete.session).not.toBe(null);

    const middleware = leMiddleware();
    middleware.suppressionCookie(requete, reponse, () => {});

    expect(requete.session).toBe(null);
  });

  describe("sur recherche d'un service existant", () => {
    let idService: string;

    const adaptateurJWT = {
      decode: () => ({ idUtilisateur: '999' }),
    };

    beforeEach(() => {
      idService = unUUIDRandom();
      requete.params = { id: idService };
      depotDonnees.service = () => Promise.resolve();
      depotDonnees.utilisateur = () => ({
        genereToken: () => 'NOUVEAU_TOKEN',
        prenomNom: () => 'Jean Dujardin',
      });
    });

    it("jette une erreur si l'id est invalide", async () => {
      const middleware = leMiddleware();
      requete.params = { id: 'pasUnUUID' };

      await middleware.trouveService({})(requete, reponse, suiteInterdite);

      expect(reponse.sendStatus).toHaveBeenCalledWith(400);
    });

    it("ne jette pas d'erreur si d'autres paramètres sont présent dans la requête", async () => {
      const middleware = leMiddleware();
      requete.params = { id: idService, autreParametre: 'unParametre' };

      await middleware.trouveService({})(requete, reponse, () => {});

      expect(reponse.sendStatus).not.toHaveBeenCalled();
    });

    it('requête le dépôt de données', async () => {
      const lectureService = vi.fn();
      depotDonnees.service = lectureService;
      const middleware = leMiddleware({ adaptateurJWT });

      await middleware.trouveService({})(requete, reponse, () => {});

      expect(lectureService).toHaveBeenCalledWith(idService);
    });

    it('renvoie une erreur HTTP 404 si service non trouvée', async () => {
      const middleware = leMiddleware({ adaptateurJWT });

      await middleware.trouveService({})(requete, reponse, suiteInterdite);

      expect(reponse.status).toHaveBeenCalledWith(404);
      expect(reponse.send).toHaveBeenCalledWith('Service non trouvé');
    });

    it("jette une erreur technique si l'objet de droits est incohérent", async () => {
      const middleware = leMiddleware();
      const droitsIncoherents = {
        mauvaiseCle: 'mauvaiseValeur',
      } as unknown as Partial<Droits>;

      await expect(
        middleware.trouveService(droitsIncoherents)(
          requete,
          reponse,
          suiteInterdite
        )
      ).rejects.toThrow(
        new ErreurDroitsIncoherents(
          "L'objet de droits doit être de la forme `{ [Rubrique]: niveau }`"
        )
      );
    });

    it("renvoie une erreur HTTP 403 si l'utilisateur courant n'a pas accès au service", async () => {
      depotDonnees.service = async () => ({});
      depotDonnees.accesAutorise = async () => false;
      const middleware = leMiddleware({ adaptateurJWT });

      await middleware.trouveService({})(requete, reponse, suiteInterdite);

      expect(reponse.status).toHaveBeenCalledWith(403);
      expect(reponse.render).toHaveBeenCalledWith('erreurAccesRefuse');
    });

    it("retourne une erreur HTTP 422 si le service n'a pas pu être instanciée", async () => {
      depotDonnees.service = async () => {
        throw new Error('oups');
      };
      const middleware = leMiddleware({ adaptateurJWT });

      await middleware.trouveService({})(requete, reponse, suiteInterdite);

      expect(reponse.status).toHaveBeenCalledWith(422);
      expect(reponse.send).toHaveBeenCalledWith(
        "Le service n'a pas pu être récupéré"
      );
    });

    it('retourne le service trouvé et appelle le middleware suivant', async () => {
      const service = {};
      depotDonnees.service = async () => service;
      depotDonnees.accesAutorise = async () => true;
      const middleware = leMiddleware({ adaptateurJWT });

      let appele = false;
      await middleware.trouveService({})(requete, reponse, () => {
        appele = true;
      });

      expect(appele).toBe(true);
      expect(requete.service).toBe(service);
    });
  });

  describe("sur recherche du dossier courant d'une homologation existante", () => {
    it("renvoie une erreur HTTP 404 si le service n'a pas de dossier courant'", async () => {
      requete.service = { dossierCourant: () => null } as unknown as Service;
      const middleware = leMiddleware();

      middleware.trouveDossierCourant(requete, reponse, suiteInterdite);

      expect(reponse.status).toHaveBeenCalledWith(404);
      expect(reponse.send).toHaveBeenCalledWith('Service sans dossier courant');
    });

    it("jette une erreur technique si le service n'est pas présent dans la requête", async () => {
      requete.service = undefined;
      const middleware = leMiddleware();

      expect(() =>
        middleware.trouveDossierCourant(requete, reponse, suiteInterdite)
      ).toThrow(
        new ErreurChainageMiddleware(
          'Un service doit être présent dans la requête. Manque-t-il un appel à `trouveService` ?'
        )
      );
    });

    it('retourne le dossier courant trouvé et appelle le middleware suivant', async () => {
      const dossierCourant = {};
      requete.service = {
        dossierCourant: () => dossierCourant,
      } as unknown as Service;
      const middleware = leMiddleware();

      let appele = false;
      middleware.trouveDossierCourant(requete, reponse, () => {
        appele = true;
      });

      expect(appele).toBe(true);
      expect(requete.dossierCourant).toBe(dossierCourant);
    });
  });

  describe('sur demande positionnement des headers', () => {
    const verifiePositionnementHeader = (
      nomHeader: string,
      valeurAttendue: string | RegExp
    ) => {
      const middleware = leMiddleware();
      middleware.positionneHeaders(requete, reponse, () => {});

      expect(reponse.headers).toHaveProperty(nomHeader);
      expect(reponse.headers[nomHeader]).toMatch(new RegExp(valeurAttendue));
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

    it('impose HTTPS via HSTS (deux ans, sous-domaines inclus, preload)', async () => {
      verifiePositionnementHeader(
        'strict-transport-security',
        /^max-age=63072000; includeSubDomains; preload$/
      );
    });

    it('positionne un nonce dans le reponse.locals', async () => {
      const middleware = leMiddleware({
        adaptateurChiffrement: { nonce: () => 'UN-NONCE' },
      });

      middleware.positionneHeaders(requete, reponse, () => {});

      expect(reponse.locals.nonce).toEqual('UN-NONCE');
    });
  });

  describe("sur demande de filtrage d'adresse IP", () => {
    const changeIp = (ip: string) =>
      Object.defineProperty(requete, 'ip', { value: ip, configurable: true });

    it("jette une erreur 401 si l'adresse IP n'est pas valide", async () => {
      const middleware = leMiddleware();
      changeIp('192.168.1.1');

      middleware.verificationAddresseIP(['192.168.0.1/24'])(
        requete,
        reponse,
        suiteInterdite
      );

      expect(reponse.status).toHaveBeenCalledWith(401);
      expect(reponse.send).toHaveBeenCalledWith('Non autorisé');
    });

    it("passe au middleware suivant si l'adresse est valide", async () => {
      const middleware = leMiddleware();
      changeIp('192.168.0.1');
      let appele = false;

      middleware.verificationAddresseIP(['192.168.0.1/24'])(
        requete,
        reponse,
        () => {
          appele = true;
        }
      );

      expect(appele).toBe(true);
    });
  });

  describe('sur demande de chargement des autorisations pour un service', () => {
    beforeEach(() => {
      requete.idUtilisateurCourant = ID_UTILISATEUR_COURANT;
      requete.service = { id: ID_SERVICE } as unknown as Service;
      depotDonnees.autorisationPour = async () =>
        uneAutorisation().avecDroits({}).construis();
    });

    it("jette une erreur technique si le service ou l'utilisateur ne sont pas présents dans la requête", async () => {
      requete.service = undefined;
      const middleware = leMiddleware();

      expect(() =>
        middleware.chargeAutorisationsService(requete, reponse, () => {})
      ).toThrow(
        new ErreurChainageMiddleware(
          'Un utilisateur courant et un service doivent être présent dans la requête. Manque-t-il un appel à `verificationJWT` et `trouveService` ?'
        )
      );
    });

    it("utilise le dépôt de données pour lire l'autorisation", async () => {
      const lectureAutorisation = vi
        .fn()
        .mockResolvedValue(uneAutorisation().avecDroits({}).construis());
      depotDonnees.autorisationPour = lectureAutorisation;
      const middleware = leMiddleware();

      await appelleJusquALaSuite(
        middleware.chargeAutorisationsService,
        requete,
        reponse
      );

      expect(lectureAutorisation).toHaveBeenCalledWith(
        ID_UTILISATEUR_COURANT,
        ID_SERVICE
      );
    });

    it("ajoute l'autorisation à la *`requete`* pour qu'elle soit accessibles aux routes utilisant le middleware", async () => {
      const middleware = leMiddleware();
      const autorisationChargee = uneAutorisation()
        .avecDroits({
          [DECRIRE]: ECRITURE,
          [SECURISER]: LECTURE,
          [HOMOLOGUER]: INVISIBLE,
        })
        .construis();
      depotDonnees.autorisationPour = async () => autorisationChargee;

      await appelleJusquALaSuite(
        middleware.chargeAutorisationsService,
        requete,
        reponse
      );

      expect(requete.autorisationService).toBe(autorisationChargee);
    });

    it("remanie l'objet d'autorisation à la *`reponse`* pour qu'il soit utilisable par le `.pug`", async () => {
      const middleware = leMiddleware();
      depotDonnees.autorisationPour = async () =>
        uneAutorisation()
          .avecDroits({
            [DECRIRE]: ECRITURE,
            [SECURISER]: LECTURE,
            [HOMOLOGUER]: INVISIBLE,
          })
          .construis();

      await appelleJusquALaSuite(
        middleware.chargeAutorisationsService,
        requete,
        reponse
      );

      expect(reponse.locals.autorisationsService).toEqual({
        DECRIRE: { estLectureSeule: false, estMasque: false },
        SECURISER: { estLectureSeule: true, estMasque: false },
        HOMOLOGUER: { estLectureSeule: false, estMasque: true },
        peutHomologuer: false,
      });
    });
  });

  describe("sur demande de chargement de l'état de la visite guidée", () => {
    describe('quand la fonctionnalité visite guidée est active', () => {
      let middleware: TypeMiddleware;

      beforeEach(() => {
        depotDonnees.lisParcoursUtilisateur = async () =>
          unParcoursUtilisateur({
            etatVisiteGuidee: { dejaTerminee: true },
          });

        depotDonnees.utilisateur = async () =>
          unUtilisateur()
            .quiSAppelle('Jeanne Delajardinière')
            .quiSEstInscritLe(new Date('2025-01-01'))
            .construis();

        middleware = leMiddleware();
      });

      it("jette une une erreur technique si l'utilisateur n'est pas présent dans la requête", async () => {
        requete.idUtilisateurCourant = undefined;

        await expect(
          middleware.chargeEtatVisiteGuidee(requete, reponse, suiteInterdite)
        ).rejects.toThrow(
          new ErreurChainageMiddleware(
            'Un utilisateur courant doit être présent dans la requête. Manque-t-il un appel à `verificationJWT` ?'
          )
        );
      });

      it("ajoute l'état de la visite guidée de l'utilisateur à `reponse.locals`", async () => {
        requete.idUtilisateurCourant = ID_UTILISATEUR_COURANT;

        await middleware.chargeEtatVisiteGuidee(requete, reponse, () => {});

        expect(reponse.locals.etatVisiteGuidee.dejaTerminee).toBe(true);
        expect(reponse.locals.etatVisiteGuidee.utilisateurCourant).toEqual({
          prenom: 'Jeanne',
          dateInscription: new Date('2025-01-01'),
        });
      });
    });
  });

  describe("sur demande de chargement de l'état de l'explication du nouveau référentiel", () => {
    let middleware: TypeMiddleware;

    beforeEach(() => {
      depotDonnees.lisParcoursUtilisateur = async () =>
        unParcoursUtilisateur({
          etatVisiteGuidee: { dejaTerminee: true },
          explicationNouveauReferentiel: { dejaTermine: false },
        });

      middleware = leMiddleware();
    });

    it("jette une une erreur technique si l'utilisateur n'est pas présent dans la requête", async () => {
      requete.idUtilisateurCourant = undefined;

      await expect(
        middleware.chargeExplicationNouveauReferentiel(
          requete,
          reponse,
          suiteInterdite
        )
      ).rejects.toThrow(
        new ErreurChainageMiddleware(
          'Un utilisateur courant doit être présent dans la requête. Manque-t-il un appel à `verificationJWT` ?'
        )
      );
    });

    it("ajoute l'état d'affichage de l'explication du nouveau référentiel à `reponse.locals`", async () => {
      requete.idUtilisateurCourant = ID_UTILISATEUR_COURANT;

      await middleware.chargeExplicationNouveauReferentiel(
        requete,
        reponse,
        () => {}
      );

      expect(reponse.locals.afficheExplicationNouveauReferentiel).not.toBe(
        undefined
      );
    });
  });

  it('ajoute la version de build dans `reponse.locals`, le rendant ainsi accessible aux `.pug`', async () => {
    const adaptateurEnvironnement = {
      versionDeBuild: () => '1.1',
    };
    const middleware = leMiddleware({ adaptateurEnvironnement });

    middleware.ajouteVersionFichierCompiles(requete, reponse, () => {});

    expect(reponse.locals.version).toBe('1.1');
  });

  it("ajoute l'URL de base dans `reponse.locals`, le rendant ainsi accessible aux `.pug`", async () => {
    const adaptateurEnvironnement = {
      mss: () => ({ urlBase: () => 'https://monsite.fr' }),
    };
    const middleware = leMiddleware({ adaptateurEnvironnement });

    middleware.exposeUrlBase(requete, reponse, () => {});

    expect(reponse.locals.urlBase).toBe('https://monsite.fr');
  });

  describe("concernant l'URL canonique", () => {
    const adaptateurEnvironnement = {
      mss: () => ({ urlBase: () => 'https://monsite.fr' }),
    };

    const surLaRequete = (
      chemin: string,
      methode: string,
      urlOriginale: string
    ) => {
      Object.defineProperty(requete, 'path', {
        value: chemin,
        configurable: true,
      });
      requete.method = methode;
      requete.originalUrl = urlOriginale;
    };

    it("expose l'URL canonique de la page dans `reponse.locals`", () => {
      surLaRequete('/aPropos', 'GET', '/aPropos');

      const middleware = leMiddleware({ adaptateurEnvironnement });
      middleware.positionneCanonical(requete, reponse, () => {});

      expect(reponse.locals.canonical).toBe('https://monsite.fr/aPropos');
    });

    it("exclut la chaîne de requête de l'URL canonique", () => {
      surLaRequete('/aPropos', 'GET', '/aPropos?utm_source=newsletter');

      const middleware = leMiddleware({ adaptateurEnvironnement });
      middleware.positionneCanonical(requete, reponse, () => {});

      expect(reponse.locals.canonical).toBe('https://monsite.fr/aPropos');
    });

    it('redirige en 301 vers le chemin sans slash final, en conservant la requête', () => {
      surLaRequete('/aPropos/', 'GET', '/aPropos/?utm_source=newsletter');

      const middleware = leMiddleware({ adaptateurEnvironnement });
      middleware.positionneCanonical(requete, reponse, suiteInterdite);

      expect(reponse.redirect).toHaveBeenCalledWith(
        301,
        '/aPropos?utm_source=newsletter'
      );
    });

    it('ne redirige pas la racine', () => {
      surLaRequete('/', 'GET', '/');

      let aFini = false;
      const middleware = leMiddleware({ adaptateurEnvironnement });
      middleware.positionneCanonical(requete, reponse, () => {
        aFini = true;
      });

      expect(reponse.redirect).not.toHaveBeenCalled();
      expect(aFini).toBe(true);
      expect(reponse.locals.canonical).toBe('https://monsite.fr/');
    });

    it('ne redirige pas une requête non GET comportant un slash final', () => {
      surLaRequete('/api/service/', 'POST', '/api/service/');

      let aFini = false;
      const middleware = leMiddleware({ adaptateurEnvironnement });
      middleware.positionneCanonical(requete, reponse, () => {
        aFini = true;
      });

      expect(reponse.redirect).not.toHaveBeenCalled();
      expect(aFini).toBe(true);
    });
  });

  describe('concernant le mode maintenance', () => {
    const unModeMaintenance = ({
      actif = false,
      enPreparation = false,
      detailsPreparation = '',
    } = {}) => ({
      modeMaintenance: () => ({
        actif: () => actif,
        enPreparation: () => enPreparation,
        detailsPreparation: () => detailsPreparation,
      }),
    });

    it('ajoute le contenu de la préparation de maintenance dans `reponse.locals`, le rendant ainsi accessible aux `.pug`', async () => {
      const middleware = leMiddleware({
        adaptateurEnvironnement: unModeMaintenance({
          enPreparation: true,
          detailsPreparation: 'JOUR - HEURE',
        }),
      });

      middleware.verificationModeMaintenance(requete, reponse, () => {});

      expect(reponse.locals.avertissementMaintenance).toEqual({
        jour: 'JOUR',
        heure: 'HEURE',
      });
    });

    describe('quand il est actif', () => {
      const adaptateurEnvironnement = unModeMaintenance({ actif: true });

      it('renvoie une erreur 503', () => {
        const middleware = leMiddleware({ adaptateurEnvironnement });

        middleware.verificationModeMaintenance(requete, reponse, () => {});

        expect(reponse.status).toHaveBeenCalledWith(503);
      });

      it('sert la page de maintenance', () => {
        const middleware = leMiddleware({ adaptateurEnvironnement });

        middleware.verificationModeMaintenance(requete, reponse, () => {});

        expect(reponse.render).toHaveBeenCalledWith('maintenance');
      });
    });

    describe("quand il n'est pas actif", () => {
      it('appelle le middleware suivant', () => {
        const middleware = leMiddleware({
          adaptateurEnvironnement: unModeMaintenance(),
        });

        let suiteAppelee = false;
        middleware.verificationModeMaintenance(requete, reponse, () => {
          suiteAppelee = true;
        });

        expect(suiteAppelee).toBe(true);
        expect(reponse.status).not.toHaveBeenCalled();
        expect(reponse.send).not.toHaveBeenCalled();
      });
    });
  });

  describe('concernant le type de requête', () => {
    it('sait charger le type de requête', async () => {
      const middleware = leMiddleware();

      middleware.chargeTypeRequete('API')(requete, reponse, () => {});

      expect(requete.typeRequete).toBe('API');
    });
  });

  describe("sur demande d'interdiction de mise en cache", () => {
    it('interdit la mise en cache', async () => {
      const middleware = leMiddleware();

      middleware.interdisLaMiseEnCache(requete, reponse, () => {});

      expect(reponse.headers['cache-control']).toBe(
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      );
      expect(reponse.headers.pragma).toBe('no-cache');
      expect(reponse.headers.expires).toBe('0');
      expect(reponse.headers['surrogate-control']).toBe('no-store');
    });
  });

  describe('sur demande de chargement des `feature flags`', () => {
    it('ajoute un objet de feature flags à `reponse.locals`, le rendant ainsi accessible aux `.pug`', async () => {
      const middleware = leMiddleware();

      middleware.chargeFeatureFlags(requete, reponse, () => {});

      expect(reponse.locals.featureFlags).not.toBe(undefined);
    });
  });

  describe("sur demande de chargement de l'explication des risques v2", () => {
    beforeEach(() => {
      requete.idUtilisateurCourant = ID_UTILISATEUR_COURANT;
    });

    it("ne demande pas l'affichage si l'utilisateur a déjà vu les explications", async () => {
      depotDonnees.lisParcoursUtilisateur = async () =>
        unParcoursUtilisateur({
          aVuExplicationRisquesV2: true,
        });
      const middleware = leMiddleware();

      await middleware.chargeExplicationRisquesV2(requete, reponse, () => {});

      expect(reponse.locals.afficheExplicationRisquesV2).toBe(false);
    });

    it("demande l'affichage si l'utilisateur n'a pas vu les explications", async () => {
      depotDonnees.lisParcoursUtilisateur = async () =>
        unParcoursUtilisateur({
          aVuExplicationRisquesV2: false,
        });
      const middleware = leMiddleware();

      await middleware.chargeExplicationRisquesV2(requete, reponse, () => {});

      expect(reponse.locals.afficheExplicationRisquesV2).toBe(true);
    });
  });
});
