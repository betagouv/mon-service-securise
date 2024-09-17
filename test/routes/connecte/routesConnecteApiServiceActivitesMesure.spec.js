const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');
const {
  Permissions,
  Rubriques,
} = require('../../../src/modeles/autorisations/gestionDroits');
const ActiviteMesure = require('../../../src/modeles/activiteMesure');
const { unService } = require('../../constructeurs/constructeurService');
const Mesures = require('../../../src/modeles/mesures');

const { LECTURE, ECRITURE } = Permissions;
const { SECURISER } = Rubriques;

describe('Le serveur MSS des routes privées `/api/service/:id/mesures/:id/activites`', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête GET sur `/api/service/:id/mesures/:id/activites`', () => {
    beforeEach(() => {
      testeur.depotDonnees().lisActivitesMesure = () => [];
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: LECTURE, rubrique: SECURISER }],
        {
          method: 'get',
          url: 'http://localhost:1234/api/service/456/mesures/audit/activites',
        },
        done
      );
    });

    it('renvoie la liste des activités de la mesure', async () => {
      testeur.referentiel().enrichis({
        mesures: { audit: { identifiantNumerique: '0007' } },
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

      const reponse = await axios.get(
        'http://localhost:1234/api/service/456/mesures/audit/activites'
      );

      expect(reponse.status).to.be(200);
      expect(reponse.data).to.eql([
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
      testeur.depotDonnees().lisActivitesMesure = (idService, idMesure) => {
        idServiceUtilise = idService;
        idMesureUtilise = idMesure;
        return [];
      };

      await axios.get(
        'http://localhost:1234/api/service/456/mesures/audit/activites'
      );

      expect(idServiceUtilise).to.be('456');
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

      const reponse = await axios.get(
        'http://localhost:1234/api/service/456/mesures/audit/activites'
      );

      expect(reponse.data[0].identifiantNumeriqueMesure).to.be(undefined);
    });
  });

  describe('quand requête POST sur `/api/service/:id/mesures/:id/activites/commentaires`', () => {
    beforeEach(() => {
      testeur.referentiel().enrichis({
        mesures: { audit: {} },
      });
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [{ niveau: ECRITURE, rubrique: SECURISER }],
        {
          method: 'post',
          url: 'http://localhost:1234/api/service/456/mesures/audit/activites/commentaires',
        },
        done
      );
    });

    it('aseptise les paramètres', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['contenu'],
        {
          method: 'post',
          url: 'http://localhost:1234/api/service/456/mesures/audit/activites/commentaires',
        },
        done
      );
    });

    describe("délègue au dépôt de données l'enregistrement du commentaire", () => {
      it("dans le cas d'une mesure générale", async () => {
        testeur.referentiel().enrichis({
          mesures: { audit: {} },
        });
        testeur.middleware().reinitialise({
          idUtilisateur: 'U1',
        });
        let activiteRecue;
        testeur.depotDonnees().ajouteActiviteMesure = (activite) => {
          activiteRecue = activite;
        };

        await axios.post(
          'http://localhost:1234/api/service/456/mesures/audit/activites/commentaires',
          {
            contenu: 'mon commentaire',
          }
        );

        expect(activiteRecue).to.be.an(ActiviteMesure);
        expect(activiteRecue).to.eql(
          new ActiviteMesure({
            idService: '456',
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
            .avecId('456')
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

        await axios.post(
          'http://localhost:1234/api/service/456/mesures/MS1/activites/commentaires',
          {
            contenu: 'mon commentaire',
          }
        );

        expect(activiteRecue).to.be.an(ActiviteMesure);
        expect(activiteRecue).to.eql(
          new ActiviteMesure({
            idService: '456',
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
      try {
        await axios.post(
          'http://localhost:1234/api/service/456/mesures/idMesureInconnu/activites/commentaires'
        );
        expect().fail('Aurait dû lever une erreur');
      } catch (e) {
        expect(e.response.status).to.be(404);
      }
    });
  });
});
