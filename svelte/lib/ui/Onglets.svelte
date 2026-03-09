<script lang="ts">
  import Onglet from './Onglet.svelte';

  type ConfigurationOnglet = {
    id: string;
    label: string;
    badge?: number;
  };

  interface Props {
    onglets: ConfigurationOnglet[];
    ongletActif: string;
    sansBordureEnBas?: boolean;
  }

  let {
    onglets,
    ongletActif = $bindable(),
    sansBordureEnBas = false,
  }: Props = $props();
</script>

<div class="conteneur-onglets">
  {#each onglets as onglet (onglet.id)}
    {@const { id, label, badge } = onglet}
    <Onglet
      bind:ongletActif
      cetOnglet={id}
      labelOnglet={label}
      {badge}
      {sansBordureEnBas}
    />
  {/each}
</div>

<style lang="scss">
  .conteneur-onglets {
    display: flex;
    gap: 8px;
    margin-bottom: -1px;
  }
</style>
