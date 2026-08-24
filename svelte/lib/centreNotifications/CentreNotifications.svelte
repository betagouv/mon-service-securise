<script lang="ts">
  import { onMount } from 'svelte';
  import FermetureSurClicEnDehors from '../ui/FermetureSurClicEnDehors.svelte';
  import type { Notification } from '../ui/types.d';
  import ListeNotifications from './kit/ListeNotifications.svelte';
  import { storeNotifications } from '../ui/stores/notifications.store';
  import TitreOngletDSFR from '../ui/TitreOngletDSFR.svelte';

  let ouvert = $state(false);
  let elementCentreNotifications: HTMLDivElement | undefined = $state();

  const calculNbNonLue = (notifications: Notification[]) =>
    notifications.filter((n) => n.statutLecture === 'nonLue').length;

  let nbNonLue = $derived(
    calculNbNonLue($storeNotifications.pourCentreNotifications)
  );

  let notificationsParOnglet = $derived({
    aFaire: $storeNotifications.pourCentreNotifications.filter(
      (n) => n.type === 'tache'
    ),
    nouveautes: $storeNotifications.pourCentreNotifications.filter(
      (n) => n.type === 'nouveaute'
    ),
    toutes: $storeNotifications.pourCentreNotifications,
  });

  const configurationsTabs = [
    { id: 'toutes', label: 'Toutes' },
    { id: 'nouveautes', label: 'Nouveautés' },
  ];
  let idTabActive = $state(0);
  const gereChangementTab = (e: CustomEvent<{ index: number }>) => {
    idTabActive = e.detail.index;
  };

  onMount(async () => {
    await storeNotifications.rafraichis();
  });
</script>

<FermetureSurClicEnDehors
  bind:doitEtreOuvert={ouvert}
  elements={elementCentreNotifications ? [elementCentreNotifications] : []}
/>
<div
  class="centre-notifications"
  class:ouvert
  bind:this={elementCentreNotifications}
>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <dsfr-button
    id="affiche-notifications"
    label="Notifications"
    kind="tertiary-no-outline"
    hasIcon
    icon="notification-3-line"
    size="sm"
    data-themeable="false"
    onclick={() => (ouvert = !ouvert)}
    class="bouton-notification"
  >
    Notifications

    {#if nbNonLue}
      <span class="bouton-notification__indicateur" aria-hidden="true"
        >{nbNonLue}</span
      >
    {/if}
  </dsfr-button>
  <div class="conteneur-notifications">
    <div class="entete-centre-notifications">
      <p class="titre-centre-notifications">Notifications</p>
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button
        label="Fermer"
        preset="close"
        onclick={() => (ouvert = false)}
      ></dsfr-button>
    </div>
    <dsfr-tabs
      tabs={configurationsTabs}
      active-tab-index={idTabActive}
      ontabchanged={gereChangementTab}
    >
      <div slot="tab-1">
        <TitreOngletDSFR
          active={idTabActive === 0}
          libelle={configurationsTabs[0].label}
          libellePastille={calculNbNonLue(
            notificationsParOnglet.toutes
          ).toString()}
        />
      </div>
      <div slot="tab-2">
        <TitreOngletDSFR
          active={idTabActive === 1}
          libelle={configurationsTabs[1].label}
          libellePastille={calculNbNonLue(
            notificationsParOnglet.nouveautes
          ).toString()}
        />
      </div>
      <div slot="panel-1" class="conteneur-onglet">
        <ListeNotifications notifications={notificationsParOnglet.toutes} />
      </div>
      <div slot="panel-2" class="conteneur-onglet">
        <ListeNotifications notifications={notificationsParOnglet.nouveautes} />
      </div>
    </dsfr-tabs>
  </div>
</div>

<style>
  .bouton-notification {
    position: relative;
  }

  .bouton-notification__indicateur {
    background-color: var(--artwork-minor-red-marianne);
    border-radius: 50%;
    width: 12px;
    height: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-inverted-grey);
    font-size: 8px;
    position: absolute;
    left: 16px;
    top: 4px;
  }

  .centre-notifications {
    display: inline-block;
  }

  #affiche-notifications {
    border: none;
    background: none;
    cursor: pointer;
    padding: 10px;
    border-radius: 5px;
    height: 36px;
    position: relative;
    display: flex;
  }

  #affiche-notifications:hover {
    background: var(--systeme-design-etat-gris-survol);
  }

  .centre-notifications.ouvert #affiche-notifications {
    background: #eff6ff;
  }

  .centre-notifications {
    position: relative;
  }

  .entete-centre-notifications {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .titre-centre-notifications {
    color: #161616;
    font-size: 1.375rem;
    font-style: normal;
    font-weight: 700;
    line-height: 1.75rem;
    margin: 0;
  }

  .conteneur-notifications {
    display: none;
    width: 588px;
    position: absolute;
    right: 0;
    top: 42px;
    background: white;
    z-index: 1000;
    flex-direction: column;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.12);
    border: 1px solid #eff6ff;
    padding: 16px;
  }

  .centre-notifications.ouvert .conteneur-notifications {
    display: flex;
  }

  dsfr-tabs {
    margin-top: 32px;
  }
</style>
