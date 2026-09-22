import express from 'express';
import request from 'supertest';
import { limiteDeDebitParCleApi } from '../../../src/apiPublique/middlewares/limiteDeDebitParCleApi.js';
import { RequeteApiPublique } from '../../../src/apiPublique/middlewares/authentificationParCleApi.js';
import { unUUID } from '../../constructeurs/UUID.js';
import { UUID } from '../../../src/typesBasiques.ts';

describe("Le middleware de limite de débit par clé d'API", () => {
  const uneApp = ({ maxParFenetre }: { maxParFenetre: number }) => {
    const app = express();
    app.use((requete: RequeteApiPublique, _reponse, suite) => {
      requete.idCleApiCourante =
        (requete.headers['x-test-cle'] as UUID) ?? unUUID('C');
      suite();
    });
    app.use(limiteDeDebitParCleApi({ fenetreMs: 60_000, maxParFenetre }));
    app.get('/ressource', (_requete, reponse) => reponse.json({ ok: true }));
    return app;
  };

  it('laisse passer les requêtes sous le quota', async () => {
    const app = uneApp({ maxParFenetre: 2 });

    const premiere = await request(app).get('/ressource');
    const seconde = await request(app).get('/ressource');

    expect(premiere.status).toBe(200);
    expect(seconde.status).toBe(200);
  });

  it('refuse une requête au-delà du quota', async () => {
    const app = uneApp({ maxParFenetre: 1 });

    const premiere = await request(app).get('/ressource');
    const seconde = await request(app).get('/ressource');

    expect(premiere.status).toBe(200);
    expect(seconde.status).toBe(429);
    expect(seconde.body).toEqual({ erreur: 'QUOTA_DEPASSE' });
  });

  it("indique le délai d'attente dans l'en-tête `Retry-After`", async () => {
    const app = uneApp({ maxParFenetre: 1 });

    await request(app).get('/ressource');
    const reponse = await request(app).get('/ressource');

    expect(reponse.headers['retry-after']).toBeDefined();
    expect(Number(reponse.headers['retry-after'])).toBeGreaterThan(0);
  });

  it("partitionne le quota par clé d'API, pas globalement", async () => {
    const app = uneApp({ maxParFenetre: 1 });

    await request(app).get('/ressource').set('X-Test-Cle', unUUID('A'));
    const reponsePourA = await request(app)
      .get('/ressource')
      .set('X-Test-Cle', unUUID('A'));
    const reponsePourB = await request(app)
      .get('/ressource')
      .set('X-Test-Cle', unUUID('B'));

    expect(reponsePourA.status).toBe(429);
    expect(reponsePourB.status).toBe(200);
  });
});
