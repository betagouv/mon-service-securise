<script lang="ts">
  import { onMount } from 'svelte';
  import FermetureSurClicEnDehors from '../ui/FermetureSurClicEnDehors.svelte';
  import ComposantNotification from './kit/Notification.svelte';
  import type { Notification } from './centreNotifications.d';
  import { recupereNotifications } from './centreNotifications.api';

  let ouvert = false;
  let elementCentreNotifications: HTMLDivElement;

  let notifications: Notification[] = [];
  $: nbNonLue = notifications.filter(
    (n) => n.statutLecture === 'nonLue'
  ).length;
  const rafraichisNotifications = async () => {
    notifications = await recupereNotifications();
  };

  onMount(async () => {
    await rafraichisNotifications();
  });
</script>

<FermetureSurClicEnDehors
  bind:doitEtreOuvert={ouvert}
  elements={[elementCentreNotifications]}
/>
<div
  class="centre-notifications"
  class:ouvert
  bind:this={elementCentreNotifications}
>
  <button id="affiche-notifications" on:click={() => (ouvert = !ouvert)}>
    {#if nbNonLue}
      <span class="pastille-nb-non-lue">{nbNonLue}</span>
    {/if}
    <img
      src="/statique/assets/images/icone_notification.svg"
      alt="Centre de notifications"
    />
  </button>
  <div class="conteneur-notifications">
    <div class="entete-centre-notifications">
      <p class="titre-centre-notifications">Notifications</p>
      <button id="masque-notifications" on:click={() => (ouvert = false)}
        >Fermer</button
      >
    </div>
    <div class="contenu-notifications">
      {#each notifications as notification (notification.id)}
        <ComposantNotification
          {notification}
          on:notificationMiseAJour={async () => await rafraichisNotifications()}
        />
      {/each}
    </div>
  </div>
</div>

<style>
  #affiche-notifications {
    border: none;
    background: none;
    cursor: pointer;
    padding: 10px;
    border-radius: 5px;
    height: 36px;
    position: relative;
  }

  #affiche-notifications:hover {
    background: var(--systeme-design-etat-gris-survol);
  }

  #affiche-notifications .pastille-nb-non-lue {
    position: absolute;
    top: 0;
    right: 0;
    background: #ca3535;
    width: 16px;
    height: 16px;
    border: 1px solid white;
    font-size: 12px;
    line-height: 14px;
    font-weight: 500;
    border-radius: 9999px;
    color: white;
  }

  .centre-notifications.ouvert #affiche-notifications {
    background: #eff6ff;
  }

  .centre-notifications {
    position: relative;
  }

  .entete-centre-notifications {
    padding: 18px 24px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  #masque-notifications {
    background: none;
    border: none;
    color: var(--bleu-anssi);
    display: flex;
    gap: 8px;
    cursor: pointer;
  }

  #masque-notifications::after {
    content: '';
    background: url('/statique/assets/images/icone_fermeture_modale.svg');
    width: 24px;
    height: 24px;
    display: flex;
  }

  #masque-notifications:hover {
    background: var(--systeme-design-etat-gris-survol);
  }

  .titre-centre-notifications {
    font-size: 20px;
    font-weight: bold;
    margin: 0;
  }

  .conteneur-notifications {
    display: none;
    width: 470px;
    position: absolute;
    right: 0;
    top: 42px;
    background: white;
    z-index: 1000;
    flex-direction: column;
    border-radius: 8px;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.12);
    border: 1px solid #eff6ff;
  }

  .centre-notifications.ouvert .conteneur-notifications {
    display: flex;
  }

  .contenu-notifications {
    max-height: 626px;
    overflow-y: auto;
  }
</style>
