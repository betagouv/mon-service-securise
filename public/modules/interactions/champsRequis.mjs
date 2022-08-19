const obtentionValeur = (obtentionDonnees, element) => obtentionDonnees[$(element).data('nom')]();
const champNonRempli = (valeur) => valeur === '' || typeof valeur === 'undefined';
const champRempli = (valeur) => !champNonRempli(valeur);

const controleChampsRequis = (obtentionDonnees) => {
  $('.requis').each((_, element) => {
    const valeur = () => obtentionValeur(obtentionDonnees, element);
    if (champNonRempli(valeur())) {
      $(element).addClass('erreur');

      $(element).on('change', () => {
        $(element).toggleClass('erreur', champNonRempli(valeur()));
      });
    }
  });
};

const tousChampsRequisRemplis = (obtentionDonnees) => {
  let tousChampsRequisCompletes = true;

  $('.requis').each((_, element) => {
    const valeur = () => obtentionValeur(obtentionDonnees, element);
    tousChampsRequisCompletes &&= champRempli(valeur());
  });

  return tousChampsRequisCompletes;
};

export { controleChampsRequis, tousChampsRequisRemplis };
