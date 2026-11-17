import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import supertest from 'supertest';
import { controleurPageErreur } from '../../src/http/controleurPageErreur.js';

const ID_SENTRY = 'id-sentry-de-test';

const simuleSentry = (
  erreur: Error,
  _requete: Request,
  reponse: Response & { sentry?: string },
  suite: NextFunction
) => {
  reponse.sentry = ID_SENTRY;
  suite(erreur);
};

const creeServeurDeTest = (handler: RequestHandler) => {
  const app = express();
  app.engine('pug', (_chemin, options, rappel) =>
    rappel(null, `Page d'erreur ${(options as { idSentry: string }).idSentry}`)
  );
  app.set('view engine', 'pug');
  app.set('views', './src/vues');
  app.get('/', handler);
  app.use(simuleSentry);
  app.use(controleurPageErreur);
  return app;
};

const appelle = (handler: RequestHandler) =>
  supertest(creeServeurDeTest(handler)).get('/');

describe("Le contrôleur de la page d'erreur", () => {
  describe('quand un handler répond avec `reponse.sendStatus`', () => {
    it("n'est pas sollicité : le statut et le corps du handler sont conservés", async () => {
      const resultat = await appelle((_requete, reponse) => {
        reponse.sendStatus(403);
      });

      expect(resultat.status).toEqual(403);
      expect(resultat.text).toEqual('Forbidden');
    });
  });

  describe('quand un handler appelle `suite(erreur)`', () => {
    it("rend la page d'erreur en 500 si rien ne précise le statut", async () => {
      const resultat = await appelle((_requete, _reponse, suite) => {
        suite(new Error('Boum'));
      });

      expect(resultat.status).toEqual(500);
      expect(resultat.text).toEqual(`Page d'erreur ${ID_SENTRY}`);
    });

    it("utilise le statut porté par l'erreur", async () => {
      const resultat = await appelle((_requete, _reponse, suite) => {
        suite(Object.assign(new Error('Requête invalide'), { status: 400 }));
      });

      expect(resultat.status).toEqual(400);
      expect(resultat.text).toEqual(`Page d'erreur ${ID_SENTRY}`);
    });

    it('conserve le statut positionné sur la réponse par le handler', async () => {
      const resultat = await appelle((_requete, reponse, suite) => {
        reponse.status(503);
        suite(new Error('Indisponible'));
      });

      expect(resultat.status).toEqual(503);
      expect(resultat.text).toEqual(`Page d'erreur ${ID_SENTRY}`);
    });

    it("laisse Express gérer une erreur CSRF, sans page d'erreur", async () => {
      const resultat = await appelle((_requete, _reponse, suite) => {
        suite(new Error('CSRF token mismatch'));
      });

      expect(resultat.status).toEqual(500);
      expect(resultat.text).not.toContain("Page d'erreur");
    });
  });

  describe('quand un handler lève une exception non catchée', () => {
    it("rend la page d'erreur en 500 pour une exception synchrone", async () => {
      const resultat = await appelle(() => {
        throw new Error('Boum');
      });

      expect(resultat.status).toEqual(500);
      expect(resultat.text).toEqual(`Page d'erreur ${ID_SENTRY}`);
    });

    it("rend la page d'erreur en 500 pour une promesse rejetée", async () => {
      const resultat = await appelle(async () => {
        throw new Error('Boum');
      });

      expect(resultat.status).toEqual(500);
      expect(resultat.text).toEqual(`Page d'erreur ${ID_SENTRY}`);
    });
  });
});
