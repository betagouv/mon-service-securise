const donnees = (autorisation) => ({
  idUtilisateur: autorisation.idUtilisateur,
  idAutorisation: autorisation.id,
  resumeNiveauDroit: autorisation.resumeNiveauDroit(),
  droits: autorisation.droits,
});

module.exports = { donnees };
