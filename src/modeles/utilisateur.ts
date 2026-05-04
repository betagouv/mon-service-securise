import Base from './base.js';
import {
  ErreurEmailManquant,
  ErreurDonneesObligatoiresManquantes,
} from '../erreurs.js';
import Entite, { DonneesEntite } from './entite.js';
import { Identite } from './identite.js';
import { UUID } from '../typesBasiques.js';
import { AdaptateurJWT } from '../adaptateurs/adaptateurJWT.interface.js';
import { SourceAuthentification } from './sourceAuthentification.js';
import { AdaptateurMail } from '../adaptateurs/adaptateurMail.interface.js';

export type EstimationNombreServices = {
  borneBasse: string;
  borneHaute: string;
};

export type DonneesUtilisateur = {
  dateCreation: Date;
  id: UUID;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  cguAcceptees: string;
  infolettreAcceptee: boolean;
  transactionnelAccepte: boolean;
  estimationNombreServices: EstimationNombreServices;
  postes: Array<string>;
  entite: Partial<DonneesEntite>;
};

const valide = (donnees: { email?: string | undefined }) => {
  const { email } = donnees;
  if (typeof email !== 'string' || email === '')
    throw new ErreurEmailManquant();
};

class Utilisateur extends Base {
  readonly dateCreation!: Date;
  readonly id!: UUID;
  readonly prenom!: string;
  private readonly nom!: string;
  readonly email!: string;
  private readonly telephone?: string;
  private readonly cguAcceptees!: string;
  private readonly infolettreAcceptee!: boolean;
  private readonly transactionnelAccepte!: boolean;
  private readonly estimationNombreServices!: EstimationNombreServices;
  readonly postes!: Array<string>;
  private readonly entite: Entite;
  private readonly identite: Identite;
  private readonly adaptateurJWT: AdaptateurJWT;
  private readonly cguActuelles: string;

  constructor(
    donnees: DonneesUtilisateur,
    {
      adaptateurJWT,
      cguActuelles,
    }: { adaptateurJWT: AdaptateurJWT; cguActuelles: string }
  ) {
    super({
      proprietesAtomiquesRequises: [
        'dateCreation',
        'id',
        'prenom',
        'nom',
        'email',
        'telephone',
        'cguAcceptees',
        'infolettreAcceptee',
        'transactionnelAccepte',
        'estimationNombreServices',
      ],
      proprietesListes: ['postes'],
    });
    valide(donnees);
    this.entite = new Entite(donnees.entite);
    this.renseigneProprietes(donnees);
    this.adaptateurJWT = adaptateurJWT;
    this.cguActuelles = cguActuelles;
    this.identite = new Identite(donnees);
  }

  static valideDonnees(
    donnees: Partial<DonneesUtilisateur> = {},
    utilisateurExistant = false
  ) {
    const envoieErreurDonneeManquante = (
      propriete: keyof DonneesUtilisateur
    ) => {
      throw new ErreurDonneesObligatoiresManquantes(
        `La propriété "${propriete}" est requise`
      );
    };

    const validePresenceProprietes = (
      proprietes: Array<keyof DonneesUtilisateur>
    ) => {
      proprietes.forEach((propriete) => {
        if (
          typeof donnees[propriete] !== 'string' ||
          donnees[propriete] === ''
        ) {
          envoieErreurDonneeManquante(propriete);
        }
      });
    };

    const validePresenceProprietesObjet = (
      proprietes: Array<keyof DonneesUtilisateur>
    ) => {
      proprietes.forEach((propriete) => {
        if (typeof donnees[propriete] !== 'object') {
          envoieErreurDonneeManquante(propriete);
        }
      });
    };

    const validePresenceProprietesBooleenes = (
      proprietes: Array<keyof DonneesUtilisateur>
    ) => {
      proprietes.forEach((propriete) => {
        if (typeof donnees[propriete] !== 'boolean') {
          envoieErreurDonneeManquante(propriete);
        }
      });
    };

    const validePresenceProprieteListes = (
      proprietes: Array<keyof DonneesUtilisateur>
    ) => {
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
    Entite.valideDonnees(donnees.entite!);
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

  genereToken(source: SourceAuthentification) {
    return this.adaptateurJWT.genereToken(this.id, source, this.estUnInvite());
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

  async changePreferencesCommunication(
    nouvellesPreferences: {
      infolettreAcceptee?: boolean;
      transactionnelAccepte?: boolean;
    },
    adaptateurEmail: AdaptateurMail
  ) {
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

export default Utilisateur;
