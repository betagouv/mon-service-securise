import expect from 'expect.js';
import jquery from 'jquery';
import { JSDOM } from 'jsdom';

import brancheValidationCasesACocher from '../../../public/modules/interactions/brancheValidationCasesACocher.mjs';

describe('Le branchement de la validation des cases à cocher', () => {
  const validiteToutesCases = (selecteurGroupe) =>
    $(`${selecteurGroupe} :checkbox`)
      .get()
      .every((caseACocher) => caseACocher.validity.valid);

  const verifieToutesValides = (selecteurGroupe) => {
    expect(validiteToutesCases(selecteurGroupe)).to.be(true);
  };
  const verifieToutesInvalides = (selecteurGroupe) => {
    expect(validiteToutesCases(selecteurGroupe)).to.be(false);
  };

  beforeEach(() => {
    const sourcePage = `
    <fieldset id="casesACocher" class="casesACocher" required>
      <input id="case1" name="casesACocher" value="valeur1" type="checkbox">
      <input id="case2" name="casesACocher" value="valeur2" type="checkbox">
      <input id="case3" name="casesACocher" value="valeur3" type="checkbox">
    </fieldset>
    <fieldset id="casesACocher2" class="casesACocher" required>
      <input id="case4" name="casesACocher2" value="valeur4" type="checkbox" checked>
    </fieldset>
    `;
    const dom = new JSDOM(sourcePage);
    global.$ = jquery(dom.window);
  });

  describe("quand le groupe n'est pas indiqué comme requis", () => {
    it('rend les cases à cocher valides', () => {
      $('#casesACocher').attr('required', false);

      brancheValidationCasesACocher();

      verifieToutesValides('#casesACocher');
    });
  });

  describe('quand le groupe est indiqué comme requis', () => {
    it('rend les cases à cocher invalides quand les cases sont non cochées', () => {
      brancheValidationCasesACocher();

      verifieToutesInvalides('#casesACocher');
    });

    it('rend les cases à cocher valides quand au moins une case est cochée', () => {
      $('#case1').attr('checked', 'checked');

      brancheValidationCasesACocher();

      verifieToutesValides('#casesACocher');
    });

    it("rend les cases à cocher valides après qu'une case ait été cochée", () => {
      brancheValidationCasesACocher();

      $('#case1').attr('checked', 'checked');
      $('#case1').trigger('change');

      verifieToutesValides('#casesACocher');
    });

    it("rend les cases à cocher invalides lorsqu'elles redeviennent toutes décochées", () => {
      $('#case1').attr('checked', 'checked');
      brancheValidationCasesACocher();

      $('#case1').attr('checked', false);
      $('#case1').trigger('change');

      verifieToutesInvalides('#casesACocher');
    });
  });

  describe('quand il y a plusieurs groupe de cases à cocher', () => {
    it('permet de valider séparément les groupes', () => {
      brancheValidationCasesACocher();

      verifieToutesInvalides('#casesACocher');
      verifieToutesValides('#casesACocher2');
    });
  });
});
