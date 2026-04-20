<script lang="ts">
  import NavigationSecuriser from '../../kit/NavigationSecuriser.svelte';
  import { onMount } from 'svelte';
  import type { DonneesIndiceCyber } from './indiceCyber.types';

  interface Props {
    idService: string;
    indiceCyber: DonneesIndiceCyber;
    indiceCyberPersonnalise: DonneesIndiceCyber;
    noteMax: number;
  }

  let { idService, indiceCyber, indiceCyberPersonnalise, noteMax }: Props =
    $props();

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
    <div slot="tab-1" class="label-onglet">
      <span>Indice cyber ANSSI</span>
      <span class="pastille" class:active={tabActive === 0}
        >{indiceCyber.total.toFixed(1)}/{noteMax}</span
      >
    </div>
    <div slot="tab-2" class="label-onglet">
      <span>Indice cyber personnalisé</span>
      <span class="pastille" class:active={tabActive === 1}
        >{indiceCyberPersonnalise.total.toFixed(1)}/{noteMax}</span
      >
    </div>
    <div slot="panel-1" class="conteneur-onglet"></div>
    <div slot="panel-2" class="conteneur-onglet"></div>
  </dsfr-tabs>
</div>

<style lang="scss">
  .label-onglet {
    display: flex;
    gap: 8px;
    align-items: center;

    .pastille {
      background-color: white;
      color: #161616;
      padding: 2px 4px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 400;
      line-height: 1rem;
      height: fit-content;

      &.active {
        background-color: var(--bleu-mise-en-avant);
        color: white;
      }
    }
  }
</style>
