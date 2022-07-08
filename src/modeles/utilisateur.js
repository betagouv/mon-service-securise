const Base = require('./base');
const { ErreurEmailManquant } = require('../erreurs');

const valide = (donnees) => {
  const { email } = donnees;
  if (typeof email !== 'string' || email === '') throw new ErreurEmailManquant();
};

class Utilisateur extends Base {
  constructor(donnees = {}, adaptateurJWT) {
    super({
      proprietesAtomiquesRequises: [
        'dateCreation',
        'id',
        'idResetMotDePasse',
        'prenom',
        'nom',
        'email',
        'cguAcceptees',
        'poste',
        'rssi',
        'delegueProtectionDonnees',
        'nomEntitePublique',
        'departementEntitePublique',
      ],
    });
    valide(donnees);
    this.renseigneProprietes(donnees);
    this.adaptateurJWT = adaptateurJWT;
  }

  accepteCGU() {
    return !!this.cguAcceptees;
  }

  estRSSI() {
    return !!this.rssi;
  }

  estDelegueProtectionDonnees() {
    return !!this.delegueProtectionDonnees;
  }

  genereToken(callback) {
    return this.adaptateurJWT.genereToken(this.id, this.cguAcceptees, callback);
  }

  initiales() {
    const premiereLettreMajuscule = (s) => (
      typeof s === 'string' ? s.charAt(0).toUpperCase() : ''
    );

    return `${premiereLettreMajuscule(this.prenom)}${premiereLettreMajuscule(this.nom)}` || '…';
  }

  prenomNom() {
    return [this.prenom, this.nom].join(' ').trim() || this.email;
  }

  toJSON() {
    return {
      id: this.id,
      cguAcceptees: this.accepteCGU(),
      initiales: this.initiales(),
      prenomNom: this.prenomNom(),
      poste: this.poste || '',
      rssi: this.estRSSI(),
      delegueProtectionDonnees: this.estDelegueProtectionDonnees(),
      nomEntitePublique: this.nomEntitePublique || '',
      departementEntitePublique: this.departementEntitePublique || '',
    };
  }
}

module.exports = Utilisateur;
