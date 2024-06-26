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
