import brancheComportemenFormulaireEtape from '../formulaireEtape.mjs';

const basculeQuestionDureeValidite = () => {
  const ouiNon = $('input[name=validee]:checked').val();
  if (ouiNon === 'non') {
    $('#conteneur-duree-validite').hide();
    $('input[name=dureeValidite]').removeAttr('required');
  } else {
    $('#conteneur-duree-validite').show();
    $('input[name=dureeValidite]').attr('required', 'required');
  }
};

$(() => {
  $('input[name=validee]').on('change', () => {
    basculeQuestionDureeValidite();
  });

  basculeQuestionDureeValidite();

  brancheComportemenFormulaireEtape((idService) => {
    const valide = $('input[name=validee]:checked').val();

    const donnees = {
      dateHomologation: $('#date-homologation').val(),
      ...(valide === 'oui' && {
        dureeValidite: $('input[name="dureeValidite"]:checked').val(),
      }),
      ...(valide === 'non' && { refusee: true }),
    };

    return axios.put(
      `/api/service/${idService}/homologation/decision`,
      donnees
    );
  });
});
