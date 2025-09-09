import Base from '../../src/modeles/base.js';
import type { Referentiel } from '../../src/referentiel.interface.js';
import { creeReferentielVide } from '../../src/referentiel.js';

class ExtensionBase extends Base {
  static proprietesObligatoires() {
    return ['propriete1', 'propriete2'];
  }
}

describe('Un objet métier', () => {
  let referentiel: Referentiel;

  beforeEach(() => {
    referentiel = creeReferentielVide();
  });

  it('sait si une de ses propriétés a été saisie', () => {
    const objetMetier = new ExtensionBase({
      proprietesAtomiquesRequises: ['propriete'],
    });
    objetMetier.renseigneProprietes({}, referentiel);
    expect(objetMetier.proprieteSaisie('propriete')).toBe(false);

    objetMetier.renseigneProprietes({ propriete: 'valeur' }, referentiel);
    expect(objetMetier.proprieteSaisie('propriete')).toBe(true);
  });

  it("considère qu'une propriété renseignée à chaîne vide n'est pas saisie", () => {
    const objetMetier = new ExtensionBase({
      proprietesAtomiquesRequises: ['propriete'],
    });
    objetMetier.renseigneProprietes({ propriete: '' }, referentiel);
    expect(objetMetier.proprieteSaisie('propriete')).toBe(false);
  });

  it('renseigne les propriétés facultatives', () => {
    const objetMetier = new ExtensionBase({
      proprietesAtomiquesFacultatives: ['propriete'],
    });
    objetMetier.renseigneProprietes({ propriete: 'valeur' }, referentiel);
    expect(objetMetier.propriete).to.equal('valeur');
  });

  it('convertit les proprietes facultatives en JSON', () => {
    const objetMetier = new ExtensionBase({
      proprietesAtomiquesFacultatives: ['propriete'],
    });
    objetMetier.renseigneProprietes({ propriete: 'valeur' }, referentiel);
    expect(objetMetier.toJSON()).to.eql({ propriete: 'valeur' });
  });

  it('a des propriétés obligatoires vide par défaut', () => {
    expect(Base.proprietesObligatoires()).to.eql([]);
  });

  describe('sur vérification du renseignement des propriétés obligatoires', () => {
    it('sait répondre quand les propriétés sont de type texte', () => {
      const donnees = { propriete1: 'texte', propriete2: 'texte' };
      const donneesSansPropriete2 = { propriete1: 'texte' };

      expect(ExtensionBase.proprietesObligatoiresRenseignees(donnees)).toBe(
        true
      );
      expect(
        ExtensionBase.proprietesObligatoiresRenseignees(donneesSansPropriete2)
      ).toBe(false);
    });

    it('sait répondre quand les propriétés sont de type booléen', () => {
      const donnees = { propriete1: true, propriete2: false };
      expect(ExtensionBase.proprietesObligatoiresRenseignees(donnees)).toBe(
        true
      );
    });

    it('sait répondre quand les propriétés sont de type numérique', () => {
      const donnees = { propriete1: 1, propriete2: 0 };

      expect(ExtensionBase.proprietesObligatoiresRenseignees(donnees)).toBe(
        true
      );
    });

    it('refuse la valeur `NaN`', () => {
      const donnees = { propriete1: 1, propriete2: NaN };

      expect(ExtensionBase.proprietesObligatoiresRenseignees(donnees)).toBe(
        false
      );
    });

    it('sait répondre quand les propriétés sont des listes', () => {
      const donnees = { propriete1: ['valeur1'], propriete2: ['valeur2'] };
      const donneesAvecListeVide = { propriete1: ['valeur1'], propriete2: [] };
      const avecListeTexteVide = { propriete1: ['valeur1'], propriete2: [''] };
      expect(ExtensionBase.proprietesObligatoiresRenseignees(donnees)).toBe(
        true
      );
      expect(
        ExtensionBase.proprietesObligatoiresRenseignees(donneesAvecListeVide)
      ).toBe(false);
      expect(
        ExtensionBase.proprietesObligatoiresRenseignees(avecListeTexteVide)
      ).toBe(false);
    });

    it("sait répondre quand les propriétés sont des listes d'agrégats", () => {
      const donnees = {
        propriete1: [{ description: 'texte' }],
        propriete2: [{ description: 'texte' }],
      };
      expect(ExtensionBase.proprietesObligatoiresRenseignees(donnees)).toBe(
        true
      );
    });

    it("reste robuste quand il n'y a pas de propriétés obligatoires", () => {
      expect(Base.proprietesObligatoiresRenseignees({})).toBe(true);
    });
  });
});
