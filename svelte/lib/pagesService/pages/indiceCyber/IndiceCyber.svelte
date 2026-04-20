<script lang="ts">
  import NavigationSecuriser from '../../kit/NavigationSecuriser.svelte';
  import { onMount } from 'svelte';

  interface Props {
    idService: string;
  }

  let { idService }: Props = $props();

  const configurationsTabs = [
    {
      id: 'indice-cyber-anssi',
      label: 'Indice cyber ANSSI',
    },
    {
      id: 'indice-cyber-personnalise',
      label: 'Indice cyber personnalisé',
    },
  ];

  let tabActive = $state(0);
  onMount(() => {
    const requete = new URLSearchParams(window.location.search);
    const ongletActif = requete.get('onglet');
    if (ongletActif) {
      tabActive = configurationsTabs.findIndex((c) => c.id === ongletActif);
    }
  });

  const gereChangementTab = (e: CustomEvent<{ index: number }>) => {
    tabActive = e.detail.index;

    const url = new URL(window.location.href);
    url.searchParams.set('onglet', configurationsTabs[tabActive].id);
    history.pushState(null, '', url);
  };
</script>

<div class="conteneur-indice-cyber">
  <NavigationSecuriser {idService} />
  <dsfr-tabs
    tabs={configurationsTabs}
    activeTabIndex={tabActive}
    ontabchanged={gereChangementTab}
  >
    <div slot="panel-1" class="conteneur-onglet"></div>
  </dsfr-tabs>
</div>

<style lang="scss">
</style>
