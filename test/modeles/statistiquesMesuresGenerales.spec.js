const expect = require('expect.js');

const Referentiel = require('../../src/referentiel');
const { ErreurCategorieInconnue } = require('../../src/erreurs');
const {
  desStatistiques,
} = require('../constructeurs/constructeurStatistiquesMesuresGenerales');
describe('Les statistiques des mesures générales', () => {
  it('vérifient que les catégories sont présentes dans le référentiel', () => {
    const seulementGouvernance = Referentiel.creeReferentiel({
      categoriesMesures: { gouvernance: 'Gouvernance' },
    });

    expect(() => {
      const mesureProtection = { categorie: 'protection' };

      desStatistiques(seulementGouvernance)
        .avecMesuresPersonnalisees({ P1: mesureProtection })
        .construis();
    }).to.throwException((e) => {
      expect(e).to.be.a(ErreurCategorieInconnue);
      expect(e.message).to.equal(
        'La catégorie "protection" n\'est pas répertoriée'
      );
    });
  });

  it('calculent le nombre de mesures "Faites" par catégorie', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: {
        gouvernance: 'Gouvernance',
        resilience: 'Résilience',
        protection: 'Protection',
      },
      mesures: { G1: {}, G2: {}, R1: {} },
      statutsMesures: { fait: '' },
    });

    const stats = desStatistiques(referentiel)
      .surLesMesuresGenerales([
        { id: 'G1', statut: 'fait' },
        { id: 'G2', statut: 'fait' },
        { id: 'R1', statut: 'fait' },
      ])
      .avecMesuresPersonnalisees({
        G1: { categorie: 'gouvernance' },
        G2: { categorie: 'gouvernance' },
        R1: { categorie: 'resilience' },
      })
      .construis();

    expect(stats.faites('gouvernance')).to.eql(2);
    expect(stats.faites('resilience')).to.eql(1);
    expect(stats.faites('protection')).to.eql(0);
  });

  it('calculent le nombre de mesures "En cours" par catégorie', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: {
        gouvernance: 'Gouvernance',
        resilience: 'Résilience',
        protection: 'Protection',
      },
      mesures: { G1: {}, G2: {}, R1: {} },
      statutsMesures: { enCours: '' },
    });

    const stats = desStatistiques(referentiel)
      .surLesMesuresGenerales([
        { id: 'G1', statut: 'enCours' },
        { id: 'G2', statut: 'enCours' },
        { id: 'R1', statut: 'enCours' },
      ])
      .avecMesuresPersonnalisees({
        G1: { categorie: 'gouvernance' },
        G2: { categorie: 'gouvernance' },
        R1: { categorie: 'resilience' },
      })
      .construis();

    expect(stats.enCours('gouvernance')).to.eql(2);
    expect(stats.enCours('resilience')).to.eql(1);
    expect(stats.enCours('protection')).to.eql(0);
  });

  it('calculent le nombre de mesures "Non faites" par catégorie', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: {
        gouvernance: 'Gouvernance',
        resilience: 'Résilience',
        protection: 'Protection',
      },
      mesures: { G1: {}, G2: {}, R1: {} },
      statutsMesures: { nonFait: '' },
    });

    const stats = desStatistiques(referentiel)
      .surLesMesuresGenerales([
        { id: 'G1', statut: 'nonFait' },
        { id: 'G2', statut: 'nonFait' },
        { id: 'R1', statut: 'nonFait' },
      ])
      .avecMesuresPersonnalisees({
        G1: { categorie: 'gouvernance' },
        G2: { categorie: 'gouvernance' },
        R1: { categorie: 'resilience' },
      })
      .construis();

    expect(stats.nonFaites('gouvernance')).to.eql(2);
    expect(stats.nonFaites('resilience')).to.eql(1);
    expect(stats.nonFaites('protection')).to.eql(0);
  });

  it("calculent le nombre de mesures sans statut par catégorie : les mesures personnalisées qui sont absentes des mesures générales ou les générales sans statut (même si ce n'est pas censé arriver)", () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: {
        gouvernance: 'Gouvernance',
        resilience: 'Résilience',
        protection: 'Protection',
      },
      mesures: { G1: {}, G2: {}, R1: {} },
      statutsMesures: { fait: '' },
    });

    const g2SansStatut = { id: 'G2' };
    const stats = desStatistiques(referentiel)
      .surLesMesuresGenerales([g2SansStatut])
      .avecMesuresPersonnalisees({
        G1: { categorie: 'gouvernance' },
        G2: { categorie: 'gouvernance' },
        R1: { categorie: 'resilience' },
      })
      .construis();

    expect(stats.sansStatut('gouvernance')).to.be(2); // G2 sans statut, et G1 absente des générales
    expect(stats.sansStatut('resilience')).to.be(1); // R1 absente des générales
  });

  describe('quand elles calculent le nombre de mesures indispensables', () => {
    it('donnent le nombre de mesures au statut "En cours" qui sont indispensables', () => {
      const referentiel = Referentiel.creeReferentiel({
        categoriesMesures: { gouvernance: 'Gouvernance' },
        mesures: { A: {}, B: {}, C: {} },
        statutsMesures: { fait: '', enCours: '' },
      });

      const enCoursEtIndispensable = { id: 'A', statut: 'enCours' };
      const indispensableMaisPasEnCours = { id: 'B', statut: 'fait' };
      const enCoursMaisPasIndispensable = { id: 'C', statut: 'enCours' };

      const stats = desStatistiques(referentiel)
        .surLesMesuresGenerales([
          enCoursEtIndispensable,
          indispensableMaisPasEnCours,
          enCoursMaisPasIndispensable,
        ])
        .avecMesuresPersonnalisees({
          A: { indispensable: true, categorie: 'gouvernance' },
          B: { indispensable: true, categorie: 'gouvernance' },
          C: { categorie: 'gouvernance' },
        })
        .construis();

      expect(stats.indispensables().enCours).to.be(1);
    });

    it('donnent le nombre de mesures au statut "Non fait" qui sont indispensables', () => {
      const referentiel = Referentiel.creeReferentiel({
        categoriesMesures: { gouvernance: 'Gouvernance' },
        mesures: { A: {}, B: {}, C: {} },
        statutsMesures: { fait: '', nonFait: '' },
      });

      const nonFaitEtIndispensable = { id: 'A', statut: 'nonFait' };
      const indispensableMaisPasNonFait = { id: 'B', statut: 'fait' };
      const nonFaitMaisPasIndispensable = { id: 'C', statut: 'nonFait' };

      const stats = desStatistiques(referentiel)
        .surLesMesuresGenerales([
          nonFaitEtIndispensable,
          indispensableMaisPasNonFait,
          nonFaitMaisPasIndispensable,
        ])
        .avecMesuresPersonnalisees({
          A: { indispensable: true, categorie: 'gouvernance' },
          B: { indispensable: true, categorie: 'gouvernance' },
          C: { categorie: 'gouvernance' },
        })
        .construis();

      expect(stats.indispensables().nonFait).to.be(1);
    });

    it('donnent le nombre de mesures au statut "Fait" qui sont indispensables', () => {
      const referentiel = Referentiel.creeReferentiel({
        categoriesMesures: { gouvernance: 'Gouvernance' },
        mesures: { A: {}, B: {}, C: {} },
        statutsMesures: { fait: '', nonFait: '' },
      });

      const faitEtIndispensable = { id: 'A', statut: 'fait' };
      const indispensableMaisPasFait = { id: 'B', statut: 'nonFait' };
      const faitMaisPasIndispensable = { id: 'C', statut: 'fait' };

      const stats = desStatistiques(referentiel)
        .surLesMesuresGenerales([
          faitEtIndispensable,
          indispensableMaisPasFait,
          faitMaisPasIndispensable,
        ])
        .avecMesuresPersonnalisees({
          A: { indispensable: true, categorie: 'gouvernance' },
          B: { indispensable: true, categorie: 'gouvernance' },
          C: { categorie: 'gouvernance' },
        })
        .construis();

      expect(stats.indispensables().fait).to.be(1);
    });

    it('donnent le nombre de mesures "restantes" : ce sont celles qui ne sont pas au statut "Fait"', () => {
      const referentiel = Referentiel.creeReferentiel({
        categoriesMesures: { gouvernance: 'Gouvernance' },
        mesures: { A: {}, B: {}, C: {} },
        statutsMesures: { fait: '', enCours: '', nonFait: '' },
      });

      const enCours = { id: 'A', statut: 'enCours' };
      const nonFaite = { id: 'B', statut: 'nonFait' };
      const faite = { id: 'C', statut: 'fait' };
      const sansStatutCarSeulementDansPerso = {
        indispensable: true,
        categorie: 'gouvernance',
      };

      const stats = desStatistiques(referentiel)
        .surLesMesuresGenerales([enCours, nonFaite, faite])
        .avecMesuresPersonnalisees({
          A: { indispensable: true, categorie: 'gouvernance' },
          B: { indispensable: true, categorie: 'gouvernance' },
          C: { indispensable: true, categorie: 'gouvernance' },
          D: sansStatutCarSeulementDansPerso,
        })
        .construis();

      // Une seule mesure faite sur 4 : il y en a 3 "restantes".
      expect(stats.indispensables().restant).to.be(3);
    });

    it('donnent le nombre de mesures "à remplir" : celles qui n\'ont pas de statut', () => {
      const referentiel = Referentiel.creeReferentiel({
        categoriesMesures: { gouvernance: 'Gouvernance' },
        mesures: { A: {}, B: {} },
        statutsMesures: { nonFait: '' },
      });

      // Une mesure générale sans statut est impossible à obtenir via l'IHM… mais on se protège quand même
      const sansStatut = { id: 'A' };
      const avecStatutDoncNeComptePas = { id: 'B', statut: 'nonFait' };
      const sansStatutCarSeulementDansPerso = {
        indispensable: true,
        categorie: 'gouvernance',
      };

      const stats = desStatistiques(referentiel)
        .surLesMesuresGenerales([sansStatut, avecStatutDoncNeComptePas])
        .avecMesuresPersonnalisees({
          A: { indispensable: true, categorie: 'gouvernance' },
          B: { indispensable: true, categorie: 'gouvernance' },
          C: sansStatutCarSeulementDansPerso,
        })
        .construis();

      expect(stats.indispensables().aRemplir).to.be(2); // On compte A et C
    });

    it('donnent le nombre total de mesures qui sont indispensables', () => {
      const referentiel = Referentiel.creeReferentiel({
        categoriesMesures: { gouvernance: 'Gouvernance' },
        mesures: { A: {}, B: {}, C: {}, D: {}, E: {} },
        statutsMesures: { fait: '', nonFait: '' },
      });

      const indispensableFaite = { id: 'A', statut: 'fait' };
      const indispensableNonFaite = { id: 'B', statut: 'nonFait' };
      const indispensableSansStatut = { id: 'C' };
      const nonIndispensable = { id: 'D', statut: 'fait' };
      const indispensableSeulementPersonnalisee = {
        indispensable: true,
        categorie: 'gouvernance',
      };

      const stats = desStatistiques(referentiel)
        .surLesMesuresGenerales([
          indispensableFaite,
          indispensableNonFaite,
          indispensableSansStatut,
          nonIndispensable,
        ])
        .avecMesuresPersonnalisees({
          A: { indispensable: true, categorie: 'gouvernance' },
          B: { indispensable: true, categorie: 'gouvernance' },
          C: { indispensable: true, categorie: 'gouvernance' },
          D: { categorie: 'gouvernance' },
          E: indispensableSeulementPersonnalisee,
        })
        .construis();

      expect(stats.indispensables().total).to.be(4);
    });
  });
});
