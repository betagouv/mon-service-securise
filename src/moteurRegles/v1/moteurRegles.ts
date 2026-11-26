import { creeReferentielVide } from '../../referentiel.js';
import { Referentiel } from '../../referentiel.interface.js';
import Profil from '../../modeles/profils/profil.js';
import { DonneesRegle } from '../../modeles/profils/regle.js';
import DescriptionService from '../../modeles/descriptionService.js';
import {
  CritereRegle,
  DetailsMesureGeneraleV1,
  DonneesReferentiel,
  IdMesure,
} from '../../referentiel.types.js';

type ReglesPersonnalisation = Partial<
  DonneesReferentiel['reglesPersonnalisation']
>;

type ProfilPersonnalisation = {
  readonly regles: readonly Partial<DonneesRegle>[];
  readonly mesuresAAjouter?: readonly IdMesure[];
  readonly mesuresARetirer?: readonly IdMesure[];
  readonly mesuresARendreIndispensables?: readonly IdMesure[];
};

type MesuresACibler =
  'mesuresAAjouter' | 'mesuresARendreIndispensables' | 'mesuresARetirer';

class MoteurRegles {
  private readonly referentiel: Referentiel;

  constructor(referentiel: Referentiel = creeReferentielVide()) {
    this.referentiel = referentiel;
  }

  private reglesPersonnalisation(): ReglesPersonnalisation {
    return this.referentiel.reglesPersonnalisation();
  }

  mesuresAModifier(
    descriptionService: DescriptionService,
    mesuresACibler: MesuresACibler
  ): IdMesure[] {
    const { clefsDescriptionServiceAConsiderer = [], profils = {} } =
      this.reglesPersonnalisation();

    const valeursDescriptionService = clefsDescriptionServiceAConsiderer
      .filter((clef) => (descriptionService[clef] as unknown) !== false)
      .flatMap((clef) => descriptionService[clef] as CritereRegle);

    const mapMesures = Object.values<ProfilPersonnalisation>(profils)
      .map(
        (profil) =>
          new Profil(profil.regles, {
            ajouter: profil.mesuresAAjouter,
            retirer: profil.mesuresARetirer,
            rendreIndispensables: profil.mesuresARendreIndispensables,
          })
      )
      .flatMap((profil) => profil[mesuresACibler](valeursDescriptionService));
    return [...new Set(mapMesures)];
  }

  mesuresAAjouter(descriptionService: DescriptionService) {
    return this.mesuresAModifier(descriptionService, 'mesuresAAjouter');
  }

  mesuresARendreIndispensables(descriptionService: DescriptionService) {
    return this.mesuresAModifier(
      descriptionService,
      'mesuresARendreIndispensables'
    );
  }

  mesuresARetirer(descriptionService: DescriptionService) {
    return this.mesuresAModifier(descriptionService, 'mesuresARetirer');
  }

  mesures(
    descriptionService: DescriptionService
  ): Record<IdMesure, DetailsMesureGeneraleV1> {
    const { mesuresBase = [] } = this.reglesPersonnalisation();
    const mesuresAAjouter = this.mesuresAAjouter(descriptionService);
    const mesuresARetirer = this.mesuresARetirer(descriptionService);
    const idsARendreIndispensables = new Set(
      this.mesuresARendreIndispensables(descriptionService)
    );

    const idsMesures = [...mesuresBase, ...mesuresAAjouter].filter(
      (idMesure) => !mesuresARetirer.includes(idMesure)
    );

    return Object.fromEntries(
      idsMesures.map((idMesure) => {
        const mesure = this.referentiel.mesure(idMesure);
        return [
          idMesure,
          {
            ...mesure,
            indispensable:
              mesure.indispensable || idsARendreIndispensables.has(idMesure),
          },
        ];
      })
    ) as Record<IdMesure, DetailsMesureGeneraleV1>;
  }
}

export default MoteurRegles;
