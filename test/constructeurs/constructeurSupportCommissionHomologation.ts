import {
  AutoriteHomologation,
  DonneesSupportCommissionHomologation,
} from '../../src/adaptateurs/adaptateurPowerpoint.interface.js';
import { PieceDuDossier } from '../../src/modeles/objetsPowerpoint/piecesDuDossier.js';
import { ContexteDuService } from '../../src/modeles/objetsPowerpoint/contexteDuService.js';
import {
  BesoinsDeSecurite,
  ExpositionDuService,
} from '../../src/modeles/objetsPowerpoint/besoinsDeSecurite.js';
import { RisqueCartographie } from '../../src/modeles/objetsPowerpoint/risqueCartographie.js';
import { IndiceCyberDuService } from '../../src/modeles/objetsPowerpoint/indiceCyber.js';
import {
  MesuresDUneCategorie,
  MesuresDUnNiveauDeCriticite,
  RepartitionParStatut,
  StatistiquesDesMesures,
} from '../../src/modeles/objetsPowerpoint/statistiquesDesMesures.js';
import { ExigenceRestante } from '../../src/modeles/objetsPowerpoint/exigencesRestantes.js';
import { AvisDUnMembre } from '../../src/modeles/objetsPowerpoint/avisDesMembres.js';
import {
  MesureDeLAnnexe,
  MesuresDUnStatut,
} from '../../src/modeles/objetsPowerpoint/annexeDesMesures.js';

export const repete = (texte: string, nombre: number, separateur = ' ') =>
  Array.from({ length: nombre }, () => texte).join(separateur);

export const unePiece = (
  intitule: string,
  piece: Partial<PieceDuDossier> = {}
): PieceDuDossier => ({
  intitule,
  source: 'MonServiceSécurisé',
  cochee: false,
  ...piece,
});

export const unRisque = (
  identifiant: string,
  risque: Partial<RisqueCartographie> = {}
): RisqueCartographie => ({
  identifiant,
  intitule: `Intitulé de ${identifiant}`,
  description: `Description de ${identifiant}`,
  gravite: 4,
  vraisemblance: 4,
  niveau: 'moyen',
  ...risque,
});

export const repartitionVide: RepartitionParStatut = {
  fait: 0,
  enCours: 0,
  nonFait: 0,
  aLancer: 0,
  aRemplir: 0,
};

export const uneCategorie = (
  libelle: string,
  repartition: Partial<RepartitionParStatut> = {}
): MesuresDUneCategorie => {
  const complete = { ...repartitionVide, ...repartition };
  return {
    libelle,
    ...complete,
    total: Object.values(complete).reduce((somme, n) => somme + n, 0),
  };
};

export const uneCriticite = (
  criticite: Partial<MesuresDUnNiveauDeCriticite> = {}
): MesuresDUnNiveauDeCriticite => ({
  ...repartitionVide,
  restant: 0,
  ...criticite,
});

export const uneExigence = (
  description: string,
  exigence: Partial<ExigenceRestante> = {}
): ExigenceRestante => ({
  description,
  statut: 'enCours',
  cartouches: ['Indispensable', 'ANSSI', 'Gouvernance', '#0022'],
  ...exigence,
});

export const unAvis = (
  membres: string,
  avis: Partial<AvisDUnMembre> = {}
): AvisDUnMembre => ({
  membres,
  avis: 'Favorable',
  duree: '1 an',
  commentaire: '',
  ...avis,
});

export const uneMesure = (
  description: string,
  mesure: Partial<MesureDeLAnnexe> = {}
): MesureDeLAnnexe => ({
  description,
  categorie: 'Gouvernance',
  criticite: 'Indispensable',
  referentiel: 'ANSSI',
  ...mesure,
});

