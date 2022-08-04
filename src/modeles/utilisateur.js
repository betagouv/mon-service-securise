const Base = require('./base');
const { ErreurDepartementInconnu, ErreurEmailManquant, ErreurProprieteManquante } = require('../erreurs');
const Referentiel = require('../referentiel');

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
        'telephone',
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

  static valideCreationNouvelUtilisateur(donnees, referentiel = Referentiel.creeReferentielVide()) {
    const proprietesTextesObligatoires = ['prenom', 'nom', 'email', 'nomEntitePublique', 'departementEntitePublique'];
    const proprietesBooleenesObligatoires = ['rssi', 'delegueProtectionDonnees'];

    const envoieErreurProprieteManquante = (propriete) => {
      throw new ErreurProprieteManquante(`La propriété "${propriete}" est requise`);
    };

    proprietesTextesObligatoires.forEach((propriete) => {
      if (typeof donnees[propriete] !== 'string' || donnees[propriete] === '') {
        envoieErreurProprieteManquante(propriete);
      }
    });
    proprietesBooleenesObligatoires.forEach((propriete) => {
      if (typeof donnees[propriete] !== 'boolean') {
        envoieErreurProprieteManquante(propriete);
      }
    });

    const { departementEntitePublique } = donnees;
    if (!referentiel.departement(departementEntitePublique)) {
      throw new ErreurDepartementInconnu(`Le département identifié par "${departementEntitePublique}" n'est pas répertorié`);
    }
  }

  static nomsProprietesBase() {
    return [
      'prenom',
      'nom',
      'email',
      'telephone',
      'cguAcceptees',
      'poste',
      'rssi',
      'delegueProtectionDonnees',
      'nomEntitePublique',
      'departementEntitePublique',
    ];
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
      telephone: this.telephone || '',
      poste: this.poste || '',
      rssi: this.estRSSI(),
      delegueProtectionDonnees: this.estDelegueProtectionDonnees(),
      nomEntitePublique: this.nomEntitePublique || '',
      departementEntitePublique: this.departementEntitePublique || '',
    };
  }
}

module.exports = Utilisateur;
