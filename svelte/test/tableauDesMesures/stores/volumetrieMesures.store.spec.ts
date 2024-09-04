import { describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { volumetrieMesures } from '../../../lib/tableauDesMesures/stores/volumetrieMesures.store';
import { mesures } from '../../../lib/tableauDesMesures/stores/mesures.store';
import { Referentiel } from '../../../lib/ui/types.d';

describe('Le store dérivé de volumétrie des mesures', () => {
  describe('sur demande du total', () => {
    it('sait quand il n’y a pas de mesure', () => {
      const { total } = get(volumetrieMesures);

      expect(total).toBe(0);
    });

    it('connaît le nombre total des mesures specifiques', () => {
      mesures.reinitialise({
        mesuresGenerales: {},
        mesuresSpecifiques: [
          {
            id: 'M1',
            categorie: 'Protection',
            modalites: '',
            statut: 'Fait',
            description: '',
            identifiantNumerique: '000',
          },
        ],
      });

      const { total } = get(volumetrieMesures);

      expect(total).toBe(1);
    });

    it('connaît le nombre total des mesures générales', () => {
      mesures.reinitialise({
        mesuresGenerales: {
          testIntrusion: {
            categorie: 'Protection',
            indispensable: true,
            descriptionLongue: '',
            referentiel: Referentiel.ANSSI,
            modalites: '',
            description: '',
            identifiantNumerique: '000',
          },
        },
        mesuresSpecifiques: [],
      });

      const { total } = get(volumetrieMesures);

      expect(total).toBe(1);
    });
  });
  describe('sur demande du nombre de mesure sans statut', () => {
    it('retourne 0 quand il n’y en a pas', () => {
      mesures.reinitialise({
        mesuresGenerales: {
          mesureFaite: {
            categorie: 'Protection',
            indispensable: true,
            statut: 'Faite',
            descriptionLongue: '',
            referentiel: Referentiel.ANSSI,
            modalites: '',
            description: '',
            identifiantNumerique: '000',
          },
        },
        mesuresSpecifiques: [],
      });

      const { totalSansStatut } = get(volumetrieMesures);

      expect(totalSansStatut).toBe(0);
    });
    it('retourne 1 quand il y en a une', () => {
      mesures.reinitialise({
        mesuresGenerales: {
          mesureSansStatut: {
            categorie: 'Protection',
            indispensable: true,
            descriptionLongue: '',
            referentiel: Referentiel.ANSSI,
            modalites: '',
            description: '',
            identifiantNumerique: '000',
          },
        },
        mesuresSpecifiques: [],
      });

      const { totalSansStatut } = get(volumetrieMesures);

      expect(totalSansStatut).toBe(1);
    });
  });
});
