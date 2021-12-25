const Base = require('./base');
const { ErreurEmailManquant } = require('../erreurs');

const valide = (donnees) => {
  const { email } = donnees;
  if (typeof email !== 'string' || email === '') throw new ErreurEmailManquant();
};

class Utilisateur extends Base {
  constructor(donnees = {}, adaptateurJWT) {
    super({
      proprietesAtomiques: ['id', 'idResetMotDePasse', 'prenom', 'nom', 'email', 'cguAcceptees'],
    });
    valide(donnees);
    this.renseigneProprietes(donnees);
    this.adaptateurJWT = adaptateurJWT;
  }

  accepteCGU() {
    return !!this.cguAcceptees;
  }

  genereToken(callback) {
    return this.adaptateurJWT.genereToken(this.id, this.cguAcceptees, callback);
  }

  toJSON() {
    return { prenomNom: `${this.prenom} ${this.nom}` };
  }
}

module.exports = Utilisateur;
