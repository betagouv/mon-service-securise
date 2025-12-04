import { UUID } from '../typesBasiques.js';
import { IdMesureV1 } from '../../donneesConversionReferentielMesures.js';
import { IdMesureV2 } from '../../donneesReferentielMesuresV2.js';

export type IdMesure = IdMesureV1 | IdMesureV2 | UUID;

export type TypeActiviteMesure =
  | 'ajoutStatut'
  | 'miseAJourStatut'
  | 'ajoutPriorite'
  | 'miseAJourPriorite'
  | 'ajoutResponsable'
  | 'suppressionResponsable'
  | 'ajoutEcheance'
  | 'suppressionEcheance'
  | 'miseAJourEcheance'
  | 'ajoutCommentaire';

export type DonneesActiviteMesure = {
  idActeur: UUID;
  idService: UUID;
  idMesure: IdMesure;
  type: TypeActiviteMesure;
  typeMesure: 'generale' | 'specifique';
  details: Record<string, unknown>;
  date: Date;
};

export type DonneesCreationActiviteMesure = Omit<DonneesActiviteMesure, 'date'>;

class ActiviteMesure {
  idActeur: UUID;
  idService: UUID;
  idMesure: IdMesure;
  type: TypeActiviteMesure;
  typeMesure: 'generale' | 'specifique';
  details: Record<string, unknown>;
  date: Date;

  constructor(donnees: DonneesActiviteMesure) {
    this.idService = donnees.idService;
    this.idActeur = donnees.idActeur;
    this.type = donnees.type;
    this.details = donnees.details;
    this.idMesure = donnees.idMesure;
    this.date = donnees.date;
    this.typeMesure = donnees.typeMesure;
  }
}

export default ActiviteMesure;
