import testeurMSS from '../testeurMSS.js';
import { unService } from '../../constructeurs/constructeurService.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.ts';
import { UUID } from '../../../src/typesBasiques.ts';
import MesureGenerale from '../../../src/modeles/mesureGenerale.js';
import Mesures from '../../../src/modeles/mesures.js';
import { creeReferentiel } from '../../../src/referentiel.js';

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
      testeur.referentiel().recharge({
        mesures: { audit: {} },
      });

      testeur.middleware().reinitialise({
        idUtilisateur: '123',
        serviceARenvoyer: unService(testeur.referentiel())
          .avecId('456')
          .construis(),
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

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['statut', 'modalites', 'priorite', 'echeance', 'responsables.*'],
          testeur.app(),
          { method: 'put', url: '/api/service/456/mesures/audit' }
        );
    });

    it('jette une erreur 400 si le statut est vide', async () => {
      const mesureGenerale = { statut: '' };

      const reponse = await testeur.put(
        '/api/service/456/mesures/audit',
        mesureGenerale
      );

      expect(reponse.status).toBe(400);
      expect(reponse.text).toBe('Le statut de la mesure est obligatoire.');
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

      const mesureGenerale = { statut: 'fait' };

      await testeur.put('/api/service/456/mesures/audit', mesureGenerale);

      expect(idServiceRecu).to.equal('456');
      expect(idUtilisateurRecu).to.equal('123');
      expect(donneesRecues!.id).to.equal('audit');
      expect(donneesRecues!.statut).to.equal('fait');
    });

    it('renvoie une erreur 400 si la mesure est invalide à cause du statut', async () => {
      const mesureGenerale = { statut: 'invalide' };

      const reponse = await testeur.put(
        '/api/service/456/mesures/audit',
        mesureGenerale
      );

      expect(reponse.status).toBe(400);
      expect(reponse.text).toBe('La mesure est invalide.');
    });

    it('renvoie une erreur 400 si la mesure est invalide à cause de la priorité', async () => {
      const mesureGenerale = { priorite: 'invalide', statut: 'enCours' };

      const reponse = await testeur.put(
        '/api/service/456/mesures/audit',
        mesureGenerale
      );

      expect(reponse.status).toBe(400);
      expect(reponse.text).toBe('La mesure est invalide.');
    });

    it("renvoie une erreur 400 si la mesure est invalide à cause de l'échéance", async () => {
      const mesureGenerale = { echeance: 'invalide', statut: 'enCours' };

      const reponse = await testeur.put(
        '/api/service/456/mesures/audit',
        mesureGenerale
      );

      expect(reponse.status).toBe(400);
      expect(reponse.text).toBe('La mesure est invalide.');
    });

    it("décode les 'slash' de la date d'échéance", async () => {
      const slash = '&#x2F;';
      let donneesRecues;
      testeur.depotDonnees().metsAJourMesureGeneraleDuService = (
        _: UUID,
        __: UUID,
        donnees: MesureGenerale
      ) => {
        donneesRecues = donnees;
      };

      const mesureGenerale = {
        statut: 'fait',
        echeance: `01${slash}01${slash}2024`,
      };

      await testeur.put('/api/service/456/mesures/audit', mesureGenerale);

      expect(donneesRecues!.echeance.getTime()).to.equal(
        new Date('01/01/2024').getTime()
      );
    });
  });
});
