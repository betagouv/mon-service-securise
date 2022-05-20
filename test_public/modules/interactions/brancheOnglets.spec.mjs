import expect from 'expect.js';
import jquery from 'jquery';
import { JSDOM } from 'jsdom';
import brancheOnglets from '../../../public/modules/interactions/brancheOnglets.mjs';

describe('Le branchement des onglets', () => {
  beforeEach(() => {
    const sourcePage = `
      <nav id="onglets-liens">
        <a class="actif" id="onglet-responsables"></a>
        <a id="onglet-parties-prenantes">Parties prenantes</a>
      </nav>
      <div class="onglet" id="responsables"></div>
      <div class="onglet" id="parties-prenantes"></div>
    `;
    const dom = new JSDOM(sourcePage);
    global.$ = jquery(dom.window);
  });

  it("rend visible l'onglet actif", () => {
    brancheOnglets('#onglets-liens > a');

    expect($('#responsables').hasClass('invisible')).to.be(false);
  });

  describe('sur une action de click sur un lien', () => {
    it('rend actif le lien cliqué', () => {
      brancheOnglets('#onglets-liens > a');

      $('#onglet-parties-prenantes').trigger('click');

      expect($('#onglet-parties-prenantes').hasClass('actif')).to.be(true);
    });

    it('rend inactif les liens non cliqués', () => {
      brancheOnglets('#onglets-liens > a');

      $('#onglet-parties-prenantes').trigger('click');

      expect($('#onglet-responsables').hasClass('actif')).to.be(false);
    });

    it("rend visible l'onglet ciblé", () => {
      brancheOnglets('#onglets-liens > a');

      $('#onglet-parties-prenantes').trigger('click');

      expect($('#parties-prenantes').hasClass('invisible')).to.be(false);
    });

    it('rend non visible les onglets non ciblés', () => {
      brancheOnglets('#onglets-liens > a');

      $('#onglet-parties-prenantes').trigger('click');

      expect($('#responsables').hasClass('invisible')).to.be(true);
    });
  });
});
