import Entite from '../../src/modeles/entite.js';
import { ServiceAnnuaire } from '../../src/annuaire/serviceAnnuaire.interface.ts';

describe('Une entité', () => {
  describe('sur demande de complétion des donnees', () => {
    it('sait compléter avec son département et nom à partir de son SIRET', async () => {
      let siretUtilisePourLaRecherche;
      const fauxAdaptateurRechercheEntreprise = {
        rechercheOrganisations: async (siret: string) => {
          siretUtilisePourLaRecherche = siret;
          return [{ nom: 'NomEntite', departement: '33', siret }];
        },
      } as ServiceAnnuaire;
      const donneesEntite = await Entite.completeDonnees(
        { siret: '12345' },
        fauxAdaptateurRechercheEntreprise
      );

      expect(siretUtilisePourLaRecherche).toEqual('12345');
      expect(donneesEntite.siret).toEqual('12345');
      expect(donneesEntite.nom).toEqual('NomEntite');
      expect(donneesEntite.departement).toEqual('33');
    });

    it("retourne les données passées en entrée s'il n'y a pas de résultat de recherche d'entreprise", async () => {
      const fauxAdaptateurRechercheEntreprise = {
        rechercheOrganisations: async () => [],
      } as unknown as ServiceAnnuaire;
      const donneesEntite = await Entite.completeDonnees(
        { siret: '12345' },
        fauxAdaptateurRechercheEntreprise
      );

      expect(donneesEntite).toEqual({ siret: '12345' });
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
      } as unknown as ServiceAnnuaire;
      const donneesEntite = await Entite.completeDonnees(
        { siret: '12345' },
        fauxAdaptateurRechercheEntreprise
      );

      expect(donneesEntite).toEqual({ siret: '12345' });
    });
  });

  it('peut être construite avec son nom département et siret', async () => {
    const uneEntite = new Entite({
      siret: '12345',
      nom: 'NomEntite',
      departement: '33',
    });

    expect(uneEntite.siret).toEqual('12345');
    expect(uneEntite.nom).toEqual('NomEntite');
    expect(uneEntite.departement).toEqual('33');
  });
});
