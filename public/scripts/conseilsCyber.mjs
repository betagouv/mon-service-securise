$(() => {
  const query = new URLSearchParams(window.location.search);
  const sectionSelectionnee = query.get('section') ?? '';

  if (sectionSelectionnee)
    $('lab-anssi-liste-articles').attr(
      'id-categorie-choisie',
      sectionSelectionnee
    );
});
