import expect from 'expect.js';

import arrangeParametresMesures from '../../public/modules/arrangeParametresMesures.mjs';

describe("Une demande d'arrangement des paramètres des mesures", () => {
  it('met en forme les paramètres des mesures spécifiques', () => {
    const parametres = {
      'description-mesure-specifique-0': 'Une description',
      'categorie-mesure-specifique-0': 'gouvernance',
      'statut-mesure-specifique-0': 'fait',
      'modalites-mesure-specifique-0': 'Des modalités',
    };

    arrangeParametresMesures(parametres);

    const { mesuresSpecifiques } = parametres;
    expect(mesuresSpecifiques.length).to.equal(1);
    expect(mesuresSpecifiques[0].description).to.equal('Une description');
    expect(mesuresSpecifiques[0].categorie).to.equal('gouvernance');
    expect(mesuresSpecifiques[0].statut).to.equal('fait');
    expect(mesuresSpecifiques[0].modalites).to.equal('Des modalités');
  });

  it("met en forme le statut d'une mesure", () => {
    const parametres = { contactSecurite: 'fait' };

    arrangeParametresMesures(parametres);

    const { mesuresGenerales } = parametres;
    expect(mesuresGenerales).to.have.property('contactSecurite');
    expect(mesuresGenerales.contactSecurite.statut).to.equal('fait');
  });

  it('supprime la clé après la mise en forme', () => {
    const parametres = { contactSecurite: 'fait' };

    arrangeParametresMesures(parametres);

    expect(parametres).to.not.have.property('contactSecurite');
  });

  it('doit contenir uniquement les mesures générales sous la clé `mesuresGenerales`', () => {
    const parametres = { contactSecurite: 'fait' };

    arrangeParametresMesures(parametres);

    const { mesuresGenerales } = parametres;
    expect(Object.keys(mesuresGenerales).length).to.equal(1);
  });

  it("met en forme la modalité d'une mesure", () => {
    const parametres = { 'modalites-contactSecurite': 'Des modalités' };

    arrangeParametresMesures(parametres);

    const { mesuresGenerales } = parametres;
    expect(mesuresGenerales).to.have.property('contactSecurite');
    expect(mesuresGenerales.contactSecurite.modalites).to.equal('Des modalités');
  });

  it("n'ajoute pas de paramètres vides dans les mesures", () => {
    const parametres = { contactSecurite: '', 'modalites-contactSecurite': '' };

    arrangeParametresMesures(parametres);

    const { mesuresGenerales } = parametres;
    expect(mesuresGenerales).to.not.have.property('contactSecurite');
  });
});
