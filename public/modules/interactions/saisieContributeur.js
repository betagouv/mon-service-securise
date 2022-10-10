const brancheComportementSaisieContributeur = (selecteurAjoutContributeur) => {
  $(selecteurAjoutContributeur).on('click', (e) => {
    const idHomologation = $(e.target).data('id-homologation');
    $('input#idHomologation').val(idHomologation);
  });

  $('.bouton#nouveau-contributeur').on('click', (e) => {
    e.stopPropagation();
    const emailContributeur = $('input#emailContributeur').val();
    const idHomologation = $('input#idHomologation').val();

    axios.post('/api/autorisation', { emailContributeur, idHomologation })
      .then(() => (window.location = '/espacePersonnel'));
  });
};

export default brancheComportementSaisieContributeur;
