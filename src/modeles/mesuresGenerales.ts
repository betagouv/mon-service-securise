import ElementsConstructibles from './elementsConstructibles.js';
import MesureGenerale from './mesureGenerale.js';
import { DonneesMesureGenerale } from './mesureGenerale.type.js';
import { IdMesureV1 } from '../../donneesConversionReferentielMesures.js';
import { IdMesureV2 } from '../../donneesReferentielMesuresV2.js';
import { Referentiel, ReferentielV2 } from '../referentiel.interface.js';
import { MesuresParStatutEtCategorie } from './mesure.js';
import { UUID } from '../typesBasiques.js';

export type DonneesMesuresGenerales<TVersion extends IdMesureV1 | IdMesureV2> =
  {
    mesuresGenerales: Array<Partial<DonneesMesureGenerale<TVersion>>>;
  };

class MesuresGenerales<
  TVersion extends IdMesureV1 | IdMesureV2,
> extends ElementsConstructibles<MesureGenerale<TVersion>> {
  constructor(
    donnees: DonneesMesuresGenerales<TVersion>,
    referentiel: Referentiel | ReferentielV2
  ) {
    const { mesuresGenerales } = donnees;
    super(MesureGenerale, { items: mesuresGenerales }, referentiel);
  }

  nonSaisies() {
    return this.nombre() === 0;
  }

  metsAJourMesure(mesure: MesureGenerale<TVersion>) {
    const index = this.items.findIndex((m) => m.id === mesure.id);
    if (index !== -1) {
      this.items[index] = mesure;
    } else {
      this.items.push(mesure);
    }
  }

  parStatutEtCategorie() {
    const rangeMesureParStatut = (
      acc: MesuresParStatutEtCategorie,
      mesure: MesureGenerale<TVersion>
    ) => {
      const mesureReference = this.referentiel.mesure(
        mesure.id as IdMesureV1 & IdMesureV2
      );
      // eslint-disable-next-line no-param-reassign
      acc[mesure.statut][mesureReference.categorie] ||= [];
      acc[mesure.statut][mesureReference.categorie].push({
        description: mesure.descriptionMesure(),
        indispensable: mesure.estIndispensable(),
        modalites: mesure.modalites,
      });
      return acc;
    };

    const statutFaitALaFin = true;
    const accumulateur =
      MesureGenerale.accumulateurInitialStatuts(statutFaitALaFin);

    return this.toutes()
      .filter((mesure) => mesure.statutRenseigne())
      .sort((m) => (m.estIndispensable() ? -1 : 1))
      .reduce(rangeMesureParStatut, accumulateur);
  }

  supprimeResponsable(idUtilisateur: UUID) {
    this.toutes().forEach((m) => m.supprimeResponsable(idUtilisateur));
  }

  statutSaisie() {
    if (this.nonSaisies()) return MesuresGenerales.A_SAISIR;
    if (
      this.items.every(
        (item) => item.statutSaisie() === MesuresGenerales.COMPLETES
      )
    ) {
      return MesuresGenerales.COMPLETES;
    }
    return MesuresGenerales.A_COMPLETER;
  }

  avecId(idMesure: TVersion) {
    return this.toutes().find((m) => m.id === idMesure);
  }
}

export default MesuresGenerales;
