import { SelectionObjectifsVises } from '../../../src/moteurRisques/v2/selectionObjectifsVises.ts';
import {
  ConfigurationSelectionObjectifsVises,
  ReglesDeSelectionObjectifVise,
} from '../../../src/moteurRisques/v2/selectionObjectifsVises.types.ts';
import { uneDescriptionV2Valide } from '../../constructeurs/constructeurDescriptionServiceV2.ts';
import { DescriptionServiceV2 } from '../../../src/modeles/descriptionServiceV2.ts';

describe('La sélection des objectifs visés', () => {
  const configurationObjectifsVises = (
    surcharge: Partial<ConfigurationSelectionObjectifsVises>
  ) => ({
    OV1: { presentInitialement: false, regles: {} },
    OV2: { presentInitialement: false, regles: {} },
    OV3: { presentInitialement: false, regles: {} },
    OV4: { presentInitialement: false, regles: {} },
    ...surcharge,
  });

  describe('applique la présence initiale', () => {
    it('par défaut : sait appliquer la présence initiale de chaque objectif visé', () => {
      const s = new SelectionObjectifsVises(
        configurationObjectifsVises({
          OV1: { presentInitialement: true, regles: {} },
        })
      );

      const resultat = s.selectionnePourService(
        uneDescriptionV2Valide().construis()
      );

      expect(resultat).toContain('OV1');
    });

    it("par défaut : sait appliquer l'absence initiale de chaque vecteur", () => {
      const s = new SelectionObjectifsVises(
        configurationObjectifsVises({
          OV1: { presentInitialement: false, regles: {} },
        })
      );

      const resultat = s.selectionnePourService(
        uneDescriptionV2Valide().construis()
      );

      expect(resultat).not.toContain('OV1');
    });
  });

  describe('pour les cas métier', () => {
    // Ce type force une paire "règle + modificateur" cohérente
    type UneRegle = {
      [K in keyof ReglesDeSelectionObjectifVise]: {
        regle: K;
        modificateur: keyof NonNullable<ReglesDeSelectionObjectifVise[K]>;
        service: DescriptionServiceV2;
      };
    }[keyof ReglesDeSelectionObjectifVise];

    const casDeTests: Array<NonNullable<UneRegle>> = [
      {
        // Effet : Portail d'information
        regle: 'typeService',
        modificateur: 'portailInformation',
        service: uneDescriptionV2Valide()
          .avecTypesService(['portailInformation'])
          .construis(),
      },
      {
        // Effet : Service en ligne
        regle: 'typeService',
        modificateur: 'serviceEnLigne',
        service: uneDescriptionV2Valide()
          .avecTypesService(['serviceEnLigne'])
          .construis(),
      },
      {
        // Effet : Mails
        regle: 'specificitesProjet',
        modificateur: 'echangeOuReceptionEmails',
        service: uneDescriptionV2Valide()
          .avecSpecificitesProjet(['echangeOuReceptionEmails'])
          .construis(),
      },
    ];

    it.each(casDeTests)(
      'sait appliquer le modificateur $regle -> $modificateur',
      ({ regle, modificateur, service }) => {
        const s = new SelectionObjectifsVises(
          configurationObjectifsVises({
            OV1: {
              presentInitialement: false,
              regles: {
                [regle]: { [modificateur]: 'Ajouter' },
              },
            },
          })
        );

        const resultat = s.selectionnePourService(service);

        expect(resultat).toContain('OV1');
      }
    );
  });
});
