const estInvitationDejaEnvoyee = (reponseErreur) =>
  reponseErreur.status === 422 &&
  reponseErreur.data?.erreur?.code === 'INVITATION_DEJA_ENVOYEE';

const brancheComportementSaisieContributeur = (selecteurAjoutContributeur) => {
  $(selecteurAjoutContributeur).on('click', (e) => {
    const idService = $(e.target).data('id-service');
    $('input#idService').val(idService);
  });

  const idModale = '#rideau-nouveau-contributeur';
  $('.bouton#nouveau-contributeur').on('click', (e) => {
    e.stopPropagation();
    $('.message-erreur', idModale).hide();

    const emailContributeur = $('input#emailContributeur').val();
    const idService = $('input#idService').val();

    axios
      .post('/api/autorisation', {
        emailContributeur,
        idHomologation: idService,
      })
      .then(() => (window.location = '/espacePersonnel'))
      .catch(({ response }) => {
        if (estInvitationDejaEnvoyee(response)) {
          $('.message-erreur#invitation-deja-envoyee', idModale).show();
        }
      });
  });
};

export default brancheComportementSaisieContributeur;
