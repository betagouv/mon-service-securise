import Service from '../../modeles/service.js';
import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';
import {
  conversionMesuresV1versV2,
  EquivalencesMesuresV1V2,
  IdMesureV1,
} from '../../../donneesConversionReferentielMesures.js';
import { MoteurReglesV2 } from '../v2/moteurReglesV2.js';
import { type IdMesureV2 } from '../../../donneesReferentielMesuresV2.js';
import { DetailMesure } from './simulationMigrationReferentiel.types.js';
import { DescriptionEquivalenceMesure } from './descriptionEquivalenceMesure.js';
import { DonneesMesureGenerale } from '../../modeles/mesureGenerale.type.js';
import { VersionService } from '../../modeles/versionService.js';

export class SimulationMigrationReferentiel {
  private readonly serviceV1: Service;
  private readonly descriptionServiceV2: DescriptionServiceV2;
  private readonly referentielV1: Referentiel;
  private readonly referentielV2: ReferentielV2;
  private readonly equivalences: EquivalencesMesuresV1V2;

  constructor(
    {
      serviceV1,
      descriptionServiceV2,
      referentielV1,
      referentielV2,
    }: {
      serviceV1: Service;
      descriptionServiceV2: DescriptionServiceV2;
      referentielV1: Referentiel;
      referentielV2: ReferentielV2;
    },
    equivalences: EquivalencesMesuresV1V2 = conversionMesuresV1versV2
  ) {
    this.serviceV1 = serviceV1;
    this.descriptionServiceV2 = descriptionServiceV2;
    this.referentielV1 = referentielV1;
    this.referentielV2 = referentielV2;
    this.equivalences = equivalences;
  }

  evolutionMesures() {
    const moteurRegleV2 = new MoteurReglesV2(
      this.referentielV2,
      this.referentielV2.reglesMoteurV2()
    );
    const mesuresDuServiceV1 = this.serviceV1.mesures.mesuresPersonnalisees;
    const mesuresDuServiceV2 = moteurRegleV2.mesures(this.descriptionServiceV2);

    const idMesuresV2ConvertiesDepuisV1: Array<IdMesureV2> = Object.entries(
      this.equivalences
    )
      .filter(([idMesureV1]) =>
        Object.keys(mesuresDuServiceV1).includes(idMesureV1)
      )
      .flatMap(([, equivalence]) => equivalence.idsMesureV2);

    const mesuresAjouteesEnV2 = Object.keys(mesuresDuServiceV2).filter(
      (idMesuresV2) =>
        !idMesuresV2ConvertiesDepuisV1.includes(idMesuresV2 as IdMesureV2)
    ) as IdMesureV2[];

    const tousLesIdMesureV1 = Object.keys(mesuresDuServiceV1) as IdMesureV1[];

    const equivalence = new DescriptionEquivalenceMesure(
      this.referentielV1,
      this.referentielV2
    );

    const detailsMesuresAjoutees = mesuresAjouteesEnV2.map((idMesure) =>
      equivalence.ajoutee(idMesure)
    );

    const idsMesureV2DuService = new Set(
      Object.keys(mesuresDuServiceV2)
    ) as Set<IdMesureV2>;
    const detailsAutresMesures = tousLesIdMesureV1.flatMap<DetailMesure>(
      (idMesureV1) => {
        const { idsMesureV2, statut } = this.equivalences[idMesureV1];
        if (statut === 'inchangee')
          return equivalence.inchangees(idMesureV1, idsMesureV2);
        if (
          statut === 'modifiee' &&
          idsMesureV2.some((id) => idsMesureV2DuService.has(id))
        )
          return equivalence.modifiees(idMesureV1, idsMesureV2);
        return equivalence.supprimee(idMesureV1);
      }
    );

    const detailsMesures: DetailMesure[] = [
      ...detailsMesuresAjoutees,
      ...detailsAutresMesures,
    ];

    return {
      detailsMesures,
      nbMesuresInchangees: detailsAutresMesures.filter(
        (m) => m.statut === 'inchangee'
      ).length,
      nbMesuresModifiees: detailsAutresMesures.filter(
        (m) => m.statut === 'modifiee'
      ).length,
      nbMesuresSupprimees: detailsAutresMesures.filter(
        (m) => m.statut === 'supprimee'
      ).length,
      nbMesures: Object.keys(mesuresDuServiceV2).length,
      nbMesuresAjoutees: detailsMesuresAjoutees.length,
    };
  }

  donneesMesuresGeneralesV2(): DonneesMesureGenerale<IdMesureV2>[] {
    const idMesuresV1AConserver = Object.entries(this.equivalences)
      .filter(([, valeur]) => valeur.conservationDonnees)
      .map(([idMesure]) => idMesure);

    const donneesMesuresV1 =
      this.serviceV1.mesures.mesuresGenerales.donneesSerialisees() as DonneesMesureGenerale<IdMesureV1>[];

    return donneesMesuresV1
      .filter((generaleV1) => idMesuresV1AConserver.includes(generaleV1.id))
      .flatMap<DonneesMesureGenerale<IdMesureV2>>((generaleV1) =>
        this.equivalences[generaleV1.id].idsMesureV2.map((idV2) => ({
          ...generaleV1,
          id: idV2,
        }))
      );
  }

  evolutionIndiceCyber(): { v1: number; v2: number; max: number } {
    const v1 = this.serviceV1.indiceCyber().total;

    const serviceV2Equivalent = new Service(
      {
        descriptionService: this.descriptionServiceV2.donneesSerialisees(),
        mesuresGenerales: this.donneesMesuresGeneralesV2(),
        versionService: VersionService.v2,
      },
      this.referentielV2
    );

    const v2 = serviceV2Equivalent.indiceCyber().total;
    return { v1, v2, max: this.referentielV1.indiceCyberNoteMax() };
  }
}
