const expect = require('expect.js');
const {
  resultatValidation,
  valideMotDePasse,
} = require('../../src/http/validationMotDePasse');

describe('Le validateur de mot de passe', () => {
  it("vérifie que la taille du mot de passe est d'au moins douze caractères", () => {
    expect(valideMotDePasse('Ab!45678901')).to.equal(
      resultatValidation.ERREUR_MOT_DE_PASSE_TROP_COURT
    );
    expect(valideMotDePasse('Ab!456789012')).to.equal(
      resultatValidation.MOT_DE_PASSE_VALIDE
    );
  });

  it('vérifie que le mot de passe contient au moins une majuscule', () => {
    expect(valideMotDePasse('ab!456789012')).to.equal(
      resultatValidation.ERREUR_PAS_DE_MAJUSCULE
    );
  });

  it('vérifie que le mot de passe contient au moins une minuscule', () => {
    expect(valideMotDePasse('AB!456789012')).to.equal(
      resultatValidation.ERREUR_PAS_DE_MINUSCULE
    );
  });

  it('vérifie que le mot de passe contient au moins un chiffre', () => {
    expect(valideMotDePasse('AB!x.xxxxx.xx')).to.equal(
      resultatValidation.ERREUR_PAS_DE_CHIFFRE
    );
  });

  it("vérifie que le mot de passe contient au moins un caractère spécial parmi #$!@$%^&*-'+_()[]", () => {
    expect(valideMotDePasse('Ab3456789012')).to.equal(
      resultatValidation.ERREUR_PAS_DE_CARACTERE_SPECIAL
    );
    [
      'Ab#456789012',
      'Ab?456789012',
      'Ab!456789012',
      'Ab@456789012',
      'Ab$456789012',
      'Ab%456789012',
      'Ab^456789012',
      'Ab&456789012',
      'Ab*456789012',
      'Ab-456789012',
      "Ab'456789012",
      'Ab+456789012',
      'Ab_456789012',
      'Ab(456789012',
      'Ab)456789012',
      'Ab[456789012',
      'Ab]456789012',
    ].forEach((mdp) =>
      expect(valideMotDePasse(mdp)).to.equal(
        resultatValidation.MOT_DE_PASSE_VALIDE
      )
    );
  });

  it('accepte un mot de passe vide comme valide', () => {
    expect(valideMotDePasse('')).to.equal(
      resultatValidation.MOT_DE_PASSE_VALIDE
    );
  });
});
