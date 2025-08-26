class EvenementModelesMesureSpecifiqueImportes {
  constructor({ idUtilisateur, nbModelesMesureSpecifiqueImportes }) {
    if (!nbModelesMesureSpecifiqueImportes) {
      throw new Error(
        "Impossible d'instancier l'événement sans nombre de modèles de mesure spécifique importés"
      );
    }

    if (!idUtilisateur) {
      throw new Error(
        "Impossible d'instancier l'événement sans identifiant utilisateur"
      );
    }
    this.nbModelesMesureSpecifiqueImportes = nbModelesMesureSpecifiqueImportes;
    this.idUtilisateur = idUtilisateur;
  }
}
export default EvenementModelesMesureSpecifiqueImportes;
