import expect from 'expect.js';
import testeurMSS from '../testeurMSS.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import ActiviteMesure from '../../../src/modeles/activiteMesure.js';
import { unService } from '../../constructeurs/constructeurService.js';
import Mesures from '../../../src/modeles/mesures.js';
import { unUUIDRandom } from '../../constructeurs/UUID.js';
import { creeReferentiel } from '../../../src/referentiel.js';

const { LECTURE, ECRITURE } = Permissions;
const { SECURISER } = Rubriques;

describe('Le serveur MSS des routes privées `/api/service/:id/mesures/:id/activites`', () => {
  const testeur = testeurMSS();
  const idService = unUUIDRandom();

  beforeEach(async () => {
    const referentiel = creeReferentiel({
      mesures: {
        audit: { identifiantNumerique: '0007', categorie: 'gouvernance' },
      },
      categoriesMesures: { gouvernance: {} },
    });
    await testeur.initialise(referentiel);
  });

  describe('quand requête GET sur `/api/service/:id/mesures/:id/activites`', () => {
    beforeEach(() => {
      testeur.depotDonnees().lisActivitesMesure = () => [];
      testeur.middleware().reinitialise({
        idUtilisateur: 'U1',
        serviceARenvoyer: unService(testeur.referentiel())
          .avecId(idService)
          .construis(),
      });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: SECURISER }],
          testeur.app(),
          {
            method: 'get',
            url: `/api/service/${idService}/mesures/audit/activites`,
          }
        );
    });

    it("renvoie 400 si l'id de la mesure est invalide", async () => {
      const reponse = await testeur.get(
        `/api/service/${idService}/mesures/uneMesureQuiNexistePas/activites`
      );

      expect(reponse.status).to.be(400);
    });

    it.each([
      { valeurValide: unUUIDRandom() },
      { valeurValide: 'RECENSEMENT.1' },
      { valeurValide: 'audit' },
    ])(
      'accepte les id de mesure v1, v2, et uuid pour les spécifiques: $valeurValide',
      async ({ valeurValide }) => {
        const reponse = await testeur.get(
          `/api/service/${idService}/mesures/${valeurValide}/activites`
        );

        expect(reponse.status).to.be(200);
      }
    );

    it('renvoie la liste des activités de la mesure', async () => {
      testeur.middleware().reinitialise({
        idUtilisateur: 'U1',
        serviceARenvoyer: unService(testeur.referentiel())
          .avecId(idService)
          .construis(),
      });
      testeur.depotDonnees().lisActivitesMesure = () => [
        new ActiviteMesure({
          idActeur: '9724853e-037c-4bca-9350-0a4b14a85a29',
          date: new Date('2024-09-29 11:15:02.817 +0200'),
          idMesure: 'audit',
          type: 'ajoutPriorite',
          details: { nouvelleValeur: 'p3' },
          typeMesure: 'generale',
        }),
      ];

      const reponse = await testeur.get(
        `/api/service/${idService}/mesures/audit/activites`
      );

      expect(reponse.status).to.be(200);
      expect(reponse.body).to.eql([
        {
          date: '2024-09-29T09:15:02.817Z',
          idActeur: '9724853e-037c-4bca-9350-0a4b14a85a29',
          identifiantNumeriqueMesure: '0007',
          type: 'ajoutPriorite',
          details: { nouvelleValeur: 'p3' },
        },
      ]);
    });

    it('retourne uniquement les activités de la mesure et du service', async () => {
      let idServiceUtilise;
      let idMesureUtilise;
      testeur.depotDonnees().lisActivitesMesure = (idS, idMesure) => {
        idServiceUtilise = idS;
        idMesureUtilise = idMesure;
        return [];
      };

      await testeur.get(`/api/service/${idService}/mesures/audit/activites`);

      expect(idServiceUtilise).to.be(idService);
      expect(idMesureUtilise).to.be('audit');
    });

    it('fournit un identificant numérique pour les mesures spécifiques', async () => {
      testeur.depotDonnees().lisActivitesMesure = () => [
        new ActiviteMesure({
          idActeur: '9724853e-037c-4bca-9350-0a4b14a85a29',
          date: new Date('2024-09-29 11:15:02.817 +0200'),
          idMesure: 'a13ec795-0043-4622-8a36-0670198b6460',
          type: 'ajoutPriorite',
          details: { nouvelleValeur: 'p3' },
          typeMesure: 'specifique',
        }),
      ];

      const reponse = await testeur.get(
        `/api/service/${idService}/mesures/audit/activites`
      );

      expect(reponse.body[0].identifiantNumeriqueMesure).to.be(undefined);
    });
  });

  describe('quand requête POST sur `/api/service/:id/mesures/:id/activites/commentaires`', () => {
    beforeEach(() => {
      testeur.referentiel().enrichis({
        mesures: { audit: {} },
      });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: SECURISER }],
          testeur.app(),
          {
            method: 'post',
            url: `/api/service/${idService}/mesures/audit/activites/commentaires`,
          }
        );
    });

    it('aseptise les paramètres', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(['contenu'], testeur.app(), {
          method: 'post',
          url: `/api/service/${idService}/mesures/audit/activites/commentaires`,
        });
    });

    describe("délègue au dépôt de données l'enregistrement du commentaire", () => {
      it("dans le cas d'une mesure générale", async () => {
        testeur.referentiel().enrichis({
          mesures: { audit: {} },
        });
        testeur.middleware().reinitialise({
          idUtilisateur: 'U1',
          serviceARenvoyer: unService(testeur.referentiel())
            .avecId(idService)
            .construis(),
        });
        let activiteRecue;
        testeur.depotDonnees().ajouteActiviteMesure = (activite) => {
          activiteRecue = activite;
        };

        await testeur.post(
          `/api/service/${idService}/mesures/audit/activites/commentaires`,
          {
            contenu: 'mon commentaire',
          }
        );

        expect(activiteRecue).to.be.an(ActiviteMesure);
        expect(activiteRecue).to.eql(
          new ActiviteMesure({
            idService,
            idActeur: 'U1',
            type: 'ajoutCommentaire',
            details: { contenu: 'mon commentaire' },
            idMesure: 'audit',
            typeMesure: 'generale',
          })
        );
      });

      it("dans le cas d'une mesure spécifique", async () => {
        testeur.middleware().reinitialise({
          idUtilisateur: 'U1',
          serviceARenvoyer: unService()
            .avecId(idService)
            .avecMesures(
              new Mesures(
                { mesuresGenerales: [], mesuresSpecifiques: [{ id: 'MS1' }] },
                testeur.referentiel(),
                {}
              )
            )
            .construis(),
        });
        let activiteRecue;
        testeur.depotDonnees().ajouteActiviteMesure = (activite) => {
          activiteRecue = activite;
        };

        await testeur.post(
          `/api/service/${idService}/mesures/MS1/activites/commentaires`,
          {
            contenu: 'mon commentaire',
          }
        );

        expect(activiteRecue).to.be.an(ActiviteMesure);
        expect(activiteRecue).to.eql(
          new ActiviteMesure({
            idService,
            idActeur: 'U1',
            type: 'ajoutCommentaire',
            details: { contenu: 'mon commentaire' },
            idMesure: 'MS1',
            typeMesure: 'specifique',
          })
        );
      });
    });

    it('jette une erreur 404 si la mesure est introuvable', async () => {
      const reponse = await testeur.post(
        `/api/service/${idService}/mesures/idMesureInconnu/activites/commentaires`
      );

      expect(reponse.status).to.be(404);
    });
  });
});
