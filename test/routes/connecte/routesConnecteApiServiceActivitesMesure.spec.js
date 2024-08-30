const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');
const {
  Permissions,
  Rubriques,
} = require('../../../src/modeles/autorisations/gestionDroits');
const ActiviteMesure = require('../../../src/modeles/activiteMesure');

const { LECTURE } = Permissions;
const { SECURISER } = Rubriques;

describe('Le serveur MSS des routes privées `/api/service/:id/mesures/:id/activites', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête GET sur `/api/service/:id/mesures/:id/activites', () => {
    beforeEach(() => {
      testeur.depotDonnees().litActivitesMesure = () => [];
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

    it('renvoie 200', async () => {
      const reponse = await axios.get(
        'http://localhost:1234/api/service/456/mesures/audit/activites'
      );

      expect(reponse.status).to.be(200);
    });

    it('renvoie la liste des activités de la mesure', async () => {
      testeur.referentiel().enrichis({
        mesures: { audit: { identifiantNumerique: '0007' } },
      });
      testeur.depotDonnees().litActivitesMesure = () => [
        new ActiviteMesure({
          idActeur: '9724853e-037c-4bca-9350-0a4b14a85a29',
          date: new Date('2024-09-29 11:15:02.817 +0200'),
          idMesure: 'audit',
          type: 'ajoutPriorite',
          details: { nouvelleValeur: 'p3' },
        }),
      ];

      const reponse = await axios.get(
        'http://localhost:1234/api/service/456/mesures/audit/activites'
      );

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
      testeur.depotDonnees().litActivitesMesure = (idService, idMesure) => {
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
  });
});
