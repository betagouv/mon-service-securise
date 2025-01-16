const expect = require('expect.js');
const { CompletudeMesures } = require('../../src/modeles/completudeMesures');
const {
  desStatistiques,
} = require('../constructeurs/constructeurStatistiquesMesures');
const Referentiel = require('../../src/referentiel');
const MesuresSpecifiques = require('../../src/modeles/mesuresSpecifiques');

describe('La complétude des mesures', () => {
  it('calcule le nombre total de mesures en additionnant générales et spécifiques', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { gouvernance: 'Gouvernance' },
      mesures: { A: {}, B: {}, C: {} },
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
      { mesuresSpecifiques: [{ categorie: 'gouvernance', statut: 'fait' }] },
      referentiel
    );

    const completude = new CompletudeMesures({
      statistiquesMesuresGenerales,
      mesuresSpecifiques,
    });

    expect(completude.completude().nombreTotalMesures).to.be(4);
  });

  it('calcule le nombre de mesures complétées : celles qui ont un statut', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { gouvernance: 'Gouvernance' },
      mesures: { A: {}, B: {}, C: {} },
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
      { mesuresSpecifiques: [{ categorie: 'gouvernance', statut: 'fait' }] },
      referentiel
    );

    const completude = new CompletudeMesures({
      statistiquesMesuresGenerales,
      mesuresSpecifiques,
    });

    expect(completude.completude().nombreMesuresCompletes).to.be(3);
  });
});
