import request from 'supertest';
import { creeServeurApiPublique } from '../../src/apiPublique/mssApiPublique.js';
import { depotVide } from '../depots/depotVide.js';
import { unUUID } from '../constructeurs/UUID.ts';
import { DepotDonnees } from '../../src/depotDonnees.interface.ts';
import { AdaptateurGestionErreur } from '../../src/adaptateurs/adaptateurGestionErreur.interface.ts';
import {
  AdaptateurAuditApiPublique,
  TraceAuditApiPublique,
} from '../../src/adaptateurs/adaptateurAuditApiPublique.interface.ts';
import { UUID } from '../../src/typesBasiques.ts';

describe("Le serveur d'API publique", () => {
  let depotDonnees: DepotDonnees;
  let erreursLoguees: Error[];
  let enTeteAuthorization: string;
  let idCleApi: UUID;
  let traces: TraceAuditApiPublique[];
  let adaptateurAuditApiPublique: AdaptateurAuditApiPublique;

  beforeEach(async () => {
    depotDonnees = await depotVide();
    erreursLoguees = [];
    traces = [];
    adaptateurAuditApiPublique = {
      trace: async (trace) => {
        traces.push(trace);
      },
    };
    const { cle, valeurEnClair } = await depotDonnees.nouvelleCle(
      unUUID('U'),
      30
    );
    idCleApi = cle.donnees().id;
    enTeteAuthorization = `Bearer ${valeurEnClair}`;
  });

  const uneApp = (limiteDeDebit?: {
    fenetreMs: number;
    maxParFenetre: number;
  }) =>
    creeServeurApiPublique({
      depotDonnees,
      urlBaseMss: 'https://mss.example.org',
      adaptateurGestionErreur: {
        logueErreur: (erreur: Error) => {
          erreursLoguees.push(erreur);
        },
      } as AdaptateurGestionErreur,
      adaptateurAuditApiPublique,
      limiteDeDebit,
    }).app;

  it("n'annonce pas la technologie du serveur", async () => {
    const reponse = await request(uneApp())
      .get('/v1/services')
      .set('Authorization', enTeteAuthorization);

    expect(reponse.headers['x-powered-by']).toBeUndefined();
  });

  describe('concernant les en-têtes de sécurité', () => {
    it("applique une politique de sécurité du contenu qui interdit tout chargement de ressource sur les routes de l'API", async () => {
      const reponse = await request(uneApp())
        .get('/v1/services')
        .set('Authorization', enTeteAuthorization);

      const csp = reponse.headers['content-security-policy'];
      expect(csp).toContain("default-src 'none'");
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('positionne les en-têtes de durcissement usuels', async () => {
      const reponse = await request(uneApp())
        .get('/v1/services')
        .set('Authorization', enTeteAuthorization);

      expect(reponse.headers['x-content-type-options']).toBe('nosniff');
      expect(reponse.headers['x-frame-options']).toBe('DENY');
      expect(reponse.headers['referrer-policy']).toBe('no-referrer');
      expect(reponse.headers['strict-transport-security']).toContain(
        'max-age='
      );
    });

    it('protège aussi les réponses des routes inconnues', async () => {
      const reponse = await request(uneApp()).get('/inconnue');

      expect(reponse.status).toBe(404);
      expect(reponse.headers['content-security-policy']).toContain(
        "default-src 'none'"
      );
    });
  });

  it("fait confiance au nombre de proxys configuré pour déterminer l'adresse IP du client", () => {
    const { app } = creeServeurApiPublique({
      urlBaseMss: 'https://mss.example.org',
      depotDonnees,
      adaptateurGestionErreur: {} as AdaptateurGestionErreur,
      adaptateurAuditApiPublique,
      trustProxy: 2,
    });

    expect(app.get('trust proxy')).toBe(2);
  });

  describe('sur une route inconnue', () => {
    it('renvoie une 404 en JSON', async () => {
      const reponse = await request(uneApp())
        .get('/v1/inconnue')
        .set('Authorization', enTeteAuthorization);

      expect(reponse.status).toBe(404);
      expect(reponse.body).toEqual({ erreur: 'RESSOURCE_INEXISTANTE' });
    });
  });

  describe('sur une erreur inattendue', () => {
    beforeEach(() => {
      depotDonnees.services = async () => {
        throw new Error('Base indisponible');
      };
    });

    it('renvoie une 500 en JSON, sans détail interne', async () => {
      const reponse = await request(uneApp())
        .get('/v1/services')
        .set('Authorization', enTeteAuthorization);

      expect(reponse.status).toBe(500);
      expect(reponse.body).toEqual({ erreur: 'ERREUR_INTERNE' });
    });

    it("logue l'erreur", async () => {
      await request(uneApp())
        .get('/v1/services')
        .set('Authorization', enTeteAuthorization);

      expect(erreursLoguees.map((e) => e.message)).toEqual([
        'Base indisponible',
      ]);
    });
  });

  describe("concernant la limitation par clé d'API", () => {
    it("renvoie 429 au-delà du quota configuré, avec le délai d'attente", async () => {
      const app = uneApp({ fenetreMs: 60_000, maxParFenetre: 1 });
      await request(app)
        .get('/v1/services')
        .set('Authorization', enTeteAuthorization);

      const reponse = await request(app)
        .get('/v1/services')
        .set('Authorization', enTeteAuthorization);

      expect(reponse.status).toBe(429);
      expect(reponse.body).toEqual({ erreur: 'QUOTA_DEPASSE' });
      expect(reponse.headers['retry-after']).toBeDefined();
    });

    it('ne trace pas un appel refusé pour quota dépassé', async () => {
      const app = uneApp({ fenetreMs: 60_000, maxParFenetre: 1 });
      await request(app)
        .get('/v1/services')
        .set('Authorization', enTeteAuthorization);

      await request(app)
        .get('/v1/services')
        .set('Authorization', enTeteAuthorization);

      expect(traces).toHaveLength(1);
    });
  });

  describe("concernant l'audit des appels", () => {
    it('trace un appel authentifié', async () => {
      await request(uneApp())
        .get('/v1/services')
        .set('Authorization', enTeteAuthorization);

      expect(traces).toEqual([
        {
          idCleApi,
          idUtilisateur: unUUID('U'),
          route: '/v1/services',
          adresseIp: expect.any(String),
        },
      ]);
    });

    it("ne trace pas un appel sans clé d'API valide", async () => {
      await request(uneApp()).get('/v1/services');

      expect(traces).toEqual([]);
    });
  });
});
