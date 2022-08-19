const brancheValidation = (selecteurFormulaire) => {
  $('input, select', selecteurFormulaire).each((_index, champ) => {
    $(champ).on('invalid', (evenement) => {
      evenement.preventDefault();
    });
  });
};

export default brancheValidation;
