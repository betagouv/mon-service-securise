const obtentionValeur = (obtentionDonnees, element) => obtentionDonnees[$(element).data('nom')]();
const champsNonRempli = (valeur) => valeur === '' || valeur === undefined;
const champsRempli = (valeur) => !champsNonRempli(valeur);

const controleChampsRequis = (obtentionDonnees) => {
  $('.requis').each((_, element) => {
    const valeur = () => obtentionValeur(obtentionDonnees, element);
    if (champsNonRempli(valeur())) {
      $(element).addClass('erreur');

      $(element).on('change', () => {
        $(element).toggleClass('erreur', champsNonRempli(valeur()));
      });
    }
  });
};

const tousChampsRequisRemplis = (obtentionDonnees) => {
  let tousChampsRequisCompletes = true;

  $('.requis').each((_, element) => {
    const valeur = () => obtentionValeur(obtentionDonnees, element);
    tousChampsRequisCompletes &&= champsRempli(valeur());
  });

  return tousChampsRequisCompletes;
};

export { controleChampsRequis, tousChampsRequisRemplis };
