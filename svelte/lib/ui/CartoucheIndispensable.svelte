<script lang="ts">
  interface Props {
    indispensable: boolean;
  }

  let { indispensable }: Props = $props();
</script>

<dsfr-badge
  label={indispensable ? 'Indispensable' : 'Recommandée'}
  type="accent"
  accent={indispensable ? 'purple-glycine' : 'blue-ecume'}
  size="sm"
></dsfr-badge>
