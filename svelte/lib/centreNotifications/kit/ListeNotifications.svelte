<script lang="ts">
  import ComposantNotification from './Notification.svelte';
  import type { Notification } from './centreNotifications.d';

  export let notifications: Notification[];
</script>

<div class="contenu-notifications">
  {#each notifications as notification (notification.id)}
    <ComposantNotification {notification} on:notificationMiseAJour />
  {/each}
</div>

<style>
  .contenu-notifications {
    max-height: 626px;
    overflow-y: auto;
  }
</style>
