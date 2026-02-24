import ElementsConstructibles from './elementsConstructibles.js';
import MesureSpecifique, {
  DonneesMesureSpecifique,
} from './mesureSpecifique.js';

import {
  ErreurMesureInconnue,
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurModeleDeMesureSpecifiqueDejaAssociee,
  ErreurSuppressionImpossible,
} from '../erreurs.js';

import Mesure, { StatutMesure } from './mesure.js';
import { creeReferentielVide } from '../referentiel.js';
import { Referentiel } from '../referentiel.interface.js';
import { UUID } from '../typesBasiques.js';

type DonneesMesuresSpecifiques = {
  mesuresSpecifiques: Array<DonneesMesureSpecifique>;
};

type DonneesModeleMesureSpecifique = {
  idUtilisateur: UUID;
  description: string;
  descriptionLongue: string;
  categorie: string;
};

type ModelesDisponiblesMesureSpecifique = Record<
  UUID,
  DonneesModeleMesureSpecifique
>;

type ParStatutEtCategorie = Record<
  StatutMesure,
  Record<string, Array<{ description: string; modalites?: string }>>
>;

class MesuresSpecifiques extends ElementsConstructibles<MesureSpecifique> {
  private readonly modelesDisponiblesDeMesureSpecifique: ModelesDisponiblesMesureSpecifique;

  constructor(
    donnees: Partial<DonneesMesuresSpecifiques> = {},
    referentiel: Referentiel = creeReferentielVide(),
    modelesDisponiblesDeMesureSpecifique: ModelesDisponiblesMesureSpecifique = {}
  ) {
    const { mesuresSpecifiques = [] } = donnees;

    const mesuresCompletees = MesuresSpecifiques.completeMesuresSpecifiques(
      mesuresSpecifiques,
      modelesDisponiblesDeMesureSpecifique
    );

    super(MesureSpecifique, { items: mesuresCompletees }, referentiel);
    this.modelesDisponiblesDeMesureSpecifique =
      modelesDisponiblesDeMesureSpecifique;
  }

  static completeMesuresSpecifiques(
    mesuresSpecifiques: DonneesMesureSpecifique[],
    modelesDisponiblesDeMesureSpecifique: ModelesDisponiblesMesureSpecifique
  ) {
    return mesuresSpecifiques.map((m) => {
      if (!m.idModele) return m;

      const modele = modelesDisponiblesDeMesureSpecifique[m.idModele];
      if (!modele)
        throw new ErreurModeleDeMesureSpecifiqueIntrouvable(m.idModele);

      const { description, descriptionLongue, categorie } = modele;

      return { ...m, description, descriptionLongue, categorie };
    });
  }

  metsAJourMesure(mesure: MesureSpecifique) {
    const index = this.items.findIndex((m) => m.id === mesure.id);
    if (index === -1) throw new ErreurMesureInconnue();
    this.items[index] = mesure;
  }

  parStatutEtCategorie(
    accumulateur = MesureSpecifique.accumulateurInitialStatuts(true)
  ): ParStatutEtCategorie {
    return this.toutes().reduce((acc, mesure) => {
      if (!mesure.statut || !mesure.categorie) return acc;
      // eslint-disable-next-line no-param-reassign
      acc[mesure.statut as StatutMesure][mesure.categorie] ||= [];
      acc[mesure.statut as StatutMesure][mesure.categorie].push({
        description: mesure.descriptionMesure(),
        modalites: mesure.modalites,
      });
      return acc;
    }, accumulateur as ParStatutEtCategorie);
  }

  ajouteMesure(mesure: MesureSpecifique) {
    this.items.push(mesure);
  }

  supprimeMesure(idMesure: UUID) {
    if (this.avecId(idMesure)?.idModele) {
      throw new ErreurSuppressionImpossible(
        'Impossible de supprimer directement une mesure spécifique associée à un modèle.'
      );
    }
    this.items = this.items.filter((m) => m.id !== idMesure);
  }

  supprimeResponsable(idUtilisateur: UUID) {
    this.toutes().forEach((m) => m.supprimeResponsable(idUtilisateur));
  }

  nombreDeSansStatut() {
    return this.toutes().filter((ms) => !ms.statutRenseigne()).length;
  }

  avecId(idMesure: UUID) {
    return this.toutes().find((m) => m.id === idMesure);
  }

  avecIdModele(idModele: UUID) {
    return this.toutes().find((m) => m.idModele === idModele);
  }

  detacheMesureDuModele(idModele: UUID) {
    this.items.forEach((m) => {
      if (m.idModele === idModele) {
        m.detacheDeSonModele();
      }
    });
  }

  detacheMesuresNonAssocieesA(
    idUtilisateurProprietaireDesModelesAConserver: UUID
  ) {
    this.items.forEach((m) => {
      if (!m.idModele) {
        return;
      }
      const modele = this.modelesDisponiblesDeMesureSpecifique[m.idModele];
      if (!modele) {
        return;
      }
      if (
        modele.idUtilisateur !== idUtilisateurProprietaireDesModelesAConserver
      ) {
        m.detacheDeSonModele();
      }
    });
  }

  listeIdentifiantsModelesAssocies() {
    return this.items.map((m) => m.idModele).filter(Boolean);
  }

  supprimeMesureAssocieeAuModele(idModele: UUID) {
    this.items = this.items.filter((m) => m.idModele !== idModele);
  }

  associeAuModele(idModele: UUID, idNouvelleMesure: UUID) {
    const modele = this.modelesDisponiblesDeMesureSpecifique[idModele];

    const modeleInconnu = !modele;
    if (modeleInconnu)
      throw new ErreurModeleDeMesureSpecifiqueIntrouvable(idModele);

    const dejaAssociee = this.items.find((m) => m.idModele === idModele);
    if (dejaAssociee)
      throw new ErreurModeleDeMesureSpecifiqueDejaAssociee(
        idModele,
        dejaAssociee.id
      );

    const { description, descriptionLongue, categorie } = modele;
    this.items.push(
      new MesureSpecifique(
        {
          idModele,
          id: idNouvelleMesure,
          description,
          descriptionLongue,
          categorie,
          statut: Mesure.STATUT_A_LANCER,
        },
        this.referentiel
      )
    );
  }
}

export default MesuresSpecifiques;
