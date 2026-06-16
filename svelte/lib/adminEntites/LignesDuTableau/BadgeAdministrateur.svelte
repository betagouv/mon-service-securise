<script lang="ts">
  interface Props {
    prenomNom: string;
  }

  let { prenomNom }: Props = $props();
</script>

<dsfr-tag label={prenomNom} size="sm"></dsfr-tag>
