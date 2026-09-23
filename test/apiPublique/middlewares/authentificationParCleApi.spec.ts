import express from 'express';
import request from 'supertest';
import {
  authentificationParCleApi,
  RequeteApiPublique,
} from '../../../src/apiPublique/middlewares/authentificationParCleApi.js';
import { DepotDonneesClesApi } from '../../../src/depots/depotDonneesClesApi.js';
import { unePersistanceMemoireTS } from '../../constructeurs/constructeurAdaptateurPersistanceMemoireTS.js';
import { unUUID } from '../../constructeurs/UUID.js';
import { fabriqueBusPourLesTests } from '../../bus/aides/busPourLesTests.js';
import BusEvenements from '../../../src/bus/busEvenements.js';

describe("Le middleware d'authentification par clé d'API", () => {
  let depotClesApi: DepotDonneesClesApi;

  beforeEach(() => {
    depotClesApi = new DepotDonneesClesApi({
      adaptateurPersistanceTS: unePersistanceMemoireTS().construis(),
      adaptateurChiffrement: {
        hacheSha256: (chaine: string) => `v1:${chaine}-hachee`,
      },
      busEvenements: fabriqueBusPourLesTests() as unknown as BusEvenements,
    });
  });

  const uneApp = () => {
    const app = express();
    app.use(authentificationParCleApi({ depotDonnees: depotClesApi }));
    app.get('/ressource', (requete: RequeteApiPublique, reponse) => {
      reponse.json({
        idUtilisateur: requete.idUtilisateurCourant,
        idCleApi: requete.idCleApiCourante,
      });
    });
    return app;
  };

  const verifieRefus = (reponse: request.Response) => {
    expect(reponse.status).toBe(401);
    expect(reponse.headers['www-authenticate']).toBe('Bearer');
    expect(reponse.body).toEqual({ erreur: 'CLE_API_INVALIDE' });
  };

  it('refuse une requête sans en-tête `Authorization`', async () => {
    const reponse = await request(uneApp()).get('/ressource');

    verifieRefus(reponse);
  });

  it("refuse une requête dont l'en-tête `Authorization` n'est pas de type `Bearer`", async () => {
    const { valeurEnClair } = await depotClesApi.nouvelleCle(unUUID('U'), 30);

    const reponse = await request(uneApp())
      .get('/ressource')
      .set('Authorization', `Basic ${valeurEnClair}`);

    verifieRefus(reponse);
  });

  it('refuse une clé inconnue', async () => {
    const reponse = await request(uneApp())
      .get('/ressource')
      .set('Authorization', 'Bearer mss_live_7f3a91c4_inconnue');

    verifieRefus(reponse);
  });

  it('refuse une clé révoquée', async () => {
    const { cle, valeurEnClair } = await depotClesApi.nouvelleCle(
      unUUID('U'),
      30
    );
    await depotClesApi.revoqueCle(cle.donnees().id, unUUID('U'));

    const reponse = await request(uneApp())
      .get('/ressource')
      .set('Authorization', `Bearer ${valeurEnClair}`);

    verifieRefus(reponse);
  });

  it('refuse une clé expirée', async () => {
    const { valeurEnClair } = await depotClesApi.nouvelleCle(unUUID('U'), -1);

    const reponse = await request(uneApp())
      .get('/ressource')
      .set('Authorization', `Bearer ${valeurEnClair}`);

    verifieRefus(reponse);
  });

  it("accepte une clé valide et identifie l'utilisateur à qui elle appartient", async () => {
    const { cle, valeurEnClair } = await depotClesApi.nouvelleCle(
      unUUID('U'),
      30
    );

    const reponse = await request(uneApp())
      .get('/ressource')
      .set('Authorization', `Bearer ${valeurEnClair}`);

    expect(reponse.status).toBe(200);
    expect(reponse.body).toEqual({
      idUtilisateur: unUUID('U'),
      idCleApi: cle.donnees().id,
    });
  });
});
