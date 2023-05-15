// ⚠️ Code dupliqué
// La logique de validation du MDP est codée côté fron et côté back.
// La mutualisation est prévue lorsque le back supportera la syntaxe « import … from »

const resultatValidation = {
  ERREUR_MOT_DE_PASSE_TROP_COURT: 'erreurMotDePasseTropCourt',
  ERREUR_PAS_DE_CARACTERE_SPECIAL: 'erreurPasDeCaractereSpecial',
  ERREUR_PAS_DE_CHIFFRE: 'erreurPasDeChiffre',
  ERREUR_PAS_DE_MAJUSCULE: 'erreurPasDeMajuscule',
  ERREUR_PAS_DE_MINUSCULE: 'erreurPasDeMinuscule',
  MOT_DE_PASSE_VALIDE: '',
};

const valideMotDePasse = (motDePasse) => {
  if (motDePasse === '') return resultatValidation.MOT_DE_PASSE_VALIDE;

  if (motDePasse.length < 12)
    return resultatValidation.ERREUR_MOT_DE_PASSE_TROP_COURT;
  if (!motDePasse.match(/[A-Z]/))
    return resultatValidation.ERREUR_PAS_DE_MAJUSCULE;
  if (!motDePasse.match(/[a-z]/))
    return resultatValidation.ERREUR_PAS_DE_MINUSCULE;
  if (!motDePasse.match(/[0-9]/))
    return resultatValidation.ERREUR_PAS_DE_CHIFFRE;
  if (!motDePasse.match(/[#?!@$%^&*'+_()[\]-]/))
    return resultatValidation.ERREUR_PAS_DE_CARACTERE_SPECIAL;

  return resultatValidation.MOT_DE_PASSE_VALIDE;
};

module.exports = { valideMotDePasse, resultatValidation };
