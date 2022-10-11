const expect = require('expect.js');

const { ErreurCategorieInconnue, ErreurDonneesStatistiques } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const StatistiquesMesures = require('../../src/modeles/statistiquesMesures');

const elles = it;

describe('Les statistiques sur les mesures de sécurité', () => {
  const referentiel = Referentiel.creeReferentiel({
    indiceCyber: { coefficientIndispensables: 0.8, coefficientRecommandees: 0.2, noteMax: 5 },
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

  const verifieEgaliteNumerique = (valeurAttendue, valeurCalculee) => {
    const nbDecimales = 6;
    const precision = 0.5 * Number(`1e-${nbDecimales}`);

    if (Number.isNaN(valeurCalculee)) throw new Error('Valeur NaN inattendue');

    try {
      const difference = Number(
        parseFloat(Math.abs(valeurAttendue - valeurCalculee)).toPrecision(nbDecimales + 1)
      );
      expect(difference <= precision).to.be(true);
    } catch {
      throw new Error(`Échec ! On voulait ${valeurAttendue}, mais on a eu ${valeurCalculee}.`);
    }
  };

  elles('calculent le score par catégorie', () => {
    const stats = new StatistiquesMesures({
      une: {
        misesEnOeuvre: 3,
        retenues: 9,
        indispensables: { total: 4, fait: 2 },
        recommandees: { total: 5, fait: 1 },
      },
    }, referentiel);

    expect(referentiel.coefficientIndiceCyberMesuresIndispensables()).to.equal(0.8);
    expect(referentiel.coefficientIndiceCyberMesuresRecommandees()).to.equal(0.2);
    verifieEgaliteNumerique(
      (0.8 + 0.2 * (1 / 5)) * (2 / 4),
      stats.score('une'),
    );
  });

  describe("Lorsqu'il n'y a pas de mesure recommandée personnalisée", () => {
    elles('calculent le score en ne tenant compte que des mesures indispensables', () => {
      const stats = new StatistiquesMesures({
        une: {
          misesEnOeuvre: 2,
          retenues: 4,
          indispensables: { total: 4, fait: 2 },
          recommandees: { total: 0, fait: 0 },
        },
      }, referentiel);

      verifieEgaliteNumerique((2 / 4), stats.score('une'));
    });
  });

  describe("Lorsqu'il n'y a pas de mesure indispensable personnalisée", () => {
    elles('calculent le score en ne tenant compte que des mesures recommandées', () => {
      const stats = new StatistiquesMesures({
        une: {
          misesEnOeuvre: 2,
          retenues: 4,
          indispensables: { total: 0, fait: 0 },
          recommandees: { total: 4, fait: 1 },
        },
      }, referentiel);

      verifieEgaliteNumerique((1 / 4), stats.score('une'));
    });
  });

  elles("calculent l'indice cyber total", () => {
    const stats = new StatistiquesMesures({
      une: {
        misesEnOeuvre: 3,
        retenues: 13,
        indispensables: { total: 8, fait: 2 },
        recommandees: { total: 5, fait: 1 },
      },
      deux: {
        misesEnOeuvre: 3,
        retenues: 6,
        indispensables: { total: 4, fait: 3 },
        recommandees: { total: 2, fait: 0 },
      },
    }, referentiel);

    expect(referentiel.indiceCyberNoteMax()).to.equal(5);
    verifieEgaliteNumerique(5 * stats.score('une'), stats.indiceCyber().une);
    verifieEgaliteNumerique(5 * stats.score('deux'), stats.indiceCyber().deux);
    verifieEgaliteNumerique(
      5 * ((stats.score('une') * 13 + stats.score('deux') * 6) / (13 + 6)),
      stats.indiceCyber().total,
    );
  });

  elles('connaissent le nombre total de mesures indispensables', () => {
    const stats = new StatistiquesMesures({
      une: {
        misesEnOeuvre: 1,
        retenues: 2,
        indispensables: { total: 8 },
      },
      deux: {
        misesEnOeuvre: 1,
        retenues: 2,
        indispensables: { total: 4 },
      },
    }, referentiel);

    expect(stats.indispensables().total).to.equal(8 + 4);
  });

  elles('peuvent filtrer les totaux par mesures indispensables', () => {
    const stats = new StatistiquesMesures({
      une: {
        misesEnOeuvre: 1,
        retenues: 5,
        indispensables: { total: 12, enCours: 2, fait: 1 },
      },
      deux: {
        misesEnOeuvre: 2,
        retenues: 5,
        indispensables: { total: 15, enCours: 3, fait: 2 },
      },
    }, referentiel);

    expect(stats.indispensables().enCours).to.equal(2 + 3);
    expect(stats.indispensables().fait).to.equal(1 + 2);
    expect(stats.indispensables().total).to.equal(12 + 15);
  });
});
