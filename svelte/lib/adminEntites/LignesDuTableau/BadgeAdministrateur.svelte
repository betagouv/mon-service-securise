<script lang="ts">
  interface Props {
    prenomNom: string;
  }

  let { prenomNom }: Props = $props();
</script>

<dsfr-badge label={prenomNom} type="accent" accent="blue-ecume" size="sm"
></dsfr-badge>
