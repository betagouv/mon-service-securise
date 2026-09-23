<script lang="ts">
  let { prenom }: { prenom: string } = $props();
</script>

<p class="classe-test">Bonjour {prenom}</p>

<style>
  .classe-test {
    color: rebeccapurple;
  }
</style>
