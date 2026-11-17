import { PieceDuDossier } from '../modeles/objetsPowerpoint/piecesDuDossier.js';
import { ContexteDuService } from '../modeles/objetsPowerpoint/contexteDuService.js';
import { BesoinsDeSecurite } from '../modeles/objetsPowerpoint/besoinsDeSecurite.js';
import { CartographiesDesRisques } from '../modeles/objetsPowerpoint/cartographiesDesRisques.js';
import { IndiceCyberDuService } from '../modeles/objetsPowerpoint/indiceCyber.js';
import { StatistiquesDesMesures } from '../modeles/objetsPowerpoint/statistiquesDesMesures.js';
import { ExigenceRestante } from '../modeles/objetsPowerpoint/exigencesRestantes.js';
import { AvisDUnMembre } from '../modeles/objetsPowerpoint/avisDesMembres.js';
import { MesuresDUnStatut } from '../modeles/objetsPowerpoint/annexeDesMesures.js';

export type AutoriteHomologation = {
  nom: string;
  fonction: string;
};

export type DonneesSupportCommissionHomologation = {
  dateCreation: Date;
  autorite?: AutoriteHomologation;
  piecesDuDossier: PieceDuDossier[];
  contexte: ContexteDuService;
  besoinsDeSecurite: BesoinsDeSecurite;
  cartographiesDesRisques: CartographiesDesRisques;
  indiceCyber: IndiceCyberDuService;
  statistiquesDesMesures: StatistiquesDesMesures;
  exigencesRestantes: ExigenceRestante[];
  avisDesMembres: AvisDUnMembre[];
  annexeDesMesures: MesuresDUnStatut[];
};

export interface AdaptateurPowerpoint {
  genereSupportCommissionHomologation: (
    donnees: DonneesSupportCommissionHomologation
  ) => Promise<Buffer>;
}
