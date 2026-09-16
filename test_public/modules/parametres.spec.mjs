// @vitest-environment jsdom
import expect from 'expect.js';
import $ from 'jquery';
import parametres from '../../public/modules/parametres.mjs';

global.$ = $;

describe('Les paramètres', () => {
  beforeAll(() => {
    document.body.innerHTML =
      '<form class="formulaire"><input name="champ-1" value="valeur 1"></form>';
  });

  it('renvoient les données du formulaire', () => {
    const parametresFormulaire = parametres('.formulaire');

    expect(parametresFormulaire).to.have.key('champ-1');
    expect(parametresFormulaire['champ-1']).to.be('valeur 1');
  });
});
