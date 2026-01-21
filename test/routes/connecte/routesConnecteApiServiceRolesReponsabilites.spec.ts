import { UUID } from 'node:crypto';
import testeurMSS from '../testeurMSS.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import RolesResponsabilites from '../../../src/modeles/rolesResponsabilites.js';

const { ECRITURE } = Permissions;
const { CONTACTS } = Rubriques;

describe('Le serveur MSS des routes /api/service/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

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

    it("demande au dépôt d'associer les rôles et responsabilités au service", async () => {
      let rolesResponsabilitesAjoutees = false;

      testeur.depotDonnees().ajouteRolesResponsabilitesAService = async (
        idService: UUID,
        role: RolesResponsabilites
      ) => {
        expect(idService).toEqual('456');
        expect(role.autoriteHomologation).toEqual('Jean Dupont');
        rolesResponsabilitesAjoutees = true;
      };

      const reponse = await testeur.post(
        '/api/service/456/rolesResponsabilites',
        { autoriteHomologation: 'Jean Dupont' }
      );

      expect(rolesResponsabilitesAjoutees).toBe(true);
      expect(reponse.status).toEqual(200);
      expect(reponse.body).toEqual({ idService: '456' });
    });

    it("aseptise la liste des acteurs de l'homologation ainsi que son contenu", async () => {
      await testeur.post('/api/service/456/rolesResponsabilites', {});

      testeur
        .middleware()
        .verifieAseptisationListe('acteursHomologation', [
          'role',
          'nom',
          'fonction',
        ]);
    });

    it('aseptise la liste des parties prenantes ainsi que son contenu', async () => {
      await testeur.post('/api/service/456/rolesResponsabilites', {});

      testeur
        .middleware()
        .verifieAseptisationListe('partiesPrenantes', [
          'nom',
          'natureAcces',
          'pointContact',
        ]);
    });
  });
});
