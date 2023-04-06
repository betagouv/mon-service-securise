const uneSuggestion = (departement, nom) => ({ departement, nom, label: `${nom} (${departement})` });

const preRemplirSiModeEdition = () => {
  const nom = $('#nomEntitePublique').val();
  const departement = $('#departementEntitePublique').val();
  const enModeEdition = !!nom && !!departement;

  if (!enModeEdition) return;

  const $champSelectize = $('#nomEntitePublique-selectize')[0].selectize;
  $champSelectize.addOption(uneSuggestion(departement, nom));
  const modeSilencieux = true;
  $champSelectize.setValue(`${nom} (${departement})`, modeSilencieux);
};

const rechercheSuggestions = (recherche, callback) => {
  if (recherche.length < 2) {
    callback([]);
    return;
  }

  axios.get('/api/annuaire/suggestions', { params: { recherche } })
    .then((reponse) => {
      const suggestions = reponse.data.suggestions
        .map(({ departement, nom }) => uneSuggestion(departement, nom));

      callback(suggestions);
    });
};

$(() => {
  const $champSelectize = $('#nomEntitePublique-selectize').selectize({
    plugins: ['aucun_resultat'],
    options: [],
    valueField: 'label',
    labelField: 'label',
    searchField: 'label',
    maxItems: 1,
    render: {
      item: (item, escape) => `<div class="item" data-nom="${item.nom}" data-departement="${item.departement}">
                                    ${escape(item.label)}
                               </div>`,
      option: (option, escape) => `<div class="option">${escape(option.label)}</div>`,
    },
    load: (recherche, callback) => {
      $champSelectize[0].selectize.clearOptions();
      rechercheSuggestions(recherche, callback);
    },
    onItemAdd: (_value, $item) => {
      $('#nomEntitePublique').val($item.data('nom'));
      $('#departementEntitePublique').val($item.data('departement'));
    },
    onItemRemove: () => {
      $('#nomEntitePublique').val('');
      $('#departementEntitePublique').val('');
    },
  });

  preRemplirSiModeEdition();
});
