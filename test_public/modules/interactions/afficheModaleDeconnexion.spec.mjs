import expect from 'expect.js';
import { JSDOM } from 'jsdom';
import jquery from 'jquery';
import afficheModaleDeconnexion from '../../../public/modules/interactions/afficheModaleDeconnexion.mjs';

describe("Lors d'une demande d'affichage de la modale de déconnexion", () => {
  before(() => {
    const sourcePage = `
    <header>
      <div class="rideau" id="deconnexion" style="display: none;"></div>
    </header>
    <main>
      <div class="rideau" id="main"></div>
    </main>
    `;
    const dom = new JSDOM(sourcePage);
    global.$ = jquery(dom.window);
  });

  it("émet un événement d'affichage de la modale de déconnexion", () => {
    let modaleDeconnexionAffichee = false;
    $('.rideau#deconnexion').on('afficheModale', () => {
      modaleDeconnexionAffichee = true;
    });

    afficheModaleDeconnexion('.rideau#deconnexion', '.rideau');

    expect(modaleDeconnexionAffichee).to.be(true);
  });

  it('émet un événement de fermeture à toutes les modales', () => {
    let toutesModalesAffichees = true;
    $('.rideau').on('fermeModale', () => {
      toutesModalesAffichees = false;
    });

    afficheModaleDeconnexion('.rideau#deconnexion', '.rideau');

    expect(toutesModalesAffichees).to.be(false);
  });

  it("émet un événement de fermeture avant celui d'affichage de la modale de déconnexion", () => {
    const evenementsLances = [];

    $('.rideau#main').on('fermeModale', () => {
      evenementsLances.push('ferme modale main');
    });
    $('.rideau#deconnexion').on('fermeModale', () => {
      evenementsLances.push('ferme modale déconnexion');
    });
    $('.rideau#deconnexion').on('afficheModale', () => {
      evenementsLances.push('affiche modale déconnexion');
    });

    afficheModaleDeconnexion('.rideau#deconnexion', '.rideau');

    expect(evenementsLances.length).to.equal(3);
    expect(evenementsLances).to.contain('ferme modale main');
    expect(evenementsLances).to.contain('ferme modale déconnexion');
    expect(evenementsLances[2]).to.equal('affiche modale déconnexion');
  });
});
