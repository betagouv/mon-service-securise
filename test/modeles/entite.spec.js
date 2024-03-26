const expect = require('expect.js');
const Entite = require('../../src/modeles/entite');

describe('Une entité', () => {
  describe('sur demande de complétion des donnees', () => {
    it('sait compléter avec son département et nom à partir de son SIRET', async () => {
      let siretUtilisePourLaRecherche;
      const fauxAdaptateurRechercheEntreprise = {
        rechercheOrganisations: async (siret) => {
          siretUtilisePourLaRecherche = siret;
          return [{ nom: 'NomEntite', departement: '33', siret }];
        },
      };
      const donneesEntite = await Entite.completeDonnees(
        { siret: '12345' },
        fauxAdaptateurRechercheEntreprise
      );

      expect(siretUtilisePourLaRecherche).to.equal('12345');
      expect(donneesEntite.siret).to.equal('12345');
      expect(donneesEntite.nom).to.equal('NomEntite');
      expect(donneesEntite.departement).to.equal('33');
    });

    it("retourne les données passées en entrée s'il n'y a pas de résultat de recherche d'entreprise", async () => {
      const fauxAdaptateurRechercheEntreprise = {
        rechercheOrganisations: async () => [],
      };
      const donneesEntite = await Entite.completeDonnees(
        { siret: '12345' },
        fauxAdaptateurRechercheEntreprise
      );

      expect(donneesEntite).to.eql({ siret: '12345' });
    });

    it("retourne les données passées en entrée s'il y a plusieurs résultats de recherche d'entreprise", async () => {
      const fauxAdaptateurRechercheEntreprise = {
        rechercheOrganisations: async () => [
          { nom: 'NomEntite', departement: '33', siret: '1234' },
          {
            nom: 'NomEntite',
            departement: '33',
            siret: '1235',
          },
        ],
      };
      const donneesEntite = await Entite.completeDonnees(
        { siret: '12345' },
        fauxAdaptateurRechercheEntreprise
      );

      expect(donneesEntite).to.eql({ siret: '12345' });
    });
  });

  it('peut être construite avec son nom département et siret', async () => {
    const uneEntite = new Entite({
      siret: '12345',
      nom: 'NomEntite',
      departement: '33',
    });

    expect(uneEntite.siret).to.equal('12345');
    expect(uneEntite.nom).to.equal('NomEntite');
    expect(uneEntite.departement).to.equal('33');
  });
});
