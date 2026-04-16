import testeurMSS from '../testeurMSS.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import RolesResponsabilites from '../../../src/modeles/rolesResponsabilites.js';
import { UUID } from '../../../src/typesBasiques.js';

const { ECRITURE } = Permissions;
const { CONTACTS } = Rubriques;

describe('Le serveur MSS des routes /api/service/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  const unePayloadValideSauf = (cleValeur?: Record<string, unknown>) => ({
    autoriteHomologation: { nom: 'autorité', fonction: 'fonction autorité' },
    expertCybersecurite: { nom: 'expert', fonction: 'fonction expert' },
    delegueProtectionDonnees: { nom: 'délégué', fonction: 'fonction délégué' },
    piloteProjet: { nom: 'pilote', fonction: 'fonction pilote' },
    acteursHomologation: [{ role: 'acteur', nom: 'nom', fonction: 'fonction' }],
    partiesPrenantesSpecifiques: [
      {
        nom: 'nom',
        natureAcces: 'nature',
        pointContact: 'point',
      },
    ],
    partiesPrenantes: {
      Hebergement: {
        nom: 'nomHebergement',
        natureAcces: 'natureHebergement',
        pointContact: 'pointHebergement',
      },
      DeveloppementFourniture: {
        nom: 'nomDeveloppementFourniture',
        natureAcces: 'natureDeveloppementFourniture',
        pointContact: 'pointDeveloppementFourniture',
      },
      MaintenanceService: {
        nom: 'nomMaintenanceService',
        natureAcces: 'natureMaintenanceService',
        pointContact: 'pointMaintenanceService',
      },
      SecuriteService: {
        nom: 'nomSecuriteService',
        natureAcces: 'natureSecuriteService',
        pointContact: 'pointSecuriteService',
      },
    },
    ...cleValeur,
  });

  describe('quand requête POST sur `/api/service/:id/rolesResponsabilites`', () => {
    beforeEach(() => {
      testeur.depotDonnees().ajouteRolesResponsabilitesAService = () =>
        Promise.resolve();
      testeur.depotDonnees().ajouteEntitesExternesAHomologation = () =>
        Promise.resolve();
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: CONTACTS }],
          testeur.app(),
          {
            method: 'post',
            url: '/api/service/456/rolesResponsabilites',
          }
        );
    });

    describe('jette une erreur 400 si...', () => {
      it.each([
        { autoriteHomologation: undefined },
        { expertCybersecurite: undefined },
        { delegueProtectionDonnees: undefined },
        { piloteProjet: undefined },
        { acteursHomologation: undefined },
        { partiesPrenantes: undefined },
        { partiesPrenantesSpecifiques: undefined },
      ])('la payload contient %s', async (donneesDuTest) => {
        const { status } = await testeur.post(
          '/api/service/456/rolesResponsabilites',
          unePayloadValideSauf(donneesDuTest)
        );

        expect(status).toEqual(400);
      });
    });

    it("demande au dépôt d'associer les rôles et responsabilités au service", async () => {
      let donneesRecues;

      testeur.depotDonnees().ajouteRolesResponsabilitesAService = async (
        idService: UUID,
        role: RolesResponsabilites
      ) => {
        donneesRecues = { idService, role };
      };

      const { body, status } = await testeur.post(
        '/api/service/456/rolesResponsabilites',
        unePayloadValideSauf()
      );

      expect(status).toEqual(200);
      expect(body).toEqual({ idService: '456' });
      expect(donneesRecues!.idService).toEqual('456');
      expect(donneesRecues!.role.donneesSerialisees()).toEqual({
        autoriteHomologation: 'autorité',
        fonctionAutoriteHomologation: 'fonction autorité',
        expertCybersecurite: 'expert',
        fonctionExpertCybersecurite: 'fonction expert',
        delegueProtectionDonnees: 'délégué',
        fonctionDelegueProtectionDonnees: 'fonction délégué',
        piloteProjet: 'pilote',
        fonctionPiloteProjet: 'fonction pilote',
        acteursHomologation: [
          { role: 'acteur', nom: 'nom', fonction: 'fonction' },
        ],
        partiesPrenantes: [
          {
            nom: 'nomHebergement',
            natureAcces: 'natureHebergement',
            pointContact: 'pointHebergement',
            type: 'Hebergement',
          },
          {
            nom: 'nomMaintenanceService',
            natureAcces: 'natureMaintenanceService',
            pointContact: 'pointMaintenanceService',
            type: 'MaintenanceService',
          },
          {
            nom: 'nomDeveloppementFourniture',
            natureAcces: 'natureDeveloppementFourniture',
            pointContact: 'pointDeveloppementFourniture',
            type: 'DeveloppementFourniture',
          },
          {
            nom: 'nomSecuriteService',
            natureAcces: 'natureSecuriteService',
            pointContact: 'pointSecuriteService',
            type: 'SecuriteService',
          },
          {
            type: 'PartiePrenanteSpecifique',
            nom: 'nom',
            natureAcces: 'nature',
            pointContact: 'point',
          },
        ],
      });
    });
  });
});
