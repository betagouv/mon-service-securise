import expect from 'expect.js';
import { JSDOM } from 'jsdom';
import jquery from 'jquery';
import initialiseComportementFormulaire from '../../public/modules/soumetsHomologation.mjs';

describe("L'initialisation du comportement du formulaire", () => {
  describe('après la soumission du formulaire', () => {
    const fonctionExtractionParametres = (selecteurFormulaire) => $(selecteurFormulaire)
      .serializeArray()
      .reduce((acc, nomValeur) => ({ ...acc, [nomValeur.name]: nomValeur.value }), {});

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

    it('envoie au serveur les données du service à créer', (done) => {
      const evenementsDifferes = $.Deferred();
      initialiseComportementFormulaire('.formulaire', '.bouton', fonctionExtractionParametres, callbackErreurParDefaut, adaptateurAjax);

      evenementsDifferes.resolveWith($('.bouton').trigger('click'))
        .then(() => {
          expect(ajaxRequete.method).to.equal('post');
          expect(ajaxRequete.url).to.equal('/api/service');
          expect(ajaxRequete.data['champ-1']).to.equal('valeur 1');
        })
        .then(() => done())
        .catch(done);
    });

    it('envoie au serveur les données du service à modifier', (done) => {
      const evenementsDifferes = $.Deferred();
      $('.bouton').attr('idHomologation', '12345');

      initialiseComportementFormulaire('.formulaire', '.bouton', fonctionExtractionParametres, callbackErreurParDefaut, adaptateurAjax);

      evenementsDifferes.resolveWith($('.bouton').trigger('click'))
        .then(() => {
          expect(ajaxRequete.method).to.equal('put');
          expect(ajaxRequete.url).to.equal('/api/service/12345');
          expect(ajaxRequete.data['champ-1']).to.equal('valeur 1');
        })
        .then(() => done())
        .catch(done);
    });

    it('renvoie vers la synthèse du service', (done) => {
      const evenementsDifferes = $.Deferred();
      initialiseComportementFormulaire('.formulaire', '.bouton', fonctionExtractionParametres, callbackErreurParDefaut, adaptateurAjax);

      evenementsDifferes.resolveWith($('.bouton').trigger('click'))
        .then(() => expect(window.location).to.equal('/service/123'))
        .then(() => done())
        .catch(done);
    });

    it("exécute la callback d'erreur en cas d'erreur", (done) => {
      const evenementsDifferes = $.Deferred();
      const adaptateurAjaxErreur = {
        execute: () => Promise.reject(),
      };
      let callbackErreurAppele = false;
      const callbackErreur = () => {
        callbackErreurAppele = true;
      };
      initialiseComportementFormulaire('.formulaire', '.bouton', fonctionExtractionParametres, callbackErreur, adaptateurAjaxErreur);

      evenementsDifferes.resolveWith($('.bouton').trigger('click'))
        .then(() => expect(callbackErreurAppele).to.be(true))
        .then(() => done())
        .catch(done);
    });
  });
});
