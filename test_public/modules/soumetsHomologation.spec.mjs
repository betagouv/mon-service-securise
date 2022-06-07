import expect from 'expect.js';
import { JSDOM } from 'jsdom';
import jquery from 'jquery';
import initialiseComportementFormulaire from '../../public/modules/soumetsHomologation.mjs';
import ErreurSeuilCriticiteTropEleve from '../../public/modules/erreurs.mjs';

describe("L'initialisation du comportement du formulaire", () => {
  describe('après la soumission du formulaire', () => {
    const fonctionExtractionParametres = (selecteurFormulaire) => $(selecteurFormulaire)
      .serializeArray()
      .reduce((acc, nomValeur) => ({ ...acc, [nomValeur.name]: nomValeur.value }), {});

    beforeEach(() => {
      const dom = new JSDOM(`
        <div class="rideau"></<div>
        <form class="formulaire">
          <input name="champs-1" value="valeur 1">
          <div class="bouton"></div>
        </form>
      `);
      global.$ = jquery(dom.window);

      global.window = { location: '/' };
    });

    it('affiche la modale quand le seuil de criticité est critique', (done) => {
      const adaptateurAjax = {
        verifieSeuilCriticite: () => Promise.reject(new ErreurSeuilCriticiteTropEleve('Seuil de criticité critique')),
      };

      const evenementsDifferes = $.Deferred();
      $('.rideau').on('afficheModale', () => {
        evenementsDifferes.resolve();
      });

      initialiseComportementFormulaire('.formulaire', '.bouton', '.rideau', fonctionExtractionParametres, adaptateurAjax);
      $('.bouton').trigger('click');

      evenementsDifferes.promise()
        .then(() => done())
        .catch(done);
    });

    describe("quand le seuil de criticité n'est pas critique", () => {
      let ajaxRequete;
      const adaptateurAjax = {};

      beforeEach(() => {
        adaptateurAjax.verifieSeuilCriticite = () => Promise.resolve();
        adaptateurAjax.execute = (requete) => {
          ajaxRequete = requete;
          return Promise.resolve({ data: { idHomologation: '123' } });
        };
      });

      it("envoie au serveur les données de l'homologation à créer", (done) => {
        const evenementsDifferes = $.Deferred();
        initialiseComportementFormulaire('.formulaire', '.bouton', '.rideau', fonctionExtractionParametres, adaptateurAjax);

        evenementsDifferes.resolveWith($('.bouton').trigger('click'))
          .then(() => {
            expect(ajaxRequete.method).to.equal('post');
            expect(ajaxRequete.url).to.equal('/api/homologation');
            expect(ajaxRequete.data['champs-1']).to.equal('valeur 1');
          })
          .then(() => done())
          .catch(done);
      });

      it("envoie au serveur les données de l'homologation à modifier", (done) => {
        const evenementsDifferes = $.Deferred();
        $('.bouton').attr('idHomologation', '12345');

        initialiseComportementFormulaire('.formulaire', '.bouton', '.rideau', fonctionExtractionParametres, adaptateurAjax);

        evenementsDifferes.resolveWith($('.bouton').trigger('click'))
          .then(() => {
            expect(ajaxRequete.method).to.equal('put');
            expect(ajaxRequete.url).to.equal('/api/homologation/12345');
            expect(ajaxRequete.data['champs-1']).to.equal('valeur 1');
          })
          .then(() => done())
          .catch(done);
      });

      it("renvoie vers la synthèse de l'homologation", (done) => {
        const evenementsDifferes = $.Deferred();
        initialiseComportementFormulaire('.formulaire', '.bouton', '.rideau', fonctionExtractionParametres, adaptateurAjax);

        evenementsDifferes.resolveWith($('.bouton').trigger('click'))
          .then(() => expect(window.location).to.equal('/homologation/123'))
          .then(() => done())
          .catch(done);
      });
    });
  });
});
