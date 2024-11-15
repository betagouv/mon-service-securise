class Parrainage {
  constructor({
    idUtilisateurFilleul,
    idUtilisateurParrain,
    filleulAFinaliseCompte,
  }) {
    this.idUtilisateurFilleul = idUtilisateurFilleul;
    this.idUtilisateurParrain = idUtilisateurParrain;
    this.filleulAFinaliseCompte = filleulAFinaliseCompte;
  }

  static nouveauParrainage(idUtilisateurFilleul, idUtilisateurParrain) {
    return new Parrainage({
      idUtilisateurFilleul,
      idUtilisateurParrain,
      filleulAFinaliseCompte: false,
    });
  }
}

module.exports = Parrainage;
