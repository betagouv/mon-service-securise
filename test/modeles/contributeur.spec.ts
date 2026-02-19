import {
  Contributeur,
  DonneesContributeur,
} from '../../src/modeles/contributeur.js';
import { unUUIDRandom } from '../constructeurs/UUID.ts';

describe('Un contributeur', () => {
  const donneesContributeur = (surcharge?: Partial<DonneesContributeur>) => ({
    id: unUUIDRandom(),
    email: 'jean.dujardin@beta.gouv.fr',
    prenom: 'Jean',
    nom: 'Dujardin',
    postes: [],
    ...surcharge,
  });

  it("connaît l'identifiant de l'utilisateur qu'il représente", () => {
    const id = unUUIDRandom();
    const contributeur = new Contributeur(donneesContributeur({ id }));

    expect(contributeur.idUtilisateur).toBe(id);
  });

  it('connaît son « prénom / nom »', () => {
    const contributeur = new Contributeur(
      donneesContributeur({ prenom: 'Jean', nom: 'Dujardin' })
    );

    expect(contributeur.prenomNom()).toBe('Jean Dujardin');
  });

  it('connaît ses initiales', () => {
    const contributeur = new Contributeur(
      donneesContributeur({ prenom: 'Jean', nom: 'Dujardin' })
    );

    expect(contributeur.initiales()).toBe('JD');
  });

  it("connaît les détails du poste qu'il occupe", () => {
    const contributeur = new Contributeur(
      donneesContributeur({
        postes: ['RSSI', 'DPO', 'Maire'],
      })
    );

    expect(contributeur.posteDetaille()).toEqual('RSSI, DPO et Maire');
  });
});
