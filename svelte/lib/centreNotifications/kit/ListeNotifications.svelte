<script lang="ts">
  import ComposantNotification from './Notification.svelte';
  import type { Notification } from '../../ui/types.d';
  import { SvelteDate } from 'svelte/reactivity';

  interface Props {
    notifications: Notification[];
  }

  const UN_JOUR_EN_MILLIS = 86_400_000;

  let { notifications }: Props = $props();

  let dAujourdHui = $derived(
    notifications.filter((n) => categoriserDate(n.horodatage) === 'aujourdhui')
  );
  let deCetteSemaine = $derived(
    notifications.filter(
      (n) => categoriserDate(n.horodatage) === 'cetteSemaine'
    )
  );
  let precedentes = $derived(
    notifications.filter((n) => categoriserDate(n.horodatage) === 'precedent')
  );

  export const categoriserDate = (dateISO: string | undefined) => {
    if (!dateISO) return 'aujourdhui';

    const debutDuJour = (date: string | Date) =>
      new SvelteDate(date).setHours(0, 0, 0, 0);

    const jours = Math.round(
      (debutDuJour(new Date()) - debutDuJour(new Date(dateISO))) /
        UN_JOUR_EN_MILLIS
    );

    if (jours === 0) return 'aujourdhui';
    if (jours > 0 && jours <= 7) return 'cetteSemaine';
    return 'precedent';
  };
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
    {#if dAujourdHui.length > 0}
      <div class="conteneur-par-date">
        <h2>Aujourd'hui</h2>
        {#each dAujourdHui as notification (notification.id)}
          <ComposantNotification {notification} />
        {/each}
      </div>
    {/if}

    {#if deCetteSemaine.length > 0}
      <div class="conteneur-par-date">
        <h2>7 derniers jours</h2>
        {#each deCetteSemaine as notification (notification.id)}
          <ComposantNotification {notification} />
        {/each}
      </div>
    {/if}

    {#if precedentes.length > 0}
      <div class="conteneur-par-date">
        <h2>Précédemment</h2>
        {#each precedentes as notification (notification.id)}
          <ComposantNotification {notification} />
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .contenu-notifications {
    max-height: 322px;
    overflow-y: auto;
    font-size: 0.9rem;
    text-align: left;

    .conteneur-par-date {
      display: flex;
      flex-direction: column;
      gap: 12px;

      &:not(:last-of-type) {
        margin-bottom: 24px;
      }
    }

    h2 {
      margin: 0;
      padding: 12px 16px;
      font-size: 1rem;
      line-height: 1.5rem;
      font-weight: 500;
      color: #0279d0;
      background-color: #eaf5ff;
    }
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
