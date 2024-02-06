const expect = require('expect.js');

const {
  ErreurCategorieInconnue,
  ErreurDonneesStatistiques,
} = require('../../src/erreurs');
const MesuresSpecifiques = require('../../src/modeles/mesuresSpecifiques');
const Referentiel = require('../../src/referentiel');
const StatistiquesMesures = require('../../src/modeles/statistiquesMesures');

const elles = it;

describe('Les statistiques sur les mesures de sécurité', () => {
  const referentiel = Referentiel.creeReferentiel({
    indiceCyber: {
      coefficientIndispensables: 0.8,
      coefficientRecommandees: 0.2,
      noteMax: 5,
    },
    categoriesMesures: {
      une: 'catégorie 1',
      deux: 'catégorie 2',
      trois: 'catégorie 3',
    },
  });

  elles('connaissent leurs catégories', () => {
    const stats = new StatistiquesMesures(
      {
        une: { retenues: 4, misesEnOeuvre: 2 },
        deux: { retenues: 8, misesEnOeuvre: 6 },
      },
      referentiel
    );

    expect(stats.categories()).to.eql(['une', 'deux']);
  });

  elles(
    'vérifient que les catégories sont présentes dans le référentiel',
    (done) => {
      try {
        new StatistiquesMesures(
          {
            identifiantInconnu: { retenues: 4, misesEnOeuvre: 2 },
          },
          referentiel
        );
        done('La création aurait dû lever une erreur');
      } catch (e) {
        expect(e).to.be.a(ErreurCategorieInconnue);
        expect(e.message).to.equal(
          'La catégorie "identifiantInconnu" n\'est pas répertoriée'
        );
        done();
      }
    }
  );

  elles('vérifient la cohérence des nombres', (done) => {
    try {
      new StatistiquesMesures(
        { une: { retenues: 10, misesEnOeuvre: 11 } },
        referentiel
      );
      done('La création aurait dû lever une erreur');
    } catch (e) {
      expect(e).to.be.a(ErreurDonneesStatistiques);
      expect(e.message).to.equal(
        'Les mesures mises en œuvre ne peuvent pas être supérieures en nombre aux mesures ' +
          'retenues (nombre inférieur à 10 attendu, 11 spécifié)'
      );
      done();
    }
  });

  elles('connaissent les mesures mises en œuvre pour une catégorie', () => {
    const stats = new StatistiquesMesures(
      {
        une: { retenues: 5, misesEnOeuvre: 2 },
      },
      referentiel
    );
    expect(stats.misesEnOeuvre('une')).to.equal(2);
  });

  elles('connaissent les mesures en cours pour une catégorie', () => {
    const stats = new StatistiquesMesures(
      {
        une: { retenues: 5, misesEnOeuvre: 2 },
      },
      referentiel
    );
    expect(stats.enCours('une')).to.equal(5 - 2);
  });

  elles('connaissent les mesures non faites pour une catégorie', () => {
    const stats = new StatistiquesMesures(
      {
        une: {
          misesEnOeuvre: 3,
          retenues: 9,
          indispensables: { total: 4, nonFait: 2 },
          recommandees: { total: 5, nonFait: 1 },
        },
      },
      referentiel
    );

    expect(stats.nonFaites('une')).to.equal(2 + 1);
  });

  elles('connaissent les mesures à remplir pour toutes les catégories', () => {
    const deuxNonRemplies = {
      misesEnOeuvre: 16,
      retenues: 16,
      indispensables: { total: 8, fait: 7, enCours: 0, nonFait: 0 },
      recommandees: { total: 10, fait: 9, enCours: 0, nonFait: 0 },
    };

    const stats = new StatistiquesMesures(
      {
        une: deuxNonRemplies,
        deux: deuxNonRemplies,
        trois: deuxNonRemplies,
      },
      referentiel
    );

    expect(stats.aRemplirToutesCategories()).to.equal(3 * 2);
  });

  elles("s'affichent au format JSON", () => {
    const stats = new StatistiquesMesures(
      {
        une: { retenues: 4, misesEnOeuvre: 2 },
        deux: { retenues: 8, misesEnOeuvre: 6 },
      },
      referentiel
    );

    expect(stats.toJSON()).to.eql({
      une: { retenues: 4, misesEnOeuvre: 2 },
      deux: { retenues: 8, misesEnOeuvre: 6 },
    });
  });

  elles('connaissent le nombre total de mesures indispensables', () => {
    const stats = new StatistiquesMesures(
      {
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
      },
      referentiel
    );

    expect(stats.indispensables().total).to.equal(8 + 4);
  });

  elles('peuvent filtrer les totaux par mesures indispensables', () => {
    const stats = new StatistiquesMesures(
      {
        une: {
          misesEnOeuvre: 1,
          retenues: 5,
          indispensables: { total: 12, enCours: 2, fait: 1, nonFait: 8 },
        },
        deux: {
          misesEnOeuvre: 2,
          retenues: 5,
          indispensables: { total: 15, enCours: 3, fait: 2, nonFait: 4 },
        },
      },
      referentiel
    );

    expect(stats.indispensables()).to.eql({
      enCours: 2 + 3,
      fait: 1 + 2,
      total: 12 + 15,
      restant: 12 + 15 - (1 + 2),
      nonFait: 8 + 4,
      aRemplir: 12 + 15 - (1 + 2) - (2 + 3) - (8 + 4),
    });
  });

  elles('peuvent filtrer les totaux par mesures recommandées', () => {
    const stats = new StatistiquesMesures(
      {
        une: {
          misesEnOeuvre: 1,
          retenues: 5,
          recommandees: { total: 12, enCours: 2, fait: 1, nonFait: 8 },
        },
        deux: {
          misesEnOeuvre: 2,
          retenues: 5,
          recommandees: { total: 15, enCours: 3, fait: 2, nonFait: 4 },
        },
      },
      referentiel
    );

    const recommandees = stats.recommandees();
    expect(recommandees).to.eql({
      enCours: 2 + 3,
      fait: 1 + 2,
      total: 12 + 15,
      restant: 12 + 15 - (1 + 2),
      nonFait: 8 + 4,
      aRemplir: 12 + 15 - (1 + 2) - (2 + 3) - (8 + 4),
    });
  });

  describe('sur demande de la complétude', () => {
    const troisRempliesSurDix = { total: 10, fait: 1, enCours: 1, nonFait: 1 };
    const quatreRempliesSurDix = { total: 10, fait: 2, enCours: 1, nonFait: 1 };

    elles(
      'savent calculer la complétude à partir des mesures personnalisées fournies',
      () => {
        const aucuneSpecifique = new MesuresSpecifiques();
        const statsDeuxCategories = new StatistiquesMesures(
          {
            une: {
              indispensables: troisRempliesSurDix,
              recommandees: quatreRempliesSurDix,
              retenues: 1 + 1 + (2 + 1),
              misesEnOeuvre: 1 + 2,
            },
            deux: {
              indispensables: troisRempliesSurDix,
              recommandees: quatreRempliesSurDix,
              retenues: 1 + 1 + (2 + 1),
              misesEnOeuvre: 1 + 2,
            },
          },
          referentiel,
          aucuneSpecifique
        );

        expect(statsDeuxCategories.completude()).to.eql({
          nombreTotalMesures: (10 + 10) * 2,
          nombreMesuresCompletes: (3 + 4) * 2,
        });
      }
    );

    elles(
      'intègrent au calcul les mesures spécifiques qui sont fournies',
      () => {
        const uneSpecifiqueRemplieSurDeux = new MesuresSpecifiques(
          { mesuresSpecifiques: [{ statut: 'fait' }, { statut: '' }] },
          referentiel
        );

        const statsUneCategorie = new StatistiquesMesures(
          {
            une: {
              indispensables: troisRempliesSurDix,
              recommandees: quatreRempliesSurDix,
              retenues: 1 + 1 + (2 + 1),
              misesEnOeuvre: 1 + 2,
            },
          },
          referentiel,
          uneSpecifiqueRemplieSurDeux
        );

        expect(statsUneCategorie.completude()).to.eql({
          nombreTotalMesures: 10 + 10 + 2,
          nombreMesuresCompletes: 3 + 4 + 1,
        });
      }
    );
  });

  elles(
    'savent créer un JSON de statistiques à 0 à partir de statuts et de categories',
    () => {
      const statsZero = StatistiquesMesures.donneesAZero(
        ['fait', 'enCours', 'nonFait'],
        ['categorieA', 'categorieB']
      );

      expect(statsZero).to.eql({
        categorieA: {
          indispensables: { total: 0, fait: 0, enCours: 0, nonFait: 0 },
          recommandees: { total: 0, fait: 0, enCours: 0, nonFait: 0 },
          misesEnOeuvre: 0,
          retenues: 0,
        },
        categorieB: {
          indispensables: { total: 0, fait: 0, enCours: 0, nonFait: 0 },
          recommandees: { total: 0, fait: 0, enCours: 0, nonFait: 0 },
          misesEnOeuvre: 0,
          retenues: 0,
        },
      });
    }
  );
});
