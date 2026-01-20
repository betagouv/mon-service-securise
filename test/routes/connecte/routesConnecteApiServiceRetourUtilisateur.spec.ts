import testeurMSS from '../testeurMSS.js';
import { unService } from '../../constructeurs/constructeurService.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import Evenement from '../../../src/modeles/journalMSS/evenement.js';

const { ECRITURE } = Permissions;
const { SECURISER } = Rubriques;

describe('Le serveur MSS des routes /api/service/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  describe('quand requête POST sur `/api/service/:id/retourUtilisateurMesure', () => {
    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: SECURISER }],
          testeur.app(),
          {
            method: 'post',
            url: '/api/service/456/retourUtilisateurMesure',
          }
        );
    });

    it('aseptise les données de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['id', 'idMesure', 'idRetour', 'commentaire'],
          testeur.app(),
          {
            method: 'post',
            url: '/api/service/456/retourUtilisateurMesure',
          }
        );
    });

    it("retourne une erreur HTTP 424 si l'id du retour utilisateur est inconnu", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        424,
        {
          type: 'DONNEES_INCORRECTES',
          message: "L'identifiant de retour utilisateur est incorrect.",
        },
        {
          method: 'post',
          url: '/api/service/456/retourUtilisateurMesure',
          data: { idRetour: 'idRetourInconnu' },
        }
      );
    });

    it("retourne une erreur HTTP 424 si l'id de mesure est inconnu", async () => {
      testeur.referentiel().recharge({
        retoursUtilisateurMesure: { idRetour: 'un retour utilisateur' },
      });
      // @ts-expect-error La fonction `reinitialise` devrait prendre des paramètres optionnels
      testeur.middleware().reinitialise({
        serviceARenvoyer: unService(testeur.referentiel())
          .avecId('456')
          .construis(),
      });
      await testeur.verifieRequeteGenereErreurHTTP(
        424,
        {
          type: 'DONNEES_INCORRECTES',
          message: "L'identifiant de mesure est incorrect.",
        },
        {
          method: 'post',
          url: '/api/service/456/retourUtilisateurMesure',
          data: { idMesure: 'idMesureInconnu', idRetour: 'idRetour' },
        }
      );
    });

    it('consigne un événement de retour utilisateur sur une mesure', async () => {
      testeur.referentiel().recharge({
        retoursUtilisateurMesure: { bonneMesure: 'mesure satisfaisante' },
        mesures: { implementerMfa: {} },
      });
      testeur.middleware().reinitialise({
        idUtilisateur: '123',
        serviceARenvoyer: unService(testeur.referentiel())
          .avecId('456')
          .construis(),
      });
      let evenementRecu: Evenement;
      testeur.adaptateurJournalMSS().consigneEvenement = async (
        evenement: Evenement
      ) => {
        evenementRecu = evenement;
      };

      await testeur.post('/api/service/456/retourUtilisateurMesure', {
        idMesure: 'implementerMfa',
        idRetour: 'bonneMesure',
        commentaire: 'un commentaire',
      });

      expect(evenementRecu!.type).toEqual('RETOUR_UTILISATEUR_MESURE_RECU');
    });
  });
});
