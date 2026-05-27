<script lang="ts">
  interface Props {
    thematique: string;
  }

  let { thematique }: Props = $props();
</script>

<dsfr-badge label={thematique} type="accent" accent="brown-opera" size="sm"
></dsfr-badge>
