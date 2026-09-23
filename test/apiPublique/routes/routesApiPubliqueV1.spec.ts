import request from 'supertest';
import { creeServeurApiPublique } from '../../../src/apiPublique/mssApiPublique.js';
import { depotVide } from '../../depots/depotVide.js';
import { unServiceV2 } from '../../constructeurs/constructeurService.js';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.ts';
import { schemaReponseServices } from '../../../src/apiPublique/schemas/services.schema.ts';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.ts';
import { DepotDonnees } from '../../../src/depotDonnees.interface.ts';
import { AdaptateurGestionErreur } from '../../../src/adaptateurs/adaptateurGestionErreur.interface.ts';

const { LECTURE, INVISIBLE } = Permissions;
const { DECRIRE } = Rubriques;

describe("Les routes d'API publique `/v1`", () => {
  let depotDonnees: DepotDonnees;
  let enTeteAuthorization: string;

  beforeEach(async () => {
    depotDonnees = await depotVide();
    const { valeurEnClair } = await depotDonnees.nouvelleCle(unUUID('U'), 30);
    enTeteAuthorization = `Bearer ${valeurEnClair}`;
  });

  const uneApp = () =>
    creeServeurApiPublique({
      depotDonnees,
      urlBaseMss: 'https://mss.example.org',
      adaptateurGestionErreur: {
        logueErreur: () => {},
      } as unknown as AdaptateurGestionErreur,
      adaptateurAuditApiPublique: { trace: async () => {} },
    }).app;

  const unServiceDeLyon = () =>
    unServiceV2()
      .avecId(unUUID('S'))
      .avecNomService("Téléservice de demande d'aide")
      .avecOrganisationResponsable({
        nom: 'Ville de Lyon',
        siret: '21690123400015',
        departement: '69',
      })
      .avecNContributeurs(4)
      .construis();

  describe('sur GET /v1/services', () => {
    it("exige une clé d'API", async () => {
      const reponse = await request(uneApp()).get('/v1/services');

      expect(reponse.status).toBe(401);
    });

    it("renvoie les services de l'utilisateur à qui appartient la clé", async () => {
      depotDonnees.services = async () => [unServiceDeLyon()];
      depotDonnees.autorisations = async () => [
        uneAutorisation()
          .deContributeur(unUUID('U'), unUUID('S'))
          .avecDroits({ [DECRIRE]: LECTURE })
          .construis(),
      ];

      const reponse = await request(uneApp())
        .get('/v1/services')
        .set('Authorization', enTeteAuthorization);

      expect(reponse.status).toBe(200);
      expect(reponse.body).toEqual({
        donnees: [
          {
            id: unUUID('S'),
            nom: "Téléservice de demande d'aide",
            organisationResponsable: {
              nom: 'Ville de Lyon',
              siret: '21690123400015',
            },
            nombreContributeurs: 4,
            niveauSecurite: 'niveau3',
          },
        ],
      });
    });

    it('renvoie une réponse conforme au schéma documenté', async () => {
      const idService = unUUIDRandom();
      depotDonnees.services = async () => [
        unServiceV2().avecId(idService).construis(),
      ];
      depotDonnees.autorisations = async () => [
        uneAutorisation()
          .deContributeur(unUUID('U'), idService)
          .avecDroits({ [DECRIRE]: LECTURE })
          .construis(),
      ];

      const reponse = await request(uneApp())
        .get('/v1/services')
        .set('Authorization', enTeteAuthorization);

      expect(schemaReponseServices.safeParse(reponse.body).success).toBe(true);
    });

    it("renvoie `null` pour le nom et le SIRET de l'organisation quand ils ne sont pas renseignés", async () => {
      depotDonnees.services = async () => [
        unServiceV2()
          .avecId(unUUID('S'))
          .avecOrganisationResponsable({})
          .construis(),
      ];
      depotDonnees.autorisations = async () => [
        uneAutorisation().deContributeur(unUUID('U'), unUUID('S')).construis(),
      ];

      const reponse = await request(uneApp())
        .get('/v1/services')
        .set('Authorization', enTeteAuthorization);

      expect(reponse.body.donnees[0].organisationResponsable).toEqual({
        nom: null,
        siret: null,
      });
    });

    it("n'expose pas le niveau de sécurité sans le droit de lire la description du service", async () => {
      depotDonnees.services = async () => [unServiceDeLyon()];
      depotDonnees.autorisations = async () => [
        uneAutorisation()
          .deContributeur(unUUID('U'), unUUID('S'))
          .avecDroits({ [DECRIRE]: INVISIBLE })
          .construis(),
      ];

      const reponse = await request(uneApp())
        .get('/v1/services')
        .set('Authorization', enTeteAuthorization);

      expect(reponse.body.donnees[0]).not.toHaveProperty('niveauSecurite');
    });
  });
});
