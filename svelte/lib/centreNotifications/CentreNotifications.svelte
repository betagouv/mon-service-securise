<script lang="ts">
  import { onMount } from 'svelte';
  import FermetureSurClicEnDehors from '../ui/FermetureSurClicEnDehors.svelte';
  import type { Notification } from '/centreNotifications.d';
  import {
    marqueNotificationCommeLue,
    recupereNotifications,
  } from './centreNotifications.api';

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

  const formatteDate = (chaineDate: string) => {
    const dateDeploiement = new Date(chaineDate);
    const maintenant = new Date();
    const differenceEnJours = Math.round(
      (dateDeploiement.getTime() - maintenant.getTime()) / (1000 * 3600 * 24)
    );
    const formatter = new Intl.RelativeTimeFormat('fr-FR', {
      localeMatcher: 'best fit',
      numeric: 'auto',
      style: 'long',
    });
    const dateFormattee = formatter.format(differenceEnJours, 'day');
    return dateFormattee.charAt(0).toUpperCase() + dateFormattee.slice(1);
  };
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
                    await rafraichisNotifications();
                  }}>Découvrir</a
                >
              </div>
            </div>
            <div class="horodatage">
              <span>{formatteDate(notification.dateDeDeploiement)}</span>
            </div>
          </div>
        </div>
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

  .conteneur-notifications img {
    max-width: 86px;
  }

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
