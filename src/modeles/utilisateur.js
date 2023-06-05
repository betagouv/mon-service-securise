const Base = require('./base');
const {
  ErreurDepartementInconnu,
  ErreurEmailManquant,
  ErreurProprieteManquante,
} = require('../erreurs');
const Referentiel = require('../referentiel');
const { formatteListeFr } = require('../utilitaires/liste');

const valide = (donnees) => {
  const { email } = donnees;
  if (typeof email !== 'string' || email === '')
    throw new ErreurEmailManquant();
};

class Utilisateur extends Base {
  constructor(donnees = {}, { adaptateurJWT } = {}) {
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
        'infolettreAcceptee',
      ],
    });
    valide(donnees);
    this.renseigneProprietes(donnees);
    this.adaptateurJWT = adaptateurJWT;
  }

  static valideDonnees(
    donnees = {},
    referentiel = Referentiel.creeReferentielVide(),
    utilisateurExistant = false
  ) {
    const envoieErreurProprieteManquante = (propriete) => {
      throw new ErreurProprieteManquante(
        `La propriété "${propriete}" est requise`
      );
    };

    const validePresenceProprietes = (proprietes) => {
      proprietes.forEach((propriete) => {
        if (
          typeof donnees[propriete] !== 'string' ||
          donnees[propriete] === ''
        ) {
          envoieErreurProprieteManquante(propriete);
        }
      });
    };

    const validePresenceProprietesBooleenes = (proprietes) => {
      proprietes.forEach((propriete) => {
        if (typeof donnees[propriete] !== 'boolean') {
          envoieErreurProprieteManquante(propriete);
        }
      });
    };

    const valideDepartement = (codeDepartement) => {
      if (!referentiel.departement(codeDepartement)) {
        throw new ErreurDepartementInconnu(
          `Le département identifié par "${codeDepartement}" n'est pas répertorié`
        );
      }
    };

    if (!utilisateurExistant) {
      validePresenceProprietes(['email']);
    }
    validePresenceProprietes([
      'prenom',
      'nom',
      'nomEntitePublique',
      'departementEntitePublique',
    ]);
    validePresenceProprietesBooleenes([
      'rssi',
      'delegueProtectionDonnees',
      'infolettreAcceptee',
    ]);
    valideDepartement(donnees.departementEntitePublique, referentiel);
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
      'infolettreAcceptee',
    ];
  }

  accepteCGU() {
    return !!this.cguAcceptees;
  }

  accepteInfolettre() {
    return !!this.infolettreAcceptee;
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
    const premiereLettreMajuscule = (s) =>
      typeof s === 'string' ? s.charAt(0).toUpperCase() : '';

    return (
      `${premiereLettreMajuscule(this.prenom)}${premiereLettreMajuscule(
        this.nom
      )}` || ''
    );
  }

  posteDetaille() {
    const postes = [];
    if (this.estRSSI()) postes.push('RSSI');
    if (this.estDelegueProtectionDonnees()) postes.push('DPO');
    postes.push(this.poste);
    return formatteListeFr(postes.filter((p) => !!p));
  }

  prenomNom() {
    return [this.prenom, this.nom].join(' ').trim() || this.email;
  }

  profilEstComplet() {
    return (this.nom?.trim() ?? '') !== '';
  }

  toJSON() {
    return {
      id: this.id,
      cguAcceptees: this.accepteCGU(),
      initiales: this.initiales(),
      prenomNom: this.prenomNom(),
      telephone: this.telephone || '',
      poste: this.poste || '',
      posteDetaille: this.posteDetaille(),
      rssi: this.estRSSI(),
      delegueProtectionDonnees: this.estDelegueProtectionDonnees(),
      nomEntitePublique: this.nomEntitePublique || '',
      departementEntitePublique: this.departementEntitePublique || '',
      profilEstComplet: this.profilEstComplet(),
      infolettreAcceptee: this.accepteInfolettre(),
    };
  }
}

module.exports = Utilisateur;
