<script lang="ts">
  import type { Niveau } from '../risquesV2.d';

  interface Props {
    niveau: Niveau | undefined;
    desactive?: boolean;
  }

  let { niveau, desactive = false }: Props = $props();

  const couleurs = [
    'green-emeraude',
    'green-menthe',
    'blue-cumulus',
    'brown-caramel',
    'pink-tuile',
  ];
  let accentDuNiveau = $derived(desactive || !niveau ? '' : couleurs[niveau]);
</script>

<dsfr-badge
  label={niveau === undefined ? '-' : niveau}
  type="accent"
  accent={accentDuNiveau}
>
</dsfr-badge>
