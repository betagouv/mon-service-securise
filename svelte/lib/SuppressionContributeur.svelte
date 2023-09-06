<script lang="ts">
  import type { Service, Utilisateur } from './gestionContributeurs.d';

  import { createEventDispatcher } from 'svelte';
  import { gestionContributeursStore } from './gestionContributeurs.store';

  export let utilisateur: Utilisateur;
  export let service: Service;

  const envoiEvenement = createEventDispatcher();

  const supprimeContributeur = async () => {
    await axios.delete('/api/autorisation', {
      params: { idHomologation: service.id, idContributeur: utilisateur.id },
    });
    gestionContributeursStore.afficheEtapeListe();
    envoiEvenement('suppressionEffectuee', { ...utilisateur });
  };
</script>

<div class="conteneur-confirmation">
  <p class="entete">
    Souhaitez-vous vraiment retirer les accès de {utilisateur.prenomNom} au service
    <strong>{service.nomService}</strong> ?
  </p>
  <div class="banniere-information">
    <img
      src="/statique/assets/images/icone_information_suppression.svg"
      alt="icone d'information"
    />
    <div class="contenu-texte-information">
      <strong>Cette action est réversible</strong>
      <p>Vous pourrez ajouter à nouveau cette personne.</p>
    </div>
  </div>
  <div class="conteneur-actions">
    <button
      class="bouton bouton-secondaire"
      type="button"
      on:click={() =>
        gestionContributeursStore.afficheEtapeListe()}
    >
      Annuler
    </button>
    <button
      class="bouton confirmation-suppression"
      type="button"
      on:click={supprimeContributeur}
    >
      Retirer du service
    </button>
  </div>
</div>
