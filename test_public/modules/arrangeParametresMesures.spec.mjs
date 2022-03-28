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
});
