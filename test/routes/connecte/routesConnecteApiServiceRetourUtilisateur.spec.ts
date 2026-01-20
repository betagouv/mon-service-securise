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
    const unePayloadValideSauf = (cleValeur?: Record<string, unknown>) => ({
      idMesure: 'RECENSEMENT.1',
      idRetour: 'mesureUtile',
      commentaire: 'un commentaire',
      ...cleValeur,
    });

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

    describe('jette une erreur 400 si...', () => {
      it.each([{ idMesure: 'pasUneMesureV1', idRetour: 'pasUnIdRetour' }])(
        'la payload contient %s',
        async (donneesDuTest) => {
          const { status } = await testeur.post(
            '/api/service/456/retourUtilisateurMesure',
            unePayloadValideSauf(donneesDuTest)
          );

          expect(status).toBe(400);
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

      await testeur.post(
        '/api/service/456/retourUtilisateurMesure',
        unePayloadValideSauf()
      );

      expect(evenementRecu!.type).toEqual('RETOUR_UTILISATEUR_MESURE_RECU');
    });
  });
});
