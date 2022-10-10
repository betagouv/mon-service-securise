const brancheComportementSaisieContributeur = (selecteurAjoutContributeur) => {
  $(selecteurAjoutContributeur).on('click', (e) => {
    const idService = $(e.target).data('id-service');
    $('input#idService').val(idService);
  });

  $('.bouton#nouveau-contributeur').on('click', (e) => {
    e.stopPropagation();
    const emailContributeur = $('input#emailContributeur').val();
    const idService = $('input#idService').val();

    axios.post('/api/autorisation', { emailContributeur, idHomologation: idService })
      .then(() => (window.location = '/espacePersonnel'));
  });
};

export default brancheComportementSaisieContributeur;
