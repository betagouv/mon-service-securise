const brancheMiseEnAvantSaisie = () => $("input[type!='radio'][type!='checkbox'], select")
  .on('change', (evenement) => $(evenement.target).toggleClass('champ-saisi', evenement.target.value !== ''));

export default brancheMiseEnAvantSaisie;
