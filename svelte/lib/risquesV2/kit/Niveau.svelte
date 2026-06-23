<script lang="ts">
  import type { Niveau } from '../risquesV2.d';

  interface Props {
    niveau: Niveau;
  }

  let { niveau }: Props = $props();

  const couleurs = [
    'yellow-tournesol',
    'green-menthe',
    'blue-cumulus',
    'pink-macaron',
  ];
  let accentDuNiveau = $derived(couleurs[niveau - 1]);
</script>

<dsfr-badge label={niveau} type="accent" accent={accentDuNiveau}> </dsfr-badge>
