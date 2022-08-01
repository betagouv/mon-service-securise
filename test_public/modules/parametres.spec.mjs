import expect from 'expect.js';
import { JSDOM } from 'jsdom';
import jquery from 'jquery';
import parametres from '../../public/modules/parametres.mjs';

describe('Les paramètres', () => {
  before(() => {
    const sourcePage = '<form class="formulaire"><input name="champ-1" value="valeur 1"></form>';
    const dom = new JSDOM(sourcePage);
    global.$ = jquery(dom.window);
  });

  it('renvoient les données du formulaire', () => {
    const parametresFormulaire = parametres('.formulaire');

    expect(parametresFormulaire).to.have.key('champ-1');
    expect(parametresFormulaire['champ-1']).to.be('valeur 1');
  });
});
