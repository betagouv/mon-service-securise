<script lang="ts">
  interface Props {
    indispensable: boolean;
  }

  let { indispensable }: Props = $props();
</script>

<dsfr-tag label={indispensable ? 'Indispensable' : 'Recommandée'} size="sm"
></dsfr-tag>
