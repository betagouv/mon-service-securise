import {
  BrouillonService,
  DonneesBrouillonService,
} from '../../src/modeles/brouillonService.js';
import { unUUIDRandom } from './UUID.js';

class ConstructeurBrouillonService {
  private donnees: DonneesBrouillonService;

  constructor() {
    this.donnees = {
      activitesExternalisees: ['developpementLogiciel'],
      audienceCible: 'moyenne',
      categoriesDonneesTraiteesSupplementaires: [],
      dureeDysfonctionnementAcceptable: 'moinsDe4h',
      localisationDonneesTraitees: 'UE',
      ouvertureSysteme: 'accessibleSurInternet',
      pointsAcces: [],
      specificitesProjet: ['accesPhysiqueAuxBureaux'],
      typeHebergement: 'cloud',
      typeService: ['api'],
      nomService: 'Service A',
      categoriesDonneesTraitees: ['donneesSensibles'],
      volumetrieDonneesTraitees: 'moyen',
      statutDeploiement: 'enCours',
      presentation: 'Le service A …',
    };
  }

  construis(): BrouillonService {
    return new BrouillonService(unUUIDRandom(), this.donnees);
  }
}

export const unBrouillonComplet = () => new ConstructeurBrouillonService();
