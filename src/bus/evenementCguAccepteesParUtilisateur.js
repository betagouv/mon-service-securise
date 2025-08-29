class EvenementCguAccepteesParUtilisateur {
  constructor({ idUtilisateur, cguAcceptees }) {
    if (!idUtilisateur) throw new Error('`idUtilisateur` requis');
    if (!cguAcceptees) throw new Error('`cguAcceptees` requis');

    this.idUtilisateur = idUtilisateur;
    this.cguAcceptees = cguAcceptees;
  }
}

export { EvenementCguAccepteesParUtilisateur };
