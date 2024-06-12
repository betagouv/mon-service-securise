<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { marqueNotificationCommeLue } from '../centreNotifications.api';
  import type { Notification } from '../centreNotifications.d';
  import { formatteDifferenceDateRelative } from '../../formatDate/formatDate';

  export let notification: Notification;

  const dispatch = createEventDispatcher();
  const enteteNotification =
    notification.type === 'nouveaute' ? 'Nouveautés' : notification.entete;
  const cibleCta = notification.type === 'nouveaute' ? '_blank' : '';
  const relationCta = notification.type === 'nouveaute' ? 'noopener' : '';
  const actionClick =
    notification.type === 'nouveaute'
      ? async () => {
          await marqueNotificationCommeLue(notification.id);
          dispatch('notificationMiseAJour');
        }
      : () => {};
</script>

<a
  class="notification"
  href={notification.lien}
  rel={relationCta}
  target={cibleCta}
  on:click={actionClick}
>
  <div class="conteneur-pictogramme {notification.type}">
    {#if notification.statutLecture === 'nonLue'}
      <div class="pastille-non-lue" />
    {/if}
    <img
      src="/statique/assets/images/notifications/{notification.type}.svg"
      alt="Icône de {notification.type}"
    />
  </div>
  <div class="conteneur-notification">
    <p class="type-notification">{enteteNotification}</p>
    <p class="titre">{notification.titre}</p>
    {#if notification.type === 'nouveaute'}
      <div class="cartouche-cta">
        <img
          src="/statique/assets/images/notifications/illustrations/{notification.image}"
          alt="Illustration de la nouveauté {notification.titre}"
        />
        <div>
          <p class="sous-titre">{notification.sousTitre}</p>
          <div class="cta">Découvrir</div>
        </div>
      </div>
    {:else}
      <div class="cta cta-tache">
        {notification.titreCta}
      </div>
    {/if}

    {#if notification.type === 'nouveaute'}
      <div class="horodatage">
        <span
          >{formatteDifferenceDateRelative(
            notification.dateDeDeploiement
          )}</span
        >
      </div>
    {/if}
  </div>
</a>

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
    cursor: pointer;
  }

  .notification:hover {
    background: var(--systeme-design-etat-gris-survol);
  }

  .conteneur-pictogramme {
    --taille: 40px;
    min-width: var(--taille);
    min-height: var(--taille);
    max-width: var(--taille);
    max-height: var(--taille);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .conteneur-pictogramme.tache {
    background: var(--fond-ocre-pale);
  }

  .conteneur-pictogramme.nouveaute {
    background: var(--fond-bleu-pale);
  }

  .cartouche-cta {
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: start;
    gap: 10px;
    border: 1px solid var(--liseres-fonce);
    border-radius: 8px;
  }

  .cartouche-cta img {
    max-width: 86px;
  }

  .cta {
    color: var(--bleu-mise-en-avant);
    padding: 4px 8px;
    border: 1px solid var(--bleu-mise-en-avant);
    border-radius: 4px;
    font-size: 12px;
    background: none;
    width: fit-content;
  }

  .cta-tache {
    margin-top: 16px;
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
