import expect from 'expect.js';
import { JSDOM } from 'jsdom';
import jquery from 'jquery';
import initialiseComportementFormulaire from '../../public/modules/soumetsHomologation.mjs';

describe("L'initialisation du comportement du formulaire", () => {
  describe('après la soumission du formulaire', () => {
    const fonctionExtractionParametres = (selecteurFormulaire) =>
      $(selecteurFormulaire)
        .serializeArray()
        .reduce(
          (acc, nomValeur) => ({ ...acc, [nomValeur.name]: nomValeur.value }),
          {}
        );

    beforeEach(() => {
      const dom = new JSDOM(`
        <form class="formulaire">
          <input name="champ-1" value="valeur 1">
          <button class="bouton"></button>
        </form>
      `);
      global.$ = jquery(dom.window);

      global.window = { location: '/' };
    });

    let ajaxRequete;
    const adaptateurAjax = {};
    const callbackErreurParDefaut = () => {};

    beforeEach(() => {
      adaptateurAjax.execute = (requete) => {
        ajaxRequete = requete;
        return Promise.resolve({ data: { idService: '123' } });
      };
    });

    it('envoie au serveur les données du service à créer', async () => {
      const evenementsDifferes = $.Deferred();
      initialiseComportementFormulaire(
        '.formulaire',
        '.bouton',
        fonctionExtractionParametres,
        callbackErreurParDefaut,
        adaptateurAjax
      );

      await evenementsDifferes.resolveWith($('.bouton').trigger('click'));
      expect(ajaxRequete.method).to.equal('post');
      expect(ajaxRequete.url).to.equal('/api/service');
      expect(ajaxRequete.data['champ-1']).to.equal('valeur 1');
    });

    it('envoie au serveur les données du service à modifier', async () => {
      const evenementsDifferes = $.Deferred();
      $('.bouton').attr('idHomologation', '12345');

      initialiseComportementFormulaire(
        '.formulaire',
        '.bouton',
        fonctionExtractionParametres,
        callbackErreurParDefaut,
        adaptateurAjax
      );

      await evenementsDifferes.resolveWith($('.bouton').trigger('click'));
      expect(ajaxRequete.method).to.equal('put');
      expect(ajaxRequete.url).to.equal('/api/service/12345');
      expect(ajaxRequete.data['champ-1']).to.equal('valeur 1');
    });

    it('renvoie vers la description du service', async () => {
      const evenementsDifferes = $.Deferred();
      initialiseComportementFormulaire(
        '.formulaire',
        '.bouton',
        fonctionExtractionParametres,
        callbackErreurParDefaut,
        adaptateurAjax
      );

      await evenementsDifferes.resolveWith($('.bouton').trigger('click'));
      expect(window.location).to.equal('/service/123/descriptionService');
    });

    it("exécute la callback d'erreur en cas d'erreur", async () => {
      const evenementsDifferes = $.Deferred();
      const adaptateurAjaxErreur = {
        execute: () => Promise.reject(),
      };
      let callbackErreurAppele = false;
      const callbackErreur = () => {
        callbackErreurAppele = true;
      };
      initialiseComportementFormulaire(
        '.formulaire',
        '.bouton',
        fonctionExtractionParametres,
        callbackErreur,
        adaptateurAjaxErreur
      );

      await evenementsDifferes.resolveWith($('.bouton').trigger('click'));
      expect(callbackErreurAppele).to.be(true);
    });
  });
});
