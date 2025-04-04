const expect = require('expect.js');
const { tenteDeHacherAvecUnNouveauSel } = require('./migrationHash');

describe("L'outil de migration de sels de hachage", () => {
  it('hache avec un nouveau sel et augmente la version', () => {
    const nouveauHash = tenteDeHacherAvecUnNouveauSel(
      'v1:une chaine-hasheeAvecV1',
      2,
      'un sel',
      (chaine) => `${chaine}-hasheeAvecV2`,
      'v1'
    );

    expect(nouveauHash).to.be('v1-v2:une chaine-hasheeAvecV1-hasheeAvecV2');
  });

  it('ne fait rien si la version du hash de la chaine ne correspond pas à la version attendue', () => {
    const nouveauHash = tenteDeHacherAvecUnNouveauSel(
      'v1-v2:une chaine-hasheeAvecV1-hasheeAvecV2',
      4,
      'un sel',
      (chaine) => `${chaine}-hasheeAvecV4`,
      'v1-v2-v3'
    );

    expect(nouveauHash).to.be('v1-v2:une chaine-hasheeAvecV1-hasheeAvecV2');
  });

  it('ne fait rien si la chaine est non définie', () => {
    const nouveauHash = tenteDeHacherAvecUnNouveauSel(
      undefined,
      2,
      'un sel V2',
      (chaine) => `${chaine}-hasheeAvecV2`,
      'v1'
    );

    expect(nouveauHash).to.be(undefined);
  });
});
