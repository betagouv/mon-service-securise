<script lang="ts">
  interface Props {
    afficherBoutonEnvoyer: boolean;
    onAnnuler?: () => void;
    onEnvoyer?: () => void;
  }

  let { afficherBoutonEnvoyer, onAnnuler, onEnvoyer }: Props = $props();
</script>

<div class="conteneur-actions">
  <button
    class="bouton bouton-secondaire fermeture-tiroir"
    type="button"
    onclick={onAnnuler}
  >
    Annuler
  </button>

  {#if afficherBoutonEnvoyer}
    <button class="bouton" type="button" onclick={onEnvoyer}>
      Envoyer une invitation
    </button>
  {/if}
</div>
