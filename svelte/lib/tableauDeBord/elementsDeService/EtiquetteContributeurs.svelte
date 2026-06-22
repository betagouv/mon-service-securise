<script lang="ts">
  import { singulierPluriel } from '../../outils/string';

  interface Props {
    nombreContributeurs: number;
    onclick: (e: MouseEvent) => void;
  }

  let { nombreContributeurs, onclick }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
<dsfr-button
  {onclick}
  label={nombreContributeurs}
  aria-label="{nombreContributeurs} {singulierPluriel(
    'contributeur',
    'contributeurs',
    nombreContributeurs
  )}"
  kind="tertiary"
  size="sm"
  icon="user-line"
  icon-place="left"
  markup="button"
  type="button"
  target="self"
  has-icon
>
</dsfr-button>
