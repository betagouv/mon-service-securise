$(() => {
  /*
    Selectize ne permet pas nativement d'afficher un message lorsqu'il
    n'y a aucun résultat associé à une recherche de suggestion.
    Ce fichier est un plugin qui ajoute ce comportement.
    Le code vient de https://gist.github.com/dwickwire/3b5c9485467b0d01ef24f7fdfa140d92
  */

  function pluginAucunResultat(options) {
    const self = this;

    // eslint-disable-next-line no-param-reassign
    options = {
      ...options,
      message: 'Aucun résultat correspond à votre recherche',
      html: (data) =>
        `<div class="selectize-dropdown ${data.classNames}">
           <div class="selectize-dropdown-content">
             <div class="no-results">${data.message}</div>
           </div>
         </div>`,
    };

    self.displayEmptyResultsMessage = () => {
      this.$empty_results_container.css('top', this.$control.outerHeight());
      this.$empty_results_container.css('width', this.$control.outerWidth());
      this.$empty_results_container.show();
      this.$control.addClass('dropdown-active');
    };

    self.refreshOptions = ((...args) => {
      const original = self.refreshOptions;

      function basculeAffichageAucunResultat() {
        original.apply(self, args);
        if (this.hasOptions || !this.lastQuery)
          this.$empty_results_container.hide();
        else this.displayEmptyResultsMessage();
      }

      return basculeAffichageAucunResultat;
    })();

    self.onKeyDown = (() => {
      const original = self.onKeyDown;

      function masqueSiEchap(...args) {
        original.apply(self, args);
        const event = args[0];
        const estToucheEchap = event.keyCode === 27;
        if (estToucheEchap) this.$empty_results_container.hide();
      }

      return masqueSiEchap;
    })();

    self.onBlur = ((...args) => {
      const original = self.onBlur;

      function masqueAucunResultat() {
        original.apply(self, args);
        this.$empty_results_container.hide();
        this.$control.removeClass('dropdown-active');
      }

      return masqueAucunResultat;
    })();

    self.setup = ((...args) => {
      const original = self.setup;

      function initialise() {
        original.apply(self, args);
        self.$empty_results_container = $(
          options.html({ ...options, classNames: self.$input.attr('class') })
        );
        self.$empty_results_container.insertBefore(self.$dropdown);
        self.$empty_results_container.hide();
      }

      return initialise;
    })();
  }

  // eslint-disable-next-line no-undef
  Selectize.define('aucun_resultat', pluginAucunResultat);
});
