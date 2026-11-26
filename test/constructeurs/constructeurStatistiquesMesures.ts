import {
  MesurePersonnalisee,
  MesureSpecifiqueAComptabiliser,
  StatistiquesMesures,
} from '../../src/modeles/statistiquesMesures.js';
import MesuresGenerales from '../../src/modeles/mesuresGenerales.js';
import { DonneesMesureGenerale } from '../../src/modeles/mesureGenerale.type.js';
import { TousReferentiels } from '../../src/referentiel.interface.js';
import { IdMesureV1 } from '../../donneesConversionReferentielMesures.js';
import { IdMesureV2 } from '../../donneesReferentielMesuresV2.js';

type MesureGeneraleDeTest = { id: string; statut?: string };
type MesurePersonnaliseeDeTest = { categorie: string; indispensable?: boolean };

class ConstructeurStatistiquesMesures {
  private mesuresGenerales: MesureGeneraleDeTest[] = [];
  private mesuresPersonnalisees: Record<string, MesurePersonnaliseeDeTest> = {};
  private mesuresSpecifiques: MesureSpecifiqueAComptabiliser[] = [];
  private ignoreMesuresNonPrisesEnCompte = false;

  constructor(private readonly referentiel: TousReferentiels) {}

  surLesMesuresGenerales(mesuresGenerales: MesureGeneraleDeTest[]) {
    this.mesuresGenerales = mesuresGenerales;
    return this;
  }

  avecMesuresPersonnalisees(
    mesuresPersonnalisees: Record<string, MesurePersonnaliseeDeTest>
  ) {
    this.mesuresPersonnalisees = mesuresPersonnalisees;
    return this;
  }

  avecMesuresSpecifiques(mesuresSpecifiques: MesureSpecifiqueAComptabiliser[]) {
    this.mesuresSpecifiques = mesuresSpecifiques;
    return this;
  }

  ignoreLesMesuresNonPrisesEnCompte() {
    this.ignoreMesuresNonPrisesEnCompte = true;
    return this;
  }

  construis() {
    return new StatistiquesMesures(
      {
        mesuresGenerales: new MesuresGenerales(
          {
            mesuresGenerales: this.mesuresGenerales as Array<
              Partial<DonneesMesureGenerale<IdMesureV1 | IdMesureV2>>
            >,
          },
          this.referentiel
        ),
        mesuresPersonnalisees: this.mesuresPersonnalisees as Record<
          string,
          MesurePersonnalisee
        >,
        mesuresSpecifiques: this.mesuresSpecifiques,
      },
      this.referentiel,
      this.ignoreMesuresNonPrisesEnCompte
    );
  }
}

const desStatistiques = (referentiel: TousReferentiels) =>
  new ConstructeurStatistiquesMesures(referentiel);

export { desStatistiques };
