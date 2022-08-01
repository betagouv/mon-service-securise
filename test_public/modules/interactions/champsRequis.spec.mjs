import expect from 'expect.js';
import jquery from 'jquery';
import { JSDOM } from 'jsdom';

import { controleChampsRequis, tousChampsRequisRemplis } from '../../../public/modules/interactions/champsRequis.mjs';

describe('Le contrôle des champs requis', () => {
  const obtentionDonnees = {
    prenom: () => $('#prenom').val(),
    email: () => $('#email').val(),
    telephone: () => $('#telephone').val(),
  };

  beforeEach(() => {
    const sourcePage = `
      <form>
        <div class="requis" data-nom="prenom">
          <input type="text" id="prenom">
        </div>
        <div class="requis" data-nom="email">
          <input type="email" id="email">
        </div>
        <div>
          <input type="text" id="telephone">
        </div>
      </form>
    `;
    const dom = new JSDOM(sourcePage);
    global.$ = jquery(dom.window);
  });

  it('indique si tous les champs requis ne sont pas remplis', () => {
    $('#prenom').val('prénom');
    expect(tousChampsRequisRemplis(obtentionDonnees)).to.be(false);
  });

  it('indique si tous les champs requis sont remplis', () => {
    $('#prenom').val('prénom');
    $('#email').val('email');
    expect(tousChampsRequisRemplis(obtentionDonnees)).to.be(true);
  });

  it('marque en erreur les composants requis non remplis', () => {
    controleChampsRequis(obtentionDonnees);

    expect($('.requis').hasClass('erreur')).to.be(true);
  });

  it('ajoute une action conditionnée par un changement dans le composant qui permet de retirer le statut erreur', () => {
    controleChampsRequis(obtentionDonnees);
    const champPrenomEnErreur = () => $(".requis[data-nom='prenom']").hasClass('erreur');
    const statutInitial = champPrenomEnErreur();

    $('#prenom').val('prénom');
    $(".requis[data-nom='prenom']").trigger('change');

    expect(statutInitial).to.be(true);
    expect(champPrenomEnErreur()).to.be(false);
  });
});
