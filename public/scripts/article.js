$(() => {
  const titres = $('h2,h3,h4');
  const tousLesLiensVersTitres = $('.table-des-matieres a');

  const afficheLienActifSiTitreVisible = (entry) => {
    const id = entry.target.getAttribute('id');
    if (!id) return;

    const lien = $(`.table-des-matieres a[href="#${id}"]`);
    if (!lien) return;

    lien.toggleClass('actif', entry.intersectionRatio > 0);
  };

  const observateurDeTitre = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      afficheLienActifSiTitreVisible(entry);
    });
  });

  titres.each((_, titre) => observateurDeTitre.observe(titre));

  $(document).on('beforeunload', () => {
    observateurDeTitre.disconnect();
  });

  const scrollVersTitre = (e) => {
    e.preventDefault();
    const idCible = $(e.target).attr('href');
    const cible = $(idCible);
    if (cible) {
      cible[0].scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
  };

  tousLesLiensVersTitres.on('click', (e) => {
    scrollVersTitre(e);
  });
});
