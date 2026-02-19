import { DonneesIdentite, Identite } from '../../src/modeles/identite.js';

describe('Une identité', () => {
  const donneesIdentite = (surcharge?: Partial<DonneesIdentite>) => ({
    email: 'jean.dujardin@beta.gouv.fr',
    prenom: 'Jean',
    nom: 'Dujardin',
    postes: [],
    ...surcharge,
  });

  describe('sur demande de ses initiales', () => {
    it('renvoie les initiales du prénom et du nom', () => {
      const jean = new Identite(
        donneesIdentite({
          prenom: 'Jean',
          nom: 'Dupont',
        })
      );
      expect(jean.initiales()).to.equal('JD');
    });

    it('reste robuste en cas de prénom ou de nom absent', () => {
      // @ts-expect-error On force une valeur incorrecte
      const jean = new Identite(donneesIdentite({ prenom: null, nom: null }));
      expect(jean.initiales()).to.equal('');
    });
  });

  describe('sur demande du « prénom / nom »', () => {
    it('reste robuste si le nom est absent', () => {
      // @ts-expect-error On force une valeur incorrecte
      const jean = new Identite(donneesIdentite({ nom: null }));
      expect(jean.prenomNom()).to.equal('Jean');
    });

    it('reste robuste si le prénom est absent', () => {
      // @ts-expect-error On force une valeur incorrecte
      const jean = new Identite(donneesIdentite({ prenom: null }));
      expect(jean.prenomNom()).to.equal('Dujardin');
    });

    it("retourne l'email si le prénom et le nom sont absents", () => {
      // @ts-expect-error On force une valeur incorrecte
      const jean = new Identite(donneesIdentite({ prenom: null, nom: null }));
      expect(jean.prenomNom()).to.equal('jean.dujardin@beta.gouv.fr');
    });
  });

  it('combine toutes les informations de postes sur demande de son poste détaillé', () => {
    const plusieursPostes = new Identite(
      donneesIdentite({ postes: ['RSSI', 'DPO', 'Maire'] })
    );

    expect(plusieursPostes.posteDetaille()).to.eql('RSSI, DPO et Maire');
  });
});
