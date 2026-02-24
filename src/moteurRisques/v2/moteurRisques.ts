import type { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';
import { SelectionVecteurs } from './selectionVecteurs.js';
import { IdVecteurRisque } from './selectionVecteurs.types.js';
import { SelectionObjectifsVises } from './selectionObjectifsVises.js';
import { IdObjectifVise } from './selectionObjectifsVises.types.js';
import { Gravite, GraviteObjectifsVises } from './graviteObjectifsVises.js';
import { GraviteVecteurs } from './graviteVecteurs.js';
import { RisqueV2 } from './risqueV2.js';
import { VraisemblanceRisque } from './vraisemblanceRisque.js';
import { configurationVraisemblance } from './vraisemblance/vraisemblance.configuration.js';
import { IdMesureV2 } from '../../../donneesReferentielMesuresV2.js';
import MesureGenerale from '../../modeles/mesureGenerale.js';
import { MesureAvecStatut } from './vraisemblance/vraisemblance.types.js';
import { MesuresPourRisque } from './mesuresPourRisque.js';

export class MoteurRisquesV2 {
  private readonly selectionVecteurs: Array<IdVecteurRisque>;
  private mesures: MesuresPourRisque;

  constructor(
    private readonly descriptionService: DescriptionServiceV2,
    mesuresPersonnalisees: Record<IdMesureV2, MesureGenerale>
  ) {
    this.selectionVecteurs = new SelectionVecteurs().selectionnePourService(
      descriptionService
    );
    this.mesures = new MesuresPourRisque(mesuresPersonnalisees);
  }

  vecteurs(): Array<IdVecteurRisque> {
    return this.selectionVecteurs;
  }

  objectifsVises(): Partial<Record<IdObjectifVise, Gravite>> {
    const gravites = new GraviteObjectifsVises().calculePourService(
      this.descriptionService
    );
    const OVs = new SelectionObjectifsVises().selectionnePourService(
      this.descriptionService
    );

    return Object.fromEntries(OVs.map((ov) => [ov, gravites[ov]]));
  }

  risques(): RisqueV2[] {
    return this.calculePour(this.mesures.avecStatutReel());
  }

  risquesBruts(): RisqueV2[] {
    return this.calculePour(this.mesures.avecStatutVide());
  }

  risquesCibles() {
    return this.calculePour(this.mesures.avecStatutFait());
  }

  private calculePour(mesures: Record<IdMesureV2, MesureAvecStatut>) {
    const gravitesParVecteur = new GraviteVecteurs().calcule(
      this.vecteurs(),
      this.objectifsVises()
    );

    return Object.entries(gravitesParVecteur).map(([id, ovs]) => {
      const vraisemblance = new VraisemblanceRisque(
        configurationVraisemblance[id as IdVecteurRisque]
      ).calculePourService(this.descriptionService.niveauSecurite, mesures);

      return new RisqueV2(id as IdVecteurRisque, ovs, vraisemblance);
    });
  }
}
