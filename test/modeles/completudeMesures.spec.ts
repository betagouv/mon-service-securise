import { CompletudeMesures } from '../../src/modeles/completudeMesures.js';
import { desStatistiques } from '../constructeurs/constructeurStatistiquesMesures.js';
import { creeReferentiel } from '../../src/referentiel.js';
import MesuresSpecifiques from '../../src/modeles/mesuresSpecifiques.js';

describe('La complétude des mesures', () => {
  it('calcule le nombre total de mesures en additionnant générales et spécifiques', () => {
    const referentiel = creeReferentiel({
      // @ts-expect-error On cree volontairement un référentiel partiel pour le test
      categoriesMesures: { gouvernance: 'Gouvernance' },
      // @ts-expect-error On cree volontairement un référentiel partiel pour le test
      mesures: { A: {}, B: {}, C: {} },
      // @ts-expect-error On cree volontairement un référentiel partiel pour le test
      statutsMesures: { fait: '' },
    });

    const indispensable = { id: 'A', statut: 'fait' };
    const recommandee = { id: 'B', statut: 'fait' };
    const autreRecommandee = { id: 'C', statut: 'fait' };

    const statistiquesMesuresGenerales = desStatistiques(referentiel)
      .surLesMesuresGenerales([indispensable, recommandee, autreRecommandee])
      .avecMesuresPersonnalisees({
        A: { categorie: 'gouvernance', indispensable: true },
        B: { categorie: 'gouvernance' },
        C: { categorie: 'gouvernance' },
      })
      .construis();

    const mesuresSpecifiques = new MesuresSpecifiques(
      // @ts-expect-error On cree volontairement un référentiel partiel pour le test
      { mesuresSpecifiques: [{ categorie: 'gouvernance', statut: 'fait' }] },
      referentiel
    );

    const completude = new CompletudeMesures({
      statistiquesMesuresGenerales,
      mesuresSpecifiques,
    });

    expect(completude.completude().nombreTotalMesures).toBe(4);
  });

  it('calcule le nombre de mesures complétées : celles qui ont un statut', () => {
    const referentiel = creeReferentiel({
      // @ts-expect-error On cree volontairement un référentiel partiel pour le test
      categoriesMesures: { gouvernance: 'Gouvernance' },
      // @ts-expect-error On cree volontairement un référentiel partiel pour le test
      mesures: { A: {}, B: {}, C: {} },
      // @ts-expect-error On cree volontairement un référentiel partiel pour le test
      statutsMesures: { fait: '', enCours: '' },
    });

    const indispensable = { id: 'A', statut: 'fait' };
    const recommandee = { id: 'B', statut: 'enCours' };
    const recommandeeSansStatut = { C: { categorie: 'gouvernance' } };

    const statistiquesMesuresGenerales = desStatistiques(referentiel)
      .surLesMesuresGenerales([indispensable, recommandee])
      .avecMesuresPersonnalisees({
        A: { categorie: 'gouvernance', indispensable: true },
        B: { categorie: 'gouvernance' },
        ...recommandeeSansStatut,
      })
      .construis();

    const mesuresSpecifiques = new MesuresSpecifiques(
      // @ts-expect-error On cree volontairement un référentiel partiel pour le test
      { mesuresSpecifiques: [{ categorie: 'gouvernance', statut: 'fait' }] },
      referentiel
    );

    const completude = new CompletudeMesures({
      statistiquesMesuresGenerales,
      mesuresSpecifiques,
    });

    expect(completude.completude().nombreMesuresCompletes).toBe(3);
  });
});
