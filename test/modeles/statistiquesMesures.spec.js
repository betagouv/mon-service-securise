const expect = require('expect.js');

const { ErreurCategorieInconnue, ErreurDonneesStatistiques } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const StatistiquesMesures = require('../../src/modeles/statistiquesMesures');

const elles = it;

describe('Les statistiques sur les mesures de sécurité', () => {
  const referentiel = Referentiel.creeReferentiel({
    categoriesMesures: { une: 'catégorie 1', deux: 'catégorie 2', trois: 'catégorie 3' },
  });

  elles('connaissent leurs catégories', () => {
    const stats = new StatistiquesMesures({
      une: { retenues: 4, misesEnOeuvre: 2 },
      deux: { retenues: 8, misesEnOeuvre: 6 },
    }, referentiel);

    expect(stats.categories()).to.eql(['une', 'deux']);
  });

  elles('vérifient que les catégories sont présentes dans le référentiel', (done) => {
    try {
      new StatistiquesMesures({
        identifiantInconnu: { retenues: 4, misesEnOeuvre: 2 },
      }, referentiel);
      done('La création aurait dû lever une erreur');
    } catch (e) {
      expect(e).to.be.a(ErreurCategorieInconnue);
      expect(e.message).to.equal("La catégorie \"identifiantInconnu\" n'est pas répertoriée");
      done();
    }
  });

  elles('vérifient la cohérence des nombres', (done) => {
    try {
      new StatistiquesMesures({ une: { retenues: 10, misesEnOeuvre: 11 } }, referentiel);
      done('La création aurait dû lever une erreur');
    } catch (e) {
      expect(e).to.be.a(ErreurDonneesStatistiques);
      expect(e.message).to.equal(
        'Les mesures mises en œuvre ne peuvent pas être supérieures en nombre aux mesures '
        + 'retenues (nombre inférieur à 10 attendu, 11 spécifié)'
      );
      done();
    }
  });

  elles('connaissent les mesures retenues pour une catégorie', () => {
    const stats = new StatistiquesMesures({
      une: { retenues: 5, misesEnOeuvre: 2 },
    }, referentiel);
    expect(stats.retenues('une')).to.equal(5);
  });

  elles('connaissent les mesures mises en œuvre pour une catégorie', () => {
    const stats = new StatistiquesMesures({
      une: { retenues: 5, misesEnOeuvre: 2 },
    }, referentiel);
    expect(stats.misesEnOeuvre('une')).to.equal(2);
  });

  elles("s'affichent au format JSON", () => {
    const stats = new StatistiquesMesures({
      une: { retenues: 4, misesEnOeuvre: 2 },
      deux: { retenues: 8, misesEnOeuvre: 6 },
    }, referentiel);

    expect(stats.toJSON()).to.eql({
      une: { retenues: 4, misesEnOeuvre: 2 },
      deux: { retenues: 8, misesEnOeuvre: 6 },
    });
  });
});
