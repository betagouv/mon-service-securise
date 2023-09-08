<script lang="ts">
  import type { Utilisateur } from './gestionContributeurs.d';

  import { gestionContributeursStore } from './gestionContributeurs.store';

  $: service = $gestionContributeursStore.services[0];

  $: utilisateur =
    $gestionContributeursStore.utilisateurEnCoursDeSuppression as Utilisateur;

  const supprimeContributeur = async () => {
    await axios.delete('/api/autorisation', {
      params: { idHomologation: service.id, idContributeur: utilisateur.id },
    });
    gestionContributeursStore.supprimeContributeur(utilisateur);
    document.body.dispatchEvent(new CustomEvent('jquery-recharge-services'));
    gestionContributeursStore.afficheEtapeListe();
  };
</script>

<div class="conteneur-confirmation">
  <p class="entete">
    Souhaitez-vous vraiment retirer les accès de {@html utilisateur.prenomNom} au
    service
    <strong>{@html service.nomService}</strong> ?
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
      on:click={() => gestionContributeursStore.afficheEtapeListe()}
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
