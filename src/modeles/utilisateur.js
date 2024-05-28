const Base = require('./base');
const {
  ErreurEmailManquant,
  ErreurDonneesObligatoiresManquantes,
} = require('../erreurs');
const { formatteListeFr } = require('../utilitaires/liste');
const Entite = require('./entite');

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
        'infolettreAcceptee',
        'transactionnelAccepte',
        'estimationNombreServices',
      ],
    });
    valide(donnees);
    this.entite = new Entite(donnees.entite);
    this.renseigneProprietes(donnees);
    this.adaptateurJWT = adaptateurJWT;
  }

  static valideDonnees(donnees = {}, utilisateurExistant = false) {
    const envoieErreurDonneeManquante = (propriete) => {
      throw new ErreurDonneesObligatoiresManquantes(
        `La propriété "${propriete}" est requise`
      );
    };

    const validePresenceProprietes = (proprietes) => {
      proprietes.forEach((propriete) => {
        if (
          typeof donnees[propriete] !== 'string' ||
          donnees[propriete] === ''
        ) {
          envoieErreurDonneeManquante(propriete);
        }
      });
    };

    const validePresenceProprietesObjet = (proprietes) => {
      proprietes.forEach((propriete) => {
        if (typeof donnees[propriete] !== 'object') {
          envoieErreurDonneeManquante(propriete);
        }
      });
    };

    const validePresenceProprietesBooleenes = (proprietes) => {
      proprietes.forEach((propriete) => {
        if (typeof donnees[propriete] !== 'boolean') {
          envoieErreurDonneeManquante(propriete);
        }
      });
    };

    const validePresenceProprieteListes = (proprietes) => {
      proprietes.forEach((propriete) => {
        if (!Array.isArray(donnees[propriete])) {
          envoieErreurDonneeManquante(propriete);
        }
      });
    };

    if (!utilisateurExistant) {
      validePresenceProprietes(['email']);
    }
    validePresenceProprietes(['prenom', 'nom']);
    validePresenceProprietesObjet(['entite', 'estimationNombreServices']);
    Entite.valideDonnees(donnees.entite);
    validePresenceProprietesBooleenes([
      'infolettreAcceptee',
      'transactionnelAccepte',
    ]);
    validePresenceProprieteListes(['postes']);
  }

  static nomsProprietesBase() {
    return [
      'prenom',
      'nom',
      'email',
      'telephone',
      'cguAcceptees',
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

  completudeProfil() {
    const nomEstRenseigne = (this.nom?.trim() ?? '') !== '';
    const siretEstRenseigne = (this.entite?.siret ?? '') !== '';
    const estComplet = nomEstRenseigne && siretEstRenseigne;
    const champsNonRenseignes = [];
    if (!nomEstRenseigne) {
      champsNonRenseignes.push('nom');
    }
    if (!siretEstRenseigne) {
      champsNonRenseignes.push('siret');
    }
    return { estComplet, champsNonRenseignes };
  }

  async changePreferencesCommunication(nouvellesPreferences, adaptateurEmail) {
    const infolettreActuelle = this.accepteInfolettre();
    const nouvelleInfolettre = nouvellesPreferences.infolettreAcceptee;
    const inscrisIL = !infolettreActuelle && nouvelleInfolettre;
    const desinscrisIL = infolettreActuelle && !nouvelleInfolettre;

    if (inscrisIL) await adaptateurEmail.inscrisInfolettre(this.email);
    if (desinscrisIL) await adaptateurEmail.desinscrisInfolettre(this.email);

    const transacActuel = this.accepteTransactionnel();
    const nouveauTransac = nouvellesPreferences.transactionnelAccepte;
    const inscrisTransac = !transacActuel && nouveauTransac;
    const desinscrisTransac = transacActuel && !nouveauTransac;

    if (inscrisTransac)
      await adaptateurEmail.inscrisEmailsTransactionnels(this.email);
    if (desinscrisTransac)
      await adaptateurEmail.desinscrisEmailsTransactionnels(this.email);
  }
}

module.exports = Utilisateur;
