const expect = require('expect.js');

const Referentiel = require('../../src/referentiel');
const {
  desStatistiques,
} = require('../constructeurs/constructeurStatistiquesMesuresGenerales');
const { IndiceCyber } = require('../../src/modeles/indiceCyber');

describe("L'indice cyber", () => {
  const coefficientIndispensables = 0.8;
  const coefficientRecommandees = 0.2;
  const coefficientStatutPartiel = 0.5;
  const noteMax = 5;

  describe('sur demande du taux par catégorie', () => {
    it("calcule le taux de la catégorie en prenant en compte le nombre d'indispensables faites et partielles et le nombre de recommandées faites et partielles", () => {
      const referentiel = Referentiel.creeReferentiel({
        indiceCyber: {
          coefficientIndispensables,
          coefficientRecommandees,
          coefficientStatutPartiel,
          noteMax,
        },
        categoriesMesures: { gouvernance: 'Gouvernance' },
        mesures: { A: {}, B: {}, C: {}, D: {}, E: {}, F: {}, G: {} },
        statutsMesures: { fait: '', enCours: '', nonFait: '' },
      });

      const indispensableFaite = { id: 'A', statut: 'fait' };
      const autreIndispensableFaite = { id: 'B', statut: 'fait' };
      const indispensablePartielle = { id: 'C', statut: 'enCours' };
      const indispensableNonFait = { id: 'D', statut: 'nonFait' };

      const recommandeeFaite = { id: 'E', statut: 'fait' };
      const recommandeePartielle = { id: 'F', statut: 'enCours' };
      const recommandeeNonFaite = { id: 'G', statut: 'nonFait' };

      const statistiquesMesuresGenerales = desStatistiques(referentiel)
        .surLesMesuresGenerales([
          indispensableFaite,
          autreIndispensableFaite,
          indispensablePartielle,
          indispensableNonFait,
          recommandeeFaite,
          recommandeePartielle,
          recommandeeNonFaite,
        ])
        .avecMesuresPersonnalisees({
          A: { categorie: 'gouvernance', indispensable: true },
          B: { categorie: 'gouvernance', indispensable: true },
          C: { categorie: 'gouvernance', indispensable: true },
          D: { categorie: 'gouvernance', indispensable: true },
          E: { categorie: 'gouvernance' },
          F: { categorie: 'gouvernance' },
          G: { categorie: 'gouvernance' },
        })
        .construis();

      const indiceCyber = new IndiceCyber(
        statistiquesMesuresGenerales.totauxParTypeEtParCategorie(),
        referentiel
      );

      // 1 mesure recommandée faite et 1 mesure recommandée partielle, sur 3 mesures totales
      const fractionRecommandees = (1 + 1 * coefficientStatutPartiel) / 3;
      // 2 mesures indispensables faites et 1 mesure indispensable partielle, sur 4 mesures totales
      const fractionIndispensables = (2 + 1 * coefficientStatutPartiel) / 4;

      const poidsMesuresRecommandees =
        coefficientRecommandees * fractionRecommandees;
      const poidsMesuresRecommandeesAjuste =
        poidsMesuresRecommandees * fractionIndispensables;

      const poidsMesuresIndispensables =
        coefficientIndispensables * fractionIndispensables;

      expect(indiceCyber.tauxDeLaCategorie('gouvernance')).to.eql(
        poidsMesuresRecommandeesAjuste + poidsMesuresIndispensables
      );

      // 0,5625
      // Les indispensables : 2 faites, 1 partielle, 1 non faite
      // … donc 2 points + 0,5 point + 0 point divisé par 4 mesures indispensables : 2,5 / 4 = 0,625
      // Les recommandées : 1 faite, 1 partielle, 1 non faite
      // … donc 1 point + 0,5 point + 0 point divisé par 3 mesures recommandées : 1,5 / 3 = 0,5
      // Le poids des indispensables est le score des indispensables * coeff des indispensables : 0,625 * 0,8 = 0,5
      // Le poids des recommandées est le score des recommandées * coeff des recommandées : 0,5 * 0,2 = 0,1
      // … mais il faut ajuster ce poids des recommandées par une pondération par rapport aux indispensables
      // … donc on multiplie ce poids des recommandées par le score des indispensables : 0,1 * 0,625 = 0,0625
      // Donc le total vaut le poids des indispensables + le poids ajusté des recommandées : 0,5 + 0,0625 = 0,5625
      expect(indiceCyber.tauxDeLaCategorie('gouvernance')).to.be(0.5625);
    });

    it("ne tient compte que des mesures indispensables s'il n'y a pas de mesures recommandées", () => {
      const referentiel = Referentiel.creeReferentiel({
        indiceCyber: {
          coefficientIndispensables,
          coefficientRecommandees,
          coefficientStatutPartiel,
          noteMax,
        },
        categoriesMesures: { gouvernance: 'Gouvernance' },
        mesures: { A: {}, B: {}, C: {} },
        statutsMesures: { fait: '', enCours: '', nonFait: '' },
      });

      const indispensableFaite = { id: 'A', statut: 'fait' };
      const autreIndispensableFaite = { id: 'B', statut: 'enCours' };
      const indispensableNonFaite = { id: 'C', statut: 'nonFait' };
      const nbIndispensablesFaites = 1;
      const nbIndispensablesPartielles = 1;
      const nbTotalIndispensables = 3;

      const statistiquesMesuresGenerales = desStatistiques(referentiel)
        .surLesMesuresGenerales([
          indispensableFaite,
          autreIndispensableFaite,
          indispensableNonFaite,
        ])
        .avecMesuresPersonnalisees({
          A: { categorie: 'gouvernance', indispensable: true },
          B: { categorie: 'gouvernance', indispensable: true },
          C: { categorie: 'gouvernance', indispensable: true },
        })
        .construis();

      const indiceCyber = new IndiceCyber(
        statistiquesMesuresGenerales.totauxParTypeEtParCategorie(),
        referentiel
      );

      const taux = indiceCyber.tauxDeLaCategorie('gouvernance');
      expect(taux).to.eql(
        (nbIndispensablesFaites +
          nbIndispensablesPartielles * coefficientStatutPartiel) /
          nbTotalIndispensables
      );

      // 0,5 car on a 1 mesure faite, 1 mesure partielle, 1 mesure non faite
      // … donc 1 point + 0,5 point + 0 point, divisé par 3 mesures au total : 1,5 / 3 = 0,5
      expect(taux).to.be(0.5);
    });

    it("ne tient compte que des mesures recommandées s'il n'y a pas de mesures indispensables", () => {
      const referentiel = Referentiel.creeReferentiel({
        indiceCyber: {
          coefficientIndispensables,
          coefficientRecommandees,
          coefficientStatutPartiel,
          noteMax,
        },
        categoriesMesures: { gouvernance: 'Gouvernance' },
        mesures: { A: {}, B: {}, C: {} },
        statutsMesures: { fait: '', enCours: '', nonFait: '' },
      });

      const recommandeeFaite = { id: 'A', statut: 'fait' };
      const recommandeePartielle = { id: 'B', statut: 'enCours' };
      const recommandeeNonFaite = { id: 'C', statut: 'nonFait' };
      const nbRecommandeeFaite = 1;
      const nbRecommandeePartielle = 1;
      const nbTotalRecommandees = 3;

      const statistiquesMesuresGenerales = desStatistiques(referentiel)
        .surLesMesuresGenerales([
          recommandeeFaite,
          recommandeePartielle,
          recommandeeNonFaite,
        ])
        .avecMesuresPersonnalisees({
          A: { categorie: 'gouvernance' },
          B: { categorie: 'gouvernance' },
          C: { categorie: 'gouvernance' },
        })
        .construis();

      const indiceCyber = new IndiceCyber(
        statistiquesMesuresGenerales.totauxParTypeEtParCategorie(),
        referentiel
      );

      const taux = indiceCyber.tauxDeLaCategorie('gouvernance');
      expect(taux).to.eql(
        (nbRecommandeeFaite +
          nbRecommandeePartielle * coefficientStatutPartiel) /
          nbTotalRecommandees
      );

      // 0,5 car on a 1 mesure faite, 1 mesure partielle, 1 mesure non faite
      // … donc 1 point + 0,5 point + 0 point, divisé par 3 mesures au total : 1,5 / 3 = 0,5
      expect(taux).to.be(0.5);
    });
  });

  it("calcul l'indice cyber total", () => {
    const referentiel = Referentiel.creeReferentiel({
      indiceCyber: {
        coefficientIndispensables,
        coefficientRecommandees,
        noteMax,
      },
      categoriesMesures: {
        gouvernance: 'Gouvernance',
        protection: 'Protection',
      },
      mesures: { A: {}, B: {}, C: {}, D: {}, E: {}, F: {} },
      statutsMesures: { fait: '', enCours: '' },
    });

    const indispensableGouvernanceFaite = { id: 'A', statut: 'fait' };
    const indispensableGouvernanceNonFaite = { id: 'B', statut: 'enCours' };
    const nbTotalIndispensablesGouvernance = 2;

    const indispensableProtectionFaite = { id: 'C', statut: 'fait' };
    const autreIndispensableProtectionFaite = { id: 'D', statut: 'fait' };
    const indispensableProtectionNonFaite = { id: 'E', statut: 'enCours' };
    const nbTotalIndispensablesProtection = 3;

    const statistiquesMesuresGenerales = desStatistiques(referentiel)
      .surLesMesuresGenerales([
        indispensableGouvernanceFaite,
        indispensableGouvernanceNonFaite,
        indispensableProtectionFaite,
        autreIndispensableProtectionFaite,
        indispensableProtectionNonFaite,
      ])
      .avecMesuresPersonnalisees({
        A: { categorie: 'gouvernance', indispensable: true },
        B: { categorie: 'gouvernance', indispensable: true },
        C: { categorie: 'protection', indispensable: true },
        D: { categorie: 'protection', indispensable: true },
        E: { categorie: 'protection', indispensable: true },
      })
      .construis();

    const indiceCyber = new IndiceCyber(
      statistiquesMesuresGenerales.totauxParTypeEtParCategorie(),
      referentiel
    );

    const poidsMesuresGouvernance =
      indiceCyber.tauxDeLaCategorie('gouvernance') *
      nbTotalIndispensablesGouvernance;
    const poidsMesuresProtection =
      indiceCyber.tauxDeLaCategorie('protection') *
      nbTotalIndispensablesProtection;
    const nbMesuresTotal =
      nbTotalIndispensablesGouvernance + nbTotalIndispensablesProtection;

    expect(indiceCyber.indiceCyber().total).to.eql(
      noteMax *
        ((poidsMesuresGouvernance + poidsMesuresProtection) / nbMesuresTotal)
    );
  });
});
