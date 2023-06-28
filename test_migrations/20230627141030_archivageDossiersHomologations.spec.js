const expect = require('expect.js');

const {
  archiveDossiers,
} = require('../migrations/20230627141030_archivageDossiersHomologations');

describe("La migration de l'archivage des dossiers d'homologation", () => {
  it("n'archive pas les dossiers non finalisés", () => {
    const dossiers = [{ finalise: false }, {}];

    archiveDossiers(dossiers);

    expect(dossiers[0].archive).to.be(undefined);
    expect(dossiers[1].archive).to.be(undefined);
  });

  it('archive tous les dossiers finalisés sauf le plus récent', () => {
    const dossierRecent = {
      finalise: true,
      decision: { dateHomologation: '2023-06-27' },
    };
    const vieuxDossier = {
      finalise: true,
      decision: { dateHomologation: '2020-01-01' },
    };

    archiveDossiers([dossierRecent, vieuxDossier]);

    expect(dossierRecent.archive).to.be(undefined);
    expect(vieuxDossier.archive).to.be(true);
  });

  it('ne considère pas les dossiers déjà archivés', () => {
    const dossier = {
      finalise: true,
      decision: { dateHomologation: '2022-01-21' },
    };
    const dossierPlusRecentMaisArchive = {
      finalise: true,
      decision: { dateHomologation: '2023-01-01' },
      archive: true,
    };

    archiveDossiers([dossier, dossierPlusRecentMaisArchive]);

    expect(dossier.archive).to.be(undefined);
  });

  it("archive systématiquement les dossiers finalisés qui n'ont pas de décision", () => {
    const dossier = {
      finalise: true,
      decision: { dateHomologation: '2023-06-27' },
    };
    const dossierFinaliseSansDecision = {
      finalise: true,
    };
    const dossierFinaliseSansDateHomologation = {
      finalise: true,
      decision: {},
    };

    archiveDossiers([
      dossier,
      dossierFinaliseSansDecision,
      dossierFinaliseSansDateHomologation,
    ]);

    expect(dossier.archive).to.be(undefined);
    expect(dossierFinaliseSansDecision.archive).to.be(true);
    expect(dossierFinaliseSansDateHomologation.archive).to.be(true);
  });
});
