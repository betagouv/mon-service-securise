const expect = require('expect.js');

const Base = require('../../src/modeles/base');

class ExtensionBase extends Base {
  static proprietesObligatoires() {
    return ['propriete1', 'propriete2'];
  }
}

describe('Un objet métier', () => {
  it('sait si une de ses propriétés a été saisie', () => {
    const objetMetier = new Base({
      proprietesAtomiquesRequises: ['propriete'],
    });
    objetMetier.renseigneProprietes({});
    expect(objetMetier.proprieteSaisie('propriete')).to.be(false);

    objetMetier.renseigneProprietes({ propriete: 'valeur' });
    expect(objetMetier.proprieteSaisie('propriete')).to.be(true);
  });

  it("considère qu'une propriété renseignée à chaîne vide n'est pas saisie", () => {
    const objetMetier = new Base({
      proprietesAtomiquesRequises: ['propriete'],
    });
    objetMetier.renseigneProprietes({ propriete: '' });
    expect(objetMetier.proprieteSaisie('propriete')).to.be(false);
  });

  it('renseigne les propriétés facultatives', () => {
    const objetMetier = new Base({
      proprietesAtomiquesFacultatives: ['propriete'],
    });
    objetMetier.renseigneProprietes({ propriete: 'valeur' });
    expect(objetMetier.propriete).to.equal('valeur');
  });

  it('convertit les proprietes facultatives en JSON', () => {
    const objetMetier = new Base({
      proprietesAtomiquesFacultatives: ['propriete'],
    });
    objetMetier.renseigneProprietes({ propriete: 'valeur' });
    expect(objetMetier.toJSON()).to.eql({ propriete: 'valeur' });
  });

  it('a des propriétés obligatoires vide par défaut', () => {
    expect(Base.proprietesObligatoires()).to.eql([]);
  });

  describe('sur vérification du renseignement des propriétés obligatoires', () => {
    it('sait répondre quand les propriétés sont de type texte', () => {
      const donnees = { propriete1: 'texte', propriete2: 'texte' };
      const donneesSansPropriete2 = { propriete1: 'texte' };

      expect(ExtensionBase.proprietesObligatoiresRenseignees(donnees)).to.be(
        true
      );
      expect(
        ExtensionBase.proprietesObligatoiresRenseignees(donneesSansPropriete2)
      ).to.be(false);
    });

    it('sait répondre quand les propriétés sont de type booléen', () => {
      const donnees = { propriete1: true, propriete2: false };
      expect(ExtensionBase.proprietesObligatoiresRenseignees(donnees)).to.be(
        true
      );
    });

    it('sait répondre quand les propriétés sont de type numérique', () => {
      const donnees = { propriete1: 1, propriete2: 0 };

      expect(ExtensionBase.proprietesObligatoiresRenseignees(donnees)).to.be(
        true
      );
    });

    it('refuse la valeur `NaN`', () => {
      const donnees = { propriete1: 1, propriete2: NaN };

      expect(ExtensionBase.proprietesObligatoiresRenseignees(donnees)).to.be(
        false
      );
    });

    it('sait répondre quand les propriétés sont des listes', () => {
      const donnees = { propriete1: ['valeur1'], propriete2: ['valeur2'] };
      const donneesAvecListeVide = { propriete1: ['valeur1'], propriete2: [] };
      const avecListeTexteVide = { propriete1: ['valeur1'], propriete2: [''] };
      expect(ExtensionBase.proprietesObligatoiresRenseignees(donnees)).to.be(
        true
      );
      expect(
        ExtensionBase.proprietesObligatoiresRenseignees(donneesAvecListeVide)
      ).to.be(false);
      expect(
        ExtensionBase.proprietesObligatoiresRenseignees(avecListeTexteVide)
      ).to.be(false);
    });

    it("sait répondre quand les propriétés sont des listes d'agrégats", () => {
      const donnees = {
        propriete1: [{ description: 'texte' }],
        propriete2: [{ description: 'texte' }],
      };
      expect(ExtensionBase.proprietesObligatoiresRenseignees(donnees)).to.be(
        true
      );
    });

    it("reste robuste quand il n'y a pas de propriétés obligatoires", () => {
      expect(Base.proprietesObligatoiresRenseignees({})).to.be(true);
    });
  });
});
