import expect from 'expect.js';
import { JSDOM } from 'jsdom';
import jquery from 'jquery';
import initialiseComportementFormulaire from '../../public/modules/soumetsHomologation.mjs';

describe("L'initialisation du comportement du formulaire", () => {
  describe('après la soumission du formulaire', () => {
    const axiosMock = {};

    beforeEach(() => {
      const dom = new JSDOM(`
        <form class="formulaire">
          <input name="champs-1" value="valeur 1">
          <div class="bouton"></div>
        </form>
      `);
      global.$ = jquery(dom.window);

      global.axios = axiosMock;
      global.window = { location: '/' };
    });

    it('affiche la modale quand le seuil de criticité est critique', async () => {
      let modaleAffichee = false;
      axiosMock.get = () => Promise.resolve({ data: { seuilCriticite: 'critique' } });
      $('.formulaire').on('afficheModale', () => {
        modaleAffichee = true;
      });

      initialiseComportementFormulaire('.formulaire', '.bouton');
      await $('.formulaire').trigger('submit');

      expect(modaleAffichee).to.be(true);
    });

    describe("quand le seuil de criticité n'est pas critique", () => {
      let axiosRequete;
      let axiosMockFonction;

      beforeEach(() => {
        axiosMockFonction = (requete) => {
          axiosRequete = requete;
          return Promise.resolve({ data: { idHomologation: '123' } });
        };
        axiosMockFonction.get = () => Promise.resolve({ data: { seuilCriticite: 'normal' } });
        global.axios = axiosMockFonction;
      });

      it("Écris une nouvelle homologation si elle n'est pas identifiée", async () => {
        initialiseComportementFormulaire('.formulaire', '.bouton');
        await $('.formulaire').trigger('submit');

        expect(axiosRequete.method).to.equal('post');
        expect(axiosRequete.url).to.equal('/api/homologation');
        expect(axiosRequete.data['champs-1']).to.equal('valeur 1');
      });

      it("Mets à jour l'homologation si elle est identifiée", async () => {
        $('.bouton').attr('identifiant', '12345');

        initialiseComportementFormulaire('.formulaire', '.bouton');
        await $('.formulaire').trigger('submit');

        expect(axiosRequete.method).to.equal('put');
        expect(axiosRequete.url).to.equal('/api/homologation/12345');
        expect(axiosRequete.data['champs-1']).to.equal('valeur 1');
      });

      it("Renvoie vers la synthèse de l'homologation", async () => {
        const soumission = async () => {
          initialiseComportementFormulaire('.formulaire', '.bouton');
          await $('.formulaire').trigger('submit');
        };

        await soumission();

        expect(global.window.location).to.equal('/homologation/123');
      });
    });
  });
});
