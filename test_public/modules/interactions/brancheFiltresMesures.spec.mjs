import expect from 'expect.js';
import jquery from 'jquery';
import { JSDOM } from 'jsdom';

import brancheFiltresMesures from '../../../public/modules/interactions/brancheFiltresMesures.mjs';

describe('Le branchement des filtres dans la page des mesures', () => {
  beforeEach(() => {
    const sourcePage = `
      <nav>
        <a class="actif">Aucun filtre</a>
        <a id="A">Filtre A</a>
        <a id="B">Filtre B</a>
      </nav>

      <div class="mesures-generales">
        <div id="mesure-generale-A" class="mesure-generale A">Une mesure générale de catégorie A</div>
        <div id="mesure-generale-B" class="mesure-generale B">Une mesure générale de catégorie B</div>
      </div>

      <div class="mesures-specifiques">
        <div id="mesure-specifique-defaut" class="mesure-specifique">
          <input type="radio" id="categorie-A" name="categorie-mesure-specifique-defaut" value="A">Catégorie A
          <input type="radio" id="categorie-B" name="categorie-mesure-specifique-defaut" value="B">Catégorie B
        </div>
        <div id="mesure-specifique-A" class="mesure-specifique">
          <input type="radio" id="categorie-A" name="categorie-mesure-specifique-A" value="A" checked>Catégorie A
          <input type="radio" id="categorie-B" name="categorie-mesure-specifique-A" value="B">Catégorie B
        </div>
        <div id="mesure-specifique-B" class="mesure-specifique">
          <input type="radio" id="categorie-A" name="categorie-mesure-specifique-B" value="A">Catégorie A
          <input type="radio" id="categorie-B" name="categorie-mesure-specifique-B" value="B" checked>Catégorie B
        </div>
      </div>
    `;
    const dom = new JSDOM(sourcePage);
    global.$ = jquery(dom.window);
  });

  it('change le filtre actif quand on clique dessus', () => {
    brancheFiltresMesures('actif', 'nav > a', '.mesure-generale', '.mesure-specifique');

    expect($('#A').hasClass('actif')).to.be(false);

    $('#A').trigger('click');
    expect($('a.actif').length).to.equal(1);
    expect($('#A').hasClass('actif')).to.be(true);
  });

  it('filtre correctement les mesures générales', () => {
    brancheFiltresMesures('actif', 'nav > a', '.mesure-generale', '.mesure-specifique');

    expect($('.mesure-generale.invisible').length).to.equal(0);

    $('#A').trigger('click');
    expect($('.mesure-generale.invisible').length).to.equal(1);
    expect($('#mesure-generale-B').hasClass('invisible')).to.be(true);

    $('nav > a').first().trigger('click');
    expect($('.mesure-generale.invisible').length).to.equal(0);
  });

  it('filtre correctement les mesures spécifiques', () => {
    brancheFiltresMesures('actif', 'nav > a', '.mesure-generale', '.mesure-specifique');

    expect($('.mesure-specifique.invisible').length).to.equal(0);

    $('#A').trigger('click');
    expect($('.mesure-specifique.invisible').length).to.equal(1);
    expect($('#mesure-specifique-B').hasClass('invisible')).to.be(true);

    $('nav > a').first().trigger('click');
    expect($('.mesure-specifique.invisible').length).to.equal(0);
  });
});
