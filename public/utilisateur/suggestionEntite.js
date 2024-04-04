const uneSuggestion = (departement, nom, siret) => {
  /* eslint-disable no-irregular-whitespace */
  const siretFormatte =
    siret &&
    `${siret.substring(0, 3)} ${siret.substring(3, 6)} ${siret.substring(
      6,
      9
    )} ${siret.substring(9, 14)}`;
  /* eslint-enable no-irregular-whitespace */
  return {
    departement,
    nom,
    siret,
    label: `(${departement}) ${nom} - ${siretFormatte}`,
  };
};

const rechercheSuggestions = (recherche, callback) => {
  if (recherche.length < 2) {
    callback([]);
    return;
  }

  const parametresRequete = { params: { recherche } };
  const departementSelectionne = $('#departementEntite-selectize').val();
  if (departementSelectionne !== '')
    parametresRequete.params.departement = departementSelectionne;

  axios
    .get('/api/annuaire/organisations', parametresRequete)
    .then((reponse) => {
      const suggestions = reponse.data.suggestions.map(
        ({ departement, nom, siret }) => uneSuggestion(departement, nom, siret)
      );

      callback(suggestions);
    });
};

$(() => {
  const nom = $('#nomEntite').val();
  let siret = $('#siretEntite').val();
  let departement = $('#departementEntite').val();
  const enModeEdition = !!siret && !!nom && !!departement;
  const suggestion = enModeEdition && uneSuggestion(departement, nom, siret);

  let $champSelectizeDepartement;
  const $champSelectize = $('#siretEntite-selectize').selectize({
    plugins: ['clear_button'],
    options: enModeEdition ? [suggestion] : [],
    items: enModeEdition ? [suggestion.label] : [],
    valueField: 'label',
    labelField: 'label',
    searchField: 'label',
    loadingClass: 'chargement-en-cours',
    maxItems: 1,
    normalize: true,
    create: false,
    render: {
      item: (item, escape) =>
        `<div class="item" data-departement="${item.departement}" data-siret="${
          item.siret
        }">${escape(item.label)}</div>`,
      option: (option, escape) =>
        `<div class="option">${escape(option.label)}</div>`,
    },
    load: (recherche, callback) => {
      $champSelectize[0].selectize.clearOptions();
      rechercheSuggestions(recherche, callback);
    },
    onItemAdd: (_value, $item) => {
      siret = $item.data('siret');
      departement = $item.data('departement');
      $('#siretEntite').val(siret);
      if (siret) {
        $('.banniere-avertissement').addClass('invisible');
      }
      $('#departementEntite').val(departement.toString());
      $champSelectizeDepartement[0].selectize.setValue(departement);
    },
    onItemRemove: () => {
      $('#siretEntite').val('');
    },
    score: () => {
      const aucunFiltrage = () => 1;
      return aucunFiltrage;
    },
  });

  const departements = JSON.parse($('#donnees-departements').text());
  $champSelectizeDepartement = $('#departementEntite-selectize').selectize({
    plugins: ['clear_button'],
    options: departements.map((d) => ({ ...d, label: `${d.nom} (${d.code})` })),
    items: departement ? [departement] : [],
    valueField: 'code',
    labelField: 'label',
    searchField: 'label',
    maxItems: 1,
    render: {
      item: (item, escape) =>
        `<div class="item" data-departement="${item.code}">${escape(
          item.label
        )}</div>`,
      option: (option, escape) =>
        `<div class="option">${escape(option.label)}</div>`,
    },
    onItemAdd: (_value, $item) => {
      const nouveauDepartement = $item.data('departement');
      $('#departementEntite').val(nouveauDepartement.toString());

      if (nouveauDepartement.toString() !== departement.toString()) {
        $champSelectize[0].selectize.clear();
        $champSelectize[0].selectize.clearOptions();
      }
    },
  });
});