class ConstructeurSupportCommissionHomologation {
  private readonly donnees: DonneesSupportCommissionHomologation = {
    dateCreation: new Date(2026, 10, 9),
    piecesDuDossier: [unePiece('Une pièce du dossier')],
    contexte: {
      organisation: 'Une organisation',
      statut: 'Un statut',
      urls: '',
      typeDeProjet: 'Un type de projet',
      hebergement: 'Un hébergement',
      donneesStockees: 'Une localisation',
      securisations: '',
    },
    besoinsDeSecurite: {
      idNiveau: 'niveau1',
      niveau: 'Un niveau',
      resume: 'Un résumé',
      demarche: 'une démarche',
      niveauIndicatifAnssi: 'Un niveau indicatif',
      depasseRecommandation: true,
      nomService: 'Un service',
      exposition: {
        ouverture: 'Une ouverture',
        audience: 'Une audience',
        dureeDysfonctionnement: 'Une durée',
      },
      donneesIdentifiees: [],
    },
    cartographiesDesRisques: { bruts: [], aDate: [], cibles: [] },
    indiceCyber: {
      nomService: 'Un service',
      total: 0,
      totalPersonnalise: 0,
      noteMax: 5,
      categories: [],
      referentiels: "l'ANSSI",
    },
    statistiquesDesMesures: {
      nombreDeMesuresGenerales: 0,
      nombreDeMesuresSpecifiques: 0,
      referentiels: "l'ANSSI",
      parCriticite: {
        indispensables: uneCriticite(),
        recommandees: uneCriticite(),
      },
      parCategorie: [],
    },
    exigencesRestantes: [],
    avisDesMembres: [],
    annexeDesMesures: [],
  };

  avecAutorite(autorite: AutoriteHomologation) {
    this.donnees.autorite = autorite;
    return this;
  }

  avecPieces(...pieces: PieceDuDossier[]) {
    this.donnees.piecesDuDossier = pieces;
    return this;
  }

  avecContexte(contexte: Partial<ContexteDuService>) {
    this.donnees.contexte = { ...this.donnees.contexte, ...contexte };
    return this;
  }

  avecBesoinsDeSecurite(besoins: Partial<BesoinsDeSecurite>) {
    this.donnees.besoinsDeSecurite = {
      ...this.donnees.besoinsDeSecurite,
      ...besoins,
    };
    return this;
  }

  avecExposition(exposition: Partial<ExpositionDuService>) {
    const { besoinsDeSecurite } = this.donnees;
    besoinsDeSecurite.exposition = {
      ...besoinsDeSecurite.exposition,
      ...exposition,
    };
    return this;
  }

  avecDonneesIdentifiees(...donneesIdentifiees: string[]) {
    this.donnees.besoinsDeSecurite.donneesIdentifiees = donneesIdentifiees;
    return this;
  }

  avecRisquesBruts(...risques: RisqueCartographie[]) {
    this.donnees.cartographiesDesRisques.bruts = risques;
    return this;
  }

  avecRisquesADate(...risques: RisqueCartographie[]) {
    this.donnees.cartographiesDesRisques.aDate = risques;
    return this;
  }

  avecRisquesCibles(...risques: RisqueCartographie[]) {
    this.donnees.cartographiesDesRisques.cibles = risques;
    return this;
  }

  avecIndiceCyber(indiceCyber: Partial<IndiceCyberDuService>) {
    this.donnees.indiceCyber = { ...this.donnees.indiceCyber, ...indiceCyber };
    return this;
  }

  avecStatistiquesDesMesures(statistiques: Partial<StatistiquesDesMesures>) {
    this.donnees.statistiquesDesMesures = {
      ...this.donnees.statistiquesDesMesures,
      ...statistiques,
    };
    return this;
  }

  avecCategories(...categories: MesuresDUneCategorie[]) {
    this.donnees.statistiquesDesMesures.parCategorie = categories;
    return this;
  }

  avecCriticites(criticites: Partial<StatistiquesDesMesures['parCriticite']>) {
    const { statistiquesDesMesures } = this.donnees;
    statistiquesDesMesures.parCriticite = {
      ...statistiquesDesMesures.parCriticite,
      ...criticites,
    };
    return this;
  }

  avecExigencesRestantes(...exigences: ExigenceRestante[]) {
    this.donnees.exigencesRestantes = exigences;
    return this;
  }

  avecAvis(...avis: AvisDUnMembre[]) {
    this.donnees.avisDesMembres = avis;
    return this;
  }

  avecAnnexe(...mesuresParStatut: MesuresDUnStatut[]) {
    this.donnees.annexeDesMesures = mesuresParStatut;
    return this;
  }

  construis(): DonneesSupportCommissionHomologation {
    return structuredClone(this.donnees);
  }
}

export const unSupportDeCommission = () =>
  new ConstructeurSupportCommissionHomologation();
