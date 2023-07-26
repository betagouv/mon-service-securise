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
        'postes',
        'nomEntitePublique',
        'departementEntitePublique',
        'infolettreAcceptee',
        'transactionnelAccepte',
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

    const validePresenceProprieteListes = (proprietes) => {
      proprietes.forEach((propriete) => {
        if (!Array.isArray(donnees[propriete])) {
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
      'infolettreAcceptee',
      'transactionnelAccepte',
    ]);
    validePresenceProprieteListes(['postes']);
    valideDepartement(donnees.departementEntitePublique, referentiel);
  }

  static nomsProprietesBase() {
    return [
      'prenom',
      'nom',
      'email',
      'telephone',
      'cguAcceptees',
      'nomEntitePublique',
      'departementEntitePublique',
      'infolettreAcceptee',
      'transactionnelAccepte',
      'postes.*',
    ];
  }

  accepteCGU() {
    return !!this.cguAcceptees;
  }

  accepteInfolettre() {
    return !!this.infolettreAcceptee;
  }

  accepteTransactionnel() {
    return !!this.transactionnelAccepte;
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
    return formatteListeFr(this.postes);
  }

  prenomNom() {
    return [this.prenom, this.nom].join(' ').trim() || this.email;
  }

  profilEstComplet() {
    return (this.nom?.trim() ?? '') !== '';
  }

  async changePreferencesCommunication(nouvellesPreferences, adaptateurEmail) {
    const infolettreActuelle = this.accepteInfolettre();
    const nouvelleInfolettre = nouvellesPreferences.infolettreAcceptee;
    const inscrisIL = !infolettreActuelle && nouvelleInfolettre;
    const desinscrisIL = infolettreActuelle && !nouvelleInfolettre;

    if (inscrisIL) await adaptateurEmail.inscrisInfolettre(this.email);
    if (desinscrisIL) await adaptateurEmail.desinscrisInfolettre(this.email);
  }

  toJSON() {
    return {
      id: this.id,
      cguAcceptees: this.accepteCGU(),
      initiales: this.initiales(),
      prenomNom: this.prenomNom(),
      telephone: this.telephone || '',
      postes: this.postes || [],
      posteDetaille: this.posteDetaille(),
      nomEntitePublique: this.nomEntitePublique || '',
      departementEntitePublique: this.departementEntitePublique || '',
      profilEstComplet: this.profilEstComplet(),
      infolettreAcceptee: this.accepteInfolettre(),
      transactionnelAccepte: this.accepteTransactionnel(),
    };
  }
}

module.exports = Utilisateur;
