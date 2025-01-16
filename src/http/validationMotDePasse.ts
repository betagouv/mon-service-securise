// ⚠️ Code dupliqué
// La logique de validation du MDP est codée côté fron et côté back.
// La mutualisation est prévue lorsque le back supportera la syntaxe « import … from »

const resultatValidation = {
  ERREUR_MOT_DE_PASSE_NON_CHAINE: 'erreurMotDePasseNonChaine',
  ERREUR_MOT_DE_PASSE_TROP_COURT: 'erreurMotDePasseTropCourt',
  ERREUR_PAS_DE_CARACTERE_SPECIAL: 'erreurPasDeCaractereSpecial',
  ERREUR_PAS_DE_CHIFFRE: 'erreurPasDeChiffre',
  ERREUR_PAS_DE_MAJUSCULE: 'erreurPasDeMajuscule',
  ERREUR_PAS_DE_MINUSCULE: 'erreurPasDeMinuscule',
  MOT_DE_PASSE_VALIDE: '',
};

const valideMotDePasse = (motDePasse) => {
  if (typeof motDePasse !== 'string')
    return resultatValidation.ERREUR_MOT_DE_PASSE_NON_CHAINE;
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
