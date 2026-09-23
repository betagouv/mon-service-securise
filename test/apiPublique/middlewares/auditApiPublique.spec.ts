import express, { NextFunction, Response } from 'express';
import request from 'supertest';
import { auditApiPublique } from '../../../src/apiPublique/middlewares/auditApiPublique.js';
import { RequeteApiPublique } from '../../../src/apiPublique/middlewares/authentificationParCleApi.js';
import {
  AdaptateurAuditApiPublique,
  TraceAuditApiPublique,
} from '../../../src/adaptateurs/adaptateurAuditApiPublique.interface.js';
import { unUUID } from '../../constructeurs/UUID.js';
import { AdaptateurGestionErreur } from '../../../src/adaptateurs/adaptateurGestionErreur.interface.ts';

describe("Le middleware d'audit de l'API publique", () => {
  let traces: TraceAuditApiPublique[];
  let erreursLoguees: Error[];
  let adaptateurAuditApiPublique: AdaptateurAuditApiPublique;

  beforeEach(() => {
    traces = [];
    erreursLoguees = [];
    adaptateurAuditApiPublique = {
      trace: async (trace) => {
        traces.push(trace);
      },
    };
  });

  const authentificationSimulee = (
    requete: RequeteApiPublique,
    _reponse: Response,
    suite: NextFunction
  ) => {
    requete.idCleApiCourante = unUUID('C');
    requete.idUtilisateurCourant = unUUID('U');
    suite();
  };

  const uneApp = () => {
    const app = express();
    app.set('trust proxy', 1);
    app.use(
      '/v1',
      authentificationSimulee,
      auditApiPublique({
        adaptateurAuditApiPublique,
        adaptateurGestionErreur: {
          logueErreur: (erreur: Error) => {
            erreursLoguees.push(erreur);
          },
        } as unknown as AdaptateurGestionErreur,
      })
    );
    app.get('/v1/ressource', (_requete, reponse) => {
      reponse.json({ ok: true });
    });
    return app;
  };

  it("trace la clé, l'utilisateur, le chemin de la route et l'adresse IP du client", async () => {
    await request(uneApp())
      .get('/v1/ressource?filtre=abc')
      .set('X-Forwarded-For', '1.2.3.4');

    expect(traces).toEqual([
      {
        idCleApi: unUUID('C'),
        idUtilisateur: unUUID('U'),
        route: '/v1/ressource',
        adresseIp: '1.2.3.4',
      },
    ]);
  });

  describe("lorsque l'enregistrement de la trace échoue", () => {
    beforeEach(() => {
      adaptateurAuditApiPublique.trace = async () => {
        throw new Error('Base indisponible');
      };
    });

    it('laisse passer la requête', async () => {
      const reponse = await request(uneApp()).get('/v1/ressource');

      expect(reponse.status).toBe(200);
      expect(reponse.body).toEqual({ ok: true });
    });

    it("logue l'erreur", async () => {
      await request(uneApp()).get('/v1/ressource');

      expect(erreursLoguees.map((e) => e.message)).toEqual([
        'Base indisponible',
      ]);
    });
  });
});
