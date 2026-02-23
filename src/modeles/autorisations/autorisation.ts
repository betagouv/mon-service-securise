import Base from '../base.js';
import {
  Rubriques,
  Permissions,
  tousDroitsEnEcriture,
  Droits,
  NiveauPermission,
  Rubrique,
  DroitsAvecEstProprietaire,
} from './gestionDroits.js';
import { type UUID } from '../../typesBasiques.js';
import { ActionRecommandee } from '../actionsRecommandees.js';

const { DECRIRE, SECURISER, RISQUES, HOMOLOGUER } = Rubriques;
const { LECTURE, ECRITURE } = Permissions;

export type DonneesAutorisation = {
  estProprietaire: boolean;
  id: UUID;
  idUtilisateur: UUID;
  idService: UUID;
  droits: Partial<Droits>;
};

export class Autorisation extends Base {
  // @ts-expect-error La propriétés est définie dans `this.renseigneProprietes`
  droits: Partial<Droits>;

  constructor(donnees: DonneesAutorisation) {
    super({
      proprietesAtomiquesRequises: [
        'estProprietaire',
        'id',
        'idUtilisateur',
        'idService',
        'droits',
      ],
    });
    this.renseigneProprietes(donnees);
  }

  static NouvelleAutorisationContributeur = (
    donnees: Omit<DonneesAutorisation, 'estProprietaire'>
  ) => new Autorisation({ ...donnees, estProprietaire: false });

  static NouvelleAutorisationProprietaire = (
    donnees: Omit<DonneesAutorisation, 'droits' | 'estProprietaire'>
  ) =>
    new Autorisation({
      ...donnees,
      droits: tousDroitsEnEcriture(),
      estProprietaire: true,
    });

  aLaPermission(niveau: NiveauPermission, rubrique: Rubrique) {
    // @ts-expect-error Ici, la propriété a été renseignée via `this.renseigneProprietes(donnees);`
    return this.droits[rubrique] >= niveau;
  }

  aLesPermissions(droits: Droits) {
    return Object.entries(droits).every(([rubrique, niveau]) =>
      this.aLaPermission(niveau, rubrique as Rubrique)
    );
  }

  peutDupliquer() {
    return this.estProprietaire;
  }

  peutGererContributeurs() {
    return this.estProprietaire;
  }

  peutHomologuer() {
    return this.estProprietaire;
  }

  peutSupprimerService() {
    return this.estProprietaire;
  }

  resumeNiveauDroit() {
    const { RESUME_NIVEAU_DROIT } = Autorisation;

    if (this.estProprietaire) return RESUME_NIVEAU_DROIT.PROPRIETAIRE;

    const tousNiveaux = Object.values(Permissions).reduce(
      (acc, niveau) => ({ ...acc, [niveau]: 0 }),
      {} as Record<NiveauPermission, number>
    );
    const toutesRubriques = Object.values(Rubriques);
    const totalRubriques = toutesRubriques.length;

    toutesRubriques.forEach((rubrique) => {
      const droitPourRubrique = this.droits[rubrique];
      if (droitPourRubrique) tousNiveaux[droitPourRubrique] += 1;
    });

    if (tousNiveaux[ECRITURE] === totalRubriques)
      return RESUME_NIVEAU_DROIT.ECRITURE;
    if (tousNiveaux[LECTURE] === totalRubriques)
      return RESUME_NIVEAU_DROIT.LECTURE;

    return RESUME_NIVEAU_DROIT.PERSONNALISE;
  }

  designeUtilisateur(idUtilisateur: UUID) {
    return this.idUtilisateur === idUtilisateur;
  }

  donneesAPersister() {
    return {
      estProprietaire: this.estProprietaire,
      id: this.id,
      idService: this.idService,
      idUtilisateur: this.idUtilisateur,
      droits: this.droits,
    };
  }

  static RESUME_NIVEAU_DROIT = {
    PROPRIETAIRE: 'PROPRIETAIRE',
    ECRITURE: 'ECRITURE',
    LECTURE: 'LECTURE',
    PERSONNALISE: 'PERSONNALISE',
  };

  static DROITS_VOIR_INDICE_CYBER: Partial<Droits> = {
    [SECURISER]: LECTURE,
  };

  static DROITS_VOIR_MESURES: Partial<Droits> = {
    [SECURISER]: LECTURE,
  };

  static DROITS_EDITER_MESURES: Partial<Droits> = {
    [SECURISER]: ECRITURE,
  };

  static DROITS_VOIR_STATUT_HOMOLOGATION: Partial<Droits> = {
    [HOMOLOGUER]: LECTURE,
  };

  static DROITS_EDITER_HOMOLOGATION: Partial<Droits> = {
    [HOMOLOGUER]: ECRITURE,
  };

  static DROITS_ANNEXES_PDF: Partial<Droits> = {
    [DECRIRE]: LECTURE,
    [SECURISER]: LECTURE,
    [RISQUES]: LECTURE,
  };

  static DROITS_DOSSIER_DECISION_PDF: Partial<Droits> = {
    [HOMOLOGUER]: LECTURE,
  };

  static DROIT_SYNTHESE_SECURITE_PDF: Partial<Droits> = {
    [SECURISER]: LECTURE,
    [DECRIRE]: LECTURE,
  };

  static DROIT_MIGRATION_REFERENTIEL_V2: Partial<Droits> = {
    [SECURISER]: ECRITURE,
    [DECRIRE]: ECRITURE,
  };

  static DROIT_TAMPON_HOMOLOGATION_ZIP: Partial<Droits> = {
    [HOMOLOGUER]: LECTURE,
    [DECRIRE]: LECTURE,
  };

  static DROIT_INVITER_CONTRIBUTEUR = 'peutInviterContributeur';

  static DROITS_EDITER_DESCRIPTION: Partial<Droits> = {
    [DECRIRE]: ECRITURE,
  };

  static DROITS_VOIR_DESCRIPTION: Partial<Droits> = {
    [DECRIRE]: LECTURE,
  };

  appliqueDroits(nouveauxDroits: Partial<DroitsAvecEstProprietaire>) {
    if (nouveauxDroits.estProprietaire) {
      this.estProprietaire = true;
      this.droits = tousDroitsEnEcriture();
      return;
    }

    this.estProprietaire = false;
    this.droits = { ...this.droits, ...nouveauxDroits };
  }

  peutFaireActionRecommandee(actionRecommandee: ActionRecommandee) {
    if (
      actionRecommandee.droitsNecessaires ===
      Autorisation.DROIT_INVITER_CONTRIBUTEUR
    )
      return this.peutGererContributeurs();

    return this.aLesPermissions(actionRecommandee.droitsNecessaires as Droits);
  }
}
