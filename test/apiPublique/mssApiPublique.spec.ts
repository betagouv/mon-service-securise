import request from 'supertest';
import { creeServeurApiPublique } from '../../src/apiPublique/mssApiPublique.js';
import { depotVide } from '../depots/depotVide.js';
import { unUUID } from '../constructeurs/UUID.ts';
import { DepotDonnees } from '../../src/depotDonnees.interface.ts';
import { AdaptateurGestionErreur } from '../../src/adaptateurs/adaptateurGestionErreur.interface.ts';

describe("Le serveur d'API publique", () => {
  let depotDonnees: DepotDonnees;
  let erreursLoguees: Error[];
  let enTeteAuthorization: string;

  beforeEach(async () => {
    depotDonnees = await depotVide();
    erreursLoguees = [];
    const { valeurEnClair } = await depotDonnees.nouvelleCle(unUUID('U'), 30);
    enTeteAuthorization = `Bearer ${valeurEnClair}`;
  });

  const uneApp = (limiteDeDebit?: {
    fenetreMs: number;
    maxParFenetre: number;
  }) =>
    creeServeurApiPublique({
      depotDonnees,
      adaptateurGestionErreur: {
        logueErreur: (erreur: Error) => {
          erreursLoguees.push(erreur);
        },
      } as AdaptateurGestionErreur,
      limiteDeDebit,
    }).app;

  it("n'annonce pas la technologie du serveur", async () => {
    const reponse = await request(uneApp())
      .get('/v1/services')
      .set('Authorization', enTeteAuthorization);

    expect(reponse.headers['x-powered-by']).toBeUndefined();
  });

  it("fait confiance au nombre de proxys configuré pour déterminer l'adresse IP du client", () => {
    const { app } = creeServeurApiPublique({
      depotDonnees,
      adaptateurGestionErreur: {} as AdaptateurGestionErreur,
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
  });
});
