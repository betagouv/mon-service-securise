// @vitest-environment jsdom
import expect from 'expect.js';
import $ from 'jquery';

import brancheOnglets from '../../../public/modules/interactions/brancheOnglets.mjs';

global.$ = $;

describe('Le branchement des onglets', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <nav id="onglets-liens">
        <a class="actif" id="onglet-gouvernance"></a>
        <a id="onglet-parties-prenantes">Parties prenantes</a>
      </nav>
      <div class="onglet" id="gouvernance"></div>
      <div class="onglet" id="parties-prenantes"></div>
    `;
  });

  it("rend visible l'onglet actif", () => {
    brancheOnglets('#onglets-liens > a');

    expect($('#gouvernance').hasClass('invisible')).to.be(false);
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

      expect($('#onglet-gouvernance').hasClass('actif')).to.be(false);
    });

    it("rend visible l'onglet ciblé", () => {
      brancheOnglets('#onglets-liens > a');

      $('#onglet-parties-prenantes').trigger('click');

      expect($('#parties-prenantes').hasClass('invisible')).to.be(false);
    });

    it('rend non visible les onglets non ciblés', () => {
      brancheOnglets('#onglets-liens > a');

      $('#onglet-parties-prenantes').trigger('click');

      expect($('#gouvernance').hasClass('invisible')).to.be(true);
    });
  });
});
