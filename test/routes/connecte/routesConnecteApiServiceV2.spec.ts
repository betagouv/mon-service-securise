import testeurMSS from '../testeurMSS.js';
import { uneDescriptionV2Valide } from '../../constructeurs/constructeurDescriptionServiceV2.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import { unUUIDRandom } from '../../constructeurs/UUID.js';
import { UUID } from '../../../src/typesBasiques.js';
import { DonneesDescriptionServiceV2 } from '../../../src/modeles/descriptionServiceV2.js';
import Service from '../../../src/modeles/service.js';
import { ErreurNomServiceDejaExistant } from '../../../src/erreurs.js';

const { ECRITURE } = Permissions;
const { DECRIRE } = Rubriques;

describe('Le serveur MSS des routes /api/service-v2/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  describe('quand requête POST sur `/api/service-v2/niveauSecuriteRequis`', () => {
    it('jette une erreur 400 si les données sont invalides', async () => {
      const reponse = await testeur.post(
        '/api/service-v2/niveauSecuriteRequis',
        {}
      );

      expect(reponse.status).toBe(400);
    });

    it('retourne le niveau de securite requis', async () => {
      const reponse = await testeur.post(
        '/api/service-v2/niveauSecuriteRequis',
        uneDescriptionV2Valide().donneesDescription()
      );

      expect(reponse.status).toBe(200);
      expect(reponse.body).toEqual({
        niveauDeSecuriteMinimal: 'niveau3',
      });
    });
  });

  describe('quand requête PUT sur `/api/service-v2/:id`', () => {
    let donneesDescriptionValide: DonneesDescriptionServiceV2;
    const idUtilisateur = unUUIDRandom();
    const idService = unUUIDRandom();
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur });
      testeur.depotDonnees().ajouteDescriptionService = async () => {};

      donneesDescriptionValide = uneDescriptionV2Valide()
        .avecNomService('Nouveau Nom')
        .donneesDescription();
      testeur.depotDonnees().service = async () =>
        new Service(donneesDescriptionValide, testeur.referentiel());
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: DECRIRE }],
          testeur.app(),
          {
            method: 'put',
            url: `/api/service-v2/${idService}`,
          }
        );
    });

    it('jette une erreur 400 si les données sont invalides', async () => {
      const reponse = await testeur.put(`/api/service-v2/${idService}`, {
        ...donneesDescriptionValide,
        niveauSecurite: 'niveau42',
      });

      expect(reponse.status).toBe(400);
    });

    it('demande au dépôt de données de mettre à jour le service', async () => {
      let donneeTransmises:
        | {
            idUtilisateur: string;
            idService: string;
            donnees: DonneesDescriptionServiceV2;
          }
        | undefined;

      testeur.depotDonnees().ajouteDescriptionService = async (
        idU: UUID,
        idS: UUID,
        donnees: DonneesDescriptionServiceV2
      ) => {
        donneeTransmises = { idUtilisateur: idU, idService: idS, donnees };
      };

      const reponse = await testeur.put(
        `/api/service-v2/${idService}`,
        donneesDescriptionValide
      );

      expect(reponse.status).to.equal(200);
      expect(donneeTransmises?.idUtilisateur).to.equal(idUtilisateur);
      expect(donneeTransmises?.idService).to.equal(idService);
      expect(donneeTransmises?.donnees.nomService).to.equal('Nouveau Nom');
    });

    it('retourne une erreur 422 si le nom de service est déjà utilisé', async () => {
      testeur.depotDonnees().ajouteDescriptionService = async () => {
        throw new ErreurNomServiceDejaExistant();
      };

      const reponse = await testeur.put(
        `/api/service-v2/${idService}`,
        donneesDescriptionValide
      );

      expect(reponse.status).to.equal(422);
      expect(reponse.body).to.eql({
        erreur: { code: 'NOM_SERVICE_DEJA_EXISTANT' },
      });
    });
  });
});
