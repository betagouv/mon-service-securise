const CLASSE_ELEMENT_INVISIBLE = 'invisible';

const mesureSpecifiqueDeCategorie = (
  elementMesureSpecifique,
  categorieFiltre
) => {
  const $categories = $(
    "input:radio[name^='categorie-']",
    elementMesureSpecifique
  );
  return (
    !categorieFiltre ||
    $categories.filter(`[value="${categorieFiltre}"]:checked`).length === 1 ||
    $categories.length === $categories.not(':checked').length
  );
};

const mesureGeneraleDeCategorie = (elementMesure, categorieFiltre) =>
  !categorieFiltre || $(elementMesure).hasClass(categorieFiltre);

const filtreMesures = (
  categorie,
  selecteurMesureGenerale,
  selecteurMesureSpecifique
) => {
  $(selecteurMesureGenerale).each((_, item) =>
    $(item).toggleClass(
      CLASSE_ELEMENT_INVISIBLE,
      !mesureGeneraleDeCategorie(item, categorie)
    )
  );

  $(selecteurMesureSpecifique).each((_, item) =>
    $(item).toggleClass(
      CLASSE_ELEMENT_INVISIBLE,
      !mesureSpecifiqueDeCategorie(item, categorie)
    )
  );
};

const brancheFiltresMesures = (
  classeFiltreActif,
  selecteurFiltres,
  selecteurMesureGenerale,
  selecteurMesureSpecifique
) => {
  const $filtres = $(selecteurFiltres);
  $filtres.each((_, f) => {
    $(f).on('click', (e) => {
      $(`.${classeFiltreActif}`).removeClass(classeFiltreActif);
      $(e.target).addClass(classeFiltreActif);

      const idCategorie = e.target.id;
      filtreMesures(
        idCategorie,
        selecteurMesureGenerale,
        selecteurMesureSpecifique
      );
    });
  });
};

export default brancheFiltresMesures;
