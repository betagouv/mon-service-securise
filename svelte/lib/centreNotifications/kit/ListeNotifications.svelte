<script lang="ts">
  import ComposantNotification from './Notification.svelte';
  import type { Notification } from '../centreNotifications.d';

  export let notifications: Notification[];
</script>

<div class="contenu-notifications">
  {#if notifications.length === 0}
    <div class="conteneur-aucune-notification">
      <img
        src="/statique/assets/images/notifications/aucune_notification.svg"
        alt="Illustration en cas d'absense de notification"
      />
      <p>Vous n’avez pas de notifications</p>
    </div>
  {:else}
    {#each notifications as notification (notification.id)}
      <ComposantNotification {notification} />
    {/each}
  {/if}
</div>

<style>
  .contenu-notifications {
    max-height: 626px;
    overflow-y: auto;
  }

  .conteneur-aucune-notification {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 36px 0;
    border-top: 1px solid var(--liseres-fonce);
  }

  .conteneur-aucune-notification p {
    color: var(--texte-clair);
  }
</style>
