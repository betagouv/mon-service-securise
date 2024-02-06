const expect = require('expect.js');

const Referentiel = require('../../src/referentiel');
const {
  desStatistiques,
} = require('../constructeurs/constructeurStatistiquesMesuresGenerales');
const { IndiceCyber } = require('../../src/modeles/indiceCyber');

describe("L'indice cyber", () => {
  const coefficientIndispensables = 0.8;
  const coefficientRecommandees = 0.2;
  const noteMax = 5;

  describe('sur demande du taux par catégorie', () => {
    it("calcule le taux de la catégorie en prenant en compte le nombre d'indispensables faites et le nombre de recommandées faites", () => {
      const referentiel = Referentiel.creeReferentiel({
        indiceCyber: {
          coefficientIndispensables,
          coefficientRecommandees,
          noteMax,
        },
        categoriesMesures: { gouvernance: 'Gouvernance' },
        mesures: { A: {}, B: {}, C: {}, D: {}, E: {}, F: {} },
        statutsMesures: { fait: '', enCours: '' },
      });

      const indispensableFaite = { id: 'A', statut: 'fait' };
      const autreIndispensableFaite = { id: 'B', statut: 'fait' };
      const indispensableEnCours = { id: 'C', statut: 'enCours' };

      const recommandeeFaite = { id: 'D', statut: 'fait' };
      const recommandeeNonFaite = { id: 'E', statut: 'enCours' };

      const statistiquesMesuresGenerales = desStatistiques(referentiel)
        .surLesMesuresGenerales([
          indispensableFaite,
          autreIndispensableFaite,
          indispensableEnCours,
          recommandeeFaite,
          recommandeeNonFaite,
        ])
        .avecMesuresPersonnalisees({
          A: { categorie: 'gouvernance', indispensable: true },
          B: { categorie: 'gouvernance', indispensable: true },
          C: { categorie: 'gouvernance', indispensable: true },
          D: { categorie: 'gouvernance' },
          E: { categorie: 'gouvernance' },
        })
        .construis();

      const indiceCyber = new IndiceCyber(
        statistiquesMesuresGenerales.totauxParTypeEtParCategorie(),
        referentiel
      );

      const poidsMesuresRecommandees = coefficientRecommandees * (1 / 2); // 0.1 …
      const poidsMesuresRecommandeesAjuste = poidsMesuresRecommandees * (2 / 3); // … qui descend à 0.0666
      const poidsMesuresIndispensables = coefficientIndispensables * (2 / 3); // 0.5333
      expect(indiceCyber.tauxDeLaCategorie('gouvernance')).to.eql(
        poidsMesuresRecommandeesAjuste + poidsMesuresIndispensables
      );
    });

    it("ne tient compte que des mesures indispensables s'il n'y a pas de mesures recommandées", () => {
      const referentiel = Referentiel.creeReferentiel({
        indiceCyber: {
          coefficientIndispensables,
          coefficientRecommandees,
          noteMax,
        },
        categoriesMesures: { gouvernance: 'Gouvernance' },
        mesures: { A: {}, B: {}, C: {} },
        statutsMesures: { fait: '', enCours: '' },
      });

      const indispensableFaite = { id: 'A', statut: 'fait' };
      const autreIndispensableFaite = { id: 'B', statut: 'fait' };
      const indispensableNonFaite = { id: 'C', statut: 'enCours' };
      const nbIndispensablesFaites = 2;
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
      expect(taux).to.eql(nbIndispensablesFaites / nbTotalIndispensables);
    });

    it("ne tient compte que des mesures recommandées s'il n'y a pas de mesures indispensables", () => {
      const referentiel = Referentiel.creeReferentiel({
        indiceCyber: {
          coefficientIndispensables,
          coefficientRecommandees,
          noteMax,
        },
        categoriesMesures: { gouvernance: 'Gouvernance' },
        mesures: { A: {}, B: {} },
        statutsMesures: { fait: '', enCours: '' },
      });

      const recommandeeFaite = { id: 'A', statut: 'fait' };
      const recommandeeNonFaite = { id: 'B', statut: 'enCours' };
      const nbRecommandeeFaite = 1;
      const nbTotalRecommandees = 2;

      const statistiquesMesuresGenerales = desStatistiques(referentiel)
        .surLesMesuresGenerales([recommandeeFaite, recommandeeNonFaite])
        .avecMesuresPersonnalisees({
          A: { categorie: 'gouvernance' },
          B: { categorie: 'gouvernance' },
        })
        .construis();

      const indiceCyber = new IndiceCyber(
        statistiquesMesuresGenerales.totauxParTypeEtParCategorie(),
        referentiel
      );

      const taux = indiceCyber.tauxDeLaCategorie('gouvernance');
      expect(taux).to.eql(nbRecommandeeFaite / nbTotalRecommandees);
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
