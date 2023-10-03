const donnees = (autorisation) => ({
  idUtilisateur: autorisation.idUtilisateur,
  idAutorisation: autorisation.id,
  resumeNiveauDroit: autorisation.resumeNiveauDroit(),
});

module.exports = { donnees };
