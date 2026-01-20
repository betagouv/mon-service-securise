import testeurMSS from '../testeurMSS.js';
import {
  unService,
  unServiceV2,
} from '../../constructeurs/constructeurService.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.ts';
import { UUID } from '../../../src/typesBasiques.ts';
import MesureGenerale from '../../../src/modeles/mesureGenerale.js';
import Mesures from '../../../src/modeles/mesures.js';
import { creeReferentiel } from '../../../src/referentiel.js';
import { unUUIDRandom } from '../../constructeurs/UUID.js';

const { LECTURE, ECRITURE } = Permissions;
const { SECURISER } = Rubriques;

describe('Les routes API des mesures générales des services', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  describe('quand requête GET sur `/api/service/:id/mesures', () => {
    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: SECURISER }],
          testeur.app(),
          { method: 'get', url: '/api/service/456/mesures' }
        );
    });

    it('retourne la représentation enrichie des mesures', async () => {
      const avecMesureA = creeReferentiel({
        // @ts-expect-error On veut seulement une mesure bouchon
        mesures: { mesureA: {} },
      });
      const mesures = new Mesures(
        {
          mesuresGenerales: [
            { id: 'mesureA', statut: 'fait', modalites: 'un commentaire' },
          ],
        },
        avecMesureA,
        { mesureA: { description: 'Mesure A', referentiel: 'ANSSI' } }
      );

      // @ts-expect-error La fonction reinitialise() devrait prendre des paramètres optionnels
      testeur.middleware().reinitialise({
        serviceARenvoyer: unService(avecMesureA)
          .avecMesures(mesures)
          .construis(),
      });

      const reponse = await testeur.get('/api/service/456/mesures');

      expect(reponse.body).to.eql({
        mesuresGenerales: {
          mesureA: {
            description: 'Mesure A',
            statut: 'fait',
            modalites: 'un commentaire',
            referentiel: 'ANSSI',
            responsables: [],
          },
        },
        mesuresSpecifiques: [],
      });
    });
  });

  describe('quand requête PUT sur `/api/service/:id/mesures/:idMesure`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({
        idUtilisateur: '123',
        serviceARenvoyer: unServiceV2().avecId('456').construis(),
      });

      testeur.depotDonnees().metsAJourMesureGeneraleDuService = async () => {};
    });

    it("vérifie que l'utilisateur a accepté les CGU", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'put',
          url: '/api/service/456/mesures/audit',
        });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: SECURISER }],
          testeur.app(),
          { method: 'put', url: '/api/service/456/mesures/audit' }
        );
    });

    const unePayloadValideSauf = (cleValeur?: Record<string, unknown>) => ({
      statut: 'fait',
      modalites: '',
      priorite: 'p1',
      echeance: '1/7/2026',
      responsables: [unUUIDRandom()],
      ...cleValeur,
    });

    it("jette une erreur 400 si l'ID de mesure est invalide", async () => {
      const { status } = await testeur.put(
        '/api/service/456/mesures/pasUnUUID',
        unePayloadValideSauf()
      );

      expect(status).toBe(400);
    });

    describe('jette une erreur 400 si …', () => {
      it.each([
        { statut: undefined },
        { modalites: 123 },
        { priorite: 'pasUnePriorite' },
        { echeance: 'pasUneEcheance' },
        { responsables: 'pasUnResponsable' },
      ])('la payload contient %s', async (donneesDuTest) => {
        const { status } = await testeur.put(
          '/api/service/456/mesures/RECENSEMENT.1',
          unePayloadValideSauf(donneesDuTest)
        );

        expect(status).toBe(400);
      });
    });

    it('délègue au dépôt de données la mise à jour des mesures générales', async () => {
      let donneesRecues;
      let idServiceRecu;
      let idUtilisateurRecu;
      testeur.depotDonnees().metsAJourMesureGeneraleDuService = (
        idService: UUID,
        idUtilisateur: UUID,
        donnees: MesureGenerale
      ) => {
        donneesRecues = donnees;
        idServiceRecu = idService;
        idUtilisateurRecu = idUtilisateur;
      };

      await testeur.put(
        '/api/service/456/mesures/RECENSEMENT.1',
        unePayloadValideSauf()
      );

      expect(idServiceRecu).to.equal('456');
      expect(idUtilisateurRecu).to.equal('123');
      expect(donneesRecues!.id).to.equal('RECENSEMENT.1');
      expect(donneesRecues!.statut).to.equal('fait');
    });
  });
});
