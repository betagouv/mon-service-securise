import {
  siretsOuIlEstAdmin,
  statsDesEntites,
  resumeDesModifications,
} from '../../../lib/adminUtilisateurs/TiroirNommerAdmin/tiroirNommerAdmin';

import type { EntiteSupervisee } from '../../../lib/adminEntites/adminEntites.types';

describe('Les fonctions du TiroirNommerAdmin', () => {
  it('savent calculer les SIRET sur lesquel un utilisateur est admin', () => {
    const entite1: EntiteSupervisee = {
      siret: 'SIRET-1',
      administrateurs: [
        {
          id: 'U1',
          prenomNom: '',
          initiales: '',
          postes: '',
          estUtilisateurCourant: false,
        },
      ],
      nombreServices: 8,
      nombreUtilisateurs: 4,
    };

    const entite2: EntiteSupervisee = {
      siret: 'SIRET-2',
      administrateurs: [],
      nombreServices: 1,
      nombreUtilisateurs: 1,
    };

    const entites: EntiteSupervisee[] = [entite1, entite2];

    const lesSiretsDeU1 = siretsOuIlEstAdmin('U1', entites);

    expect(lesSiretsDeU1).toEqual(['SIRET-1']);
  });

  it("savent calculer le nombre de services et d'utilisateurs de plusieurs entités", () => {
    const entite1: EntiteSupervisee = {
      nombreServices: 8,
      nombreUtilisateurs: 4,
      siret: 'SIRET-1',
      administrateurs: [],
    };

    const entite2: EntiteSupervisee = {
      nombreServices: 2,
      nombreUtilisateurs: 1,
      siret: 'SIRET-2',
      administrateurs: [],
    };

    const entite3: EntiteSupervisee = {
      nombreServices: 2,
      nombreUtilisateurs: 1,
      siret: 'SIRET-3',
      administrateurs: [],
    };

    const resultat = statsDesEntites(
      [entite1, entite2, entite3],
      ['SIRET-1', 'SIRET-2']
    );

    expect(resultat).toEqual({ nombreServices: 10, nombreUtilisateurs: 5 });
  });

  describe('concernant le résumé des modifications', () => {
    it('trouve les nouvelles entités qui font leur entrée', () => {
      const siretsDepart = ['SIRET-1'];
      const siretsArrivee = ['SIRET-1', 'SIRET-2'];

      const resume = resumeDesModifications(siretsDepart, siretsArrivee);

      expect(resume.nouvelles).toEqual(['SIRET-2']);
    });

    it('trouve les entités qui sont retirées', () => {
      const siretsDepart = ['SIRET-1', 'SIRET-2', 'SIRET-3'];
      const siretsArrivee = ['SIRET-2'];

      const resume = resumeDesModifications(siretsDepart, siretsArrivee);

      expect(resume.retirees).toEqual(['SIRET-1', 'SIRET-3']);
    });

    it('trouve les entités qui sont conservées', () => {
      const siretsDepart = ['SIRET-1', 'SIRET-2', 'SIRET-3'];
      const siretsArrivee = ['SIRET-2'];

      const resume = resumeDesModifications(siretsDepart, siretsArrivee);

      expect(resume.conservees).toEqual(['SIRET-2']);
    });
  });
});
