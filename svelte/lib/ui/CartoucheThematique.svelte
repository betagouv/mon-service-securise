<script lang="ts">
  interface Props {
    thematique: string;
  }

  let { thematique }: Props = $props();
</script>

<dsfr-tag label={thematique} size="sm"></dsfr-tag>
