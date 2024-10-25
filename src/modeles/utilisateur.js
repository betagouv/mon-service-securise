const Base = require('./base');
const {
  ErreurEmailManquant,
  ErreurDonneesObligatoiresManquantes,
} = require('../erreurs');
const Entite = require('./entite');
const { Identite } = require('./identite');

const valide = (donnees) => {
  const { email } = donnees;
  if (typeof email !== 'string' || email === '')
    throw new ErreurEmailManquant();
};

class Utilisateur extends Base {
  constructor(donnees = {}, { adaptateurJWT, cguActuelles } = {}) {
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
    this.cguActuelles = cguActuelles;
    this.identite = new Identite(donnees);
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
      'estimationNombreServices.*',
    ];
  }

  accepteCGU() {
    return this.cguAcceptees === this.cguActuelles;
  }

  estUnInvite() {
    return this.cguAcceptees === undefined;
  }

  accepteInfolettre() {
    return !!this.infolettreAcceptee;
  }

  accepteTransactionnel() {
    return !!this.transactionnelAccepte;
  }

  genereToken(source) {
    return this.adaptateurJWT.genereToken(
      this.id,
      this.accepteCGU(),
      source,
      this.estUnInvite()
    );
  }

  initiales() {
    return this.identite.initiales();
  }

  posteDetaille() {
    return this.identite.posteDetaille();
  }

  prenomNom() {
    return this.identite.prenomNom();
  }

  completudeProfil() {
    const nomEstRenseigne = (this.nom?.trim() ?? '') !== '';
    const siretEstRenseigne = (this.entite?.siret ?? '') !== '';
    const estimationNombreServicesEstRenseigne =
      (this.estimationNombreServices?.borneBasse ?? '0') !== '0' &&
      (this.estimationNombreServices?.borneHaute ?? '0') !== '0';
    const estComplet =
      nomEstRenseigne &&
      siretEstRenseigne &&
      estimationNombreServicesEstRenseigne;
    const champsNonRenseignes = [];
    if (!nomEstRenseigne) {
      champsNonRenseignes.push('nom');
    }
    if (!siretEstRenseigne) {
      champsNonRenseignes.push('siret');
    }
    if (!estimationNombreServicesEstRenseigne) {
      champsNonRenseignes.push('estimationNombreServices');
    }
    return { estComplet, champsNonRenseignes };
  }

  aLesInformationsAgentConnect() {
    const { champsNonRenseignes } = this.completudeProfil();
    return (
      !champsNonRenseignes.includes('nom') &&
      !champsNonRenseignes.includes('siret')
    );
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
