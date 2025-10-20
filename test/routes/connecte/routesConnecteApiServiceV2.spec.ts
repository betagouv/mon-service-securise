import testeurMSS from '../testeurMSS.js';
import { uneDescriptionV2Valide } from '../../constructeurs/constructeurDescriptionServiceV2.js';

describe('Le serveur MSS des routes /api/service-v2/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  describe('quand requête POST sur `/niveauSecuriteRequis`', () => {
    it('jette une erreur 400 si les données sont invalides', async () => {
      const reponse = await testeur.post(
        '/api/service-v2/niveauSecuriteRequis',
        {}
      );

      expect(reponse.status).toBe(400);
    });

    it('retourne le niveau de securite requis', async () => {
      const { organisationResponsable, ...donnees } = {
        ...uneDescriptionV2Valide().donneesDescription(),
        siret: '',
      };
      donnees.siret = organisationResponsable.siret;

      const reponse = await testeur.post(
        '/api/service-v2/niveauSecuriteRequis',
        donnees
      );

      expect(reponse.status).toBe(200);
      expect(reponse.body).toEqual({
        niveauDeSecuriteMinimal: 'niveau3',
      });
    });
  });
});
