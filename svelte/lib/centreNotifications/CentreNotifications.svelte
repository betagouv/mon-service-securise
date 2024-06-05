<script lang="ts">
  import FermetureSurClicEnDehors from '../ui/FermetureSurClicEnDehors.svelte';

  let ouvert = false;
  let elementCentreNotifications: HTMLDivElement;
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
      <img
        src="/statique/assets/images/notifications/notification_vide.svg"
        alt="Illustration de notification vide"
      />
      <p>Vous n’avez pas de notifications</p>
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
    padding: 36px 0 48px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .contenu-notifications p {
    color: var(--texte-clair);
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }
</style>
