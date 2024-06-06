<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { marqueNotificationCommeLue } from '../centreNotifications.api';
  import type { Notification } from '../centreNotifications.d';
  import { formatteDifferenceDateRelative } from '../../formatDate/formatDate';

  export let notification: Notification;

  const dispatch = createEventDispatcher();
</script>

<div class="notification">
  <div class="conteneur-pictogramme">
    {#if notification.statutLecture === 'nonLue'}
      <div class="pastille-non-lue" />
    {/if}
    <img
      src="/statique/assets/images/notifications/nouveaute.svg"
      alt="Icône de nouveauté"
    />
  </div>
  <div class="conteneur-notification">
    <p class="type-notification">Nouveautés</p>
    <p class="titre">{notification.titre}</p>
    <div class="cartouche-cta">
      <img
        src="/statique/assets/images/notifications/illustrations/{notification.image}"
        alt="Illustration de la nouveauté {notification.titre}"
      />
      <div>
        <p class="sous-titre">{notification.sousTitre}</p>
        <a
          href={notification.lien}
          class="cta"
          rel="noopener"
          target="_blank"
          on:click={async () => {
            await marqueNotificationCommeLue(notification.id);
            dispatch('notificationMiseAJour');
          }}>Découvrir</a
        >
      </div>
    </div>
    <div class="horodatage">
      <span
        >{formatteDifferenceDateRelative(notification.dateDeDeploiement)}</span
      >
    </div>
  </div>
</div>

<style>
  .type-notification {
    font-weight: bold;
    margin: 0;
    font-size: 16px;
  }

  .notification {
    text-decoration: none;
    color: var(--texte-fonce);
    padding: 16px;
    border-top: 1px solid var(--liseres-fonce);
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  .conteneur-pictogramme {
    --taille: 40px;
    min-width: var(--taille);
    min-height: var(--taille);
    max-width: var(--taille);
    max-height: var(--taille);
    border-radius: 50%;
    background: var(--fond-bleu-pale);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .cartouche-cta {
    padding: 8px;
    display: flex;
    align-items: start;
    justify-content: start;
    gap: 10px;
    border: 1px solid var(--liseres-fonce);
    border-radius: 8px;
  }

  .cartouche-cta img {
    max-width: 86px;
  }

  a.cta {
    color: var(--bleu-mise-en-avant);
    padding: 4px 8px;
    border: 1px solid var(--bleu-mise-en-avant);
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }

  a.cta:hover {
    background: var(--bleu-mise-en-avant) !important;
    color: white;
  }

  p.sous-titre {
    margin-top: 0;
    font-size: 12px;
  }

  p.titre {
    margin: 4px 0 8px 0;
    font-size: 14px;
  }

  .horodatage {
    color: var(--texte-clair);
    font-size: 12px;
    margin-top: 8px;
  }

  .pastille-non-lue {
    width: 8px;
    height: 8px;
    background: #ca3535;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
  }
</style>
