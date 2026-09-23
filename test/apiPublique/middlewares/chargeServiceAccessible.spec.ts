import express from 'express';
import request from 'supertest';
import {
  chargeServiceAccessible,
  RequeteServiceApiPublique,
} from '../../../src/apiPublique/middlewares/chargeServiceAccessible.js';
import { depotVide } from '../../depots/depotVide.js';
import { unServiceV2 } from '../../constructeurs/constructeurService.js';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import { DepotDonnees } from '../../../src/depotDonnees.interface.js';
import { UUID } from '../../../src/typesBasiques.js';

const { LECTURE, INVISIBLE } = Permissions;
const { SECURISER } = Rubriques;

describe("Le middleware de chargement d'un service accessible", () => {
  let depotDonnees: DepotDonnees;
  let idService: UUID;

  const uneAutorisationAvecDroits = (droits: object) =>
    uneAutorisation()
      .deContributeur(unUUID('U'), idService)
      .avecDroits(droits)
      .construis();

  beforeEach(async () => {
    idService = unUUIDRandom();
    depotDonnees = await depotVide();
    depotDonnees.service = async () =>
      unServiceV2().avecId(idService).construis();
    depotDonnees.autorisationPour = async () =>
      uneAutorisationAvecDroits({ [SECURISER]: LECTURE });
  });

  const uneApp = () => {
    const app = express();
    app.use((requete: RequeteServiceApiPublique, _reponse, suite) => {
      requete.idUtilisateurCourant = unUUID('U');
      suite();
    });
    app.get(
      '/services/:id',
      chargeServiceAccessible({ depotDonnees })({ [SECURISER]: LECTURE }),
      (requete: RequeteServiceApiPublique, reponse) => {
        reponse.json({ idService: requete.service!.id });
      }
    );
    return app;
  };

  it('charge le service dans la requête', async () => {
    const reponse = await request(uneApp()).get(`/services/${idService}`);

    expect(reponse.status).toBe(200);
    expect(reponse.body).toEqual({ idService });
  });

  it("renvoie une erreur 400 si l'identifiant n'est pas un UUID", async () => {
    const reponse = await request(uneApp()).get('/services/pas-un-uuid');

    expect(reponse.status).toBe(400);
    expect(reponse.body).toEqual({ erreur: 'PARAMETRE_INVALIDE' });
  });

  it("renvoie une erreur 404 si l'utilisateur n'a pas accès au service", async () => {
    depotDonnees.autorisationPour = async () => undefined;

    const reponse = await request(uneApp()).get(`/services/${idService}`);

    expect(reponse.status).toBe(404);
    expect(reponse.body).toEqual({ erreur: 'RESSOURCE_INEXISTANTE' });
  });

  it("renvoie une erreur 404 si le service n'existe pas", async () => {
    depotDonnees.service = async () => undefined;

    const reponse = await request(uneApp()).get(`/services/${idService}`);

    expect(reponse.status).toBe(404);
    expect(reponse.body).toEqual({ erreur: 'RESSOURCE_INEXISTANTE' });
  });

  it("renvoie une erreur 403 si l'utilisateur n'a pas les droits requis", async () => {
    depotDonnees.autorisationPour = async () =>
      uneAutorisationAvecDroits({ [SECURISER]: INVISIBLE });

    const reponse = await request(uneApp()).get(`/services/${idService}`);

    expect(reponse.status).toBe(403);
    expect(reponse.body).toEqual({ erreur: 'DROITS_INSUFFISANTS' });
  });
});
