import { siretsOuIlEstAdmin } from '../../../lib/adminUtilisateurs/TiroirNommerAdmin/tiroirNommerAdmin';
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
});
