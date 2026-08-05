<script lang="ts">
  import { IdentifiantNiveauRisque, type Risque } from './risques.d';

  interface Props {
    risque: Risque;
  }

  let { risque }: Props = $props();

  let libelle = $derived(
    risque.type === 'GENERAL'
      ? `Risque ${risque.identifiantNumerique.substring(1)} (${
          risque.identifiantNumerique
        })`
      : `Risque spécifique ${risque.identifiantNumerique.substring(2)}`
  );

  export const mappingCouleursDSFR: Record<IdentifiantNiveauRisque, string> = {
    faible: 'green-bourgeon',
    moyen: 'yellow-moutarde',
    eleve: 'pink-macaron',
    indeterminable: '',
    negligeable: '',
  };
</script>

<dsfr-badge
  class:inactif={risque.desactive}
  label={libelle}
  type="accent"
  accent={risque.desactive ? '' : mappingCouleursDSFR[risque.niveauRisque]}
></dsfr-badge>

<style lang="scss">
  dsfr-badge {
    height: fit-content;
    white-space: nowrap;

    &.inactif {
      opacity: 0.5;
    }
  }
</style>
