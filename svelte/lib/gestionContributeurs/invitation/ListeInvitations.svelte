<script lang="ts">
  import type {
    Permission,
    ResumeNiveauDroit,
    Rubrique,
    Utilisateur,
  } from '../gestionContributeurs.d';
  import { enDroitsSurRubrique } from '../gestionContributeurs.d';
  import Initiales from '../kit/Initiales.svelte';
  import TagNiveauDroit from '../kit/TagNiveauDroit.svelte';
  import { createEventDispatcher } from 'svelte';

  type Invitation = {
    utilisateur: Utilisateur;
    droits: Record<Rubrique, Permission>;
  };

  export let invitations: Invitation[];
  const dispatch = createEventDispatcher<{
    droitsChange: Invitation;
    choixPersonnalisation: Utilisateur;
    supprimerInvitation: Utilisateur;
  }>();

  const resumeLesDroits = (
    droits: Record<Rubrique, Permission>
  ): ResumeNiveauDroit => {
    if (Object.values(droits).every((p) => p === 1)) return 'LECTURE';
    if (Object.values(droits).every((p) => p === 2)) return 'ECRITURE';
    return 'PERSONNALISE';
  };
</script>

<ul id="liste-ajout-contributeur">
  {#each invitations as { utilisateur, droits } (utilisateur.email)}
    <li class="contributeur-a-inviter">
      <div class="contenu-nom-prenom">
        <Initiales
          valeur={utilisateur.initiales}
          resumeNiveauDroit={resumeLesDroits(droits)}
        />
        <span>{@html utilisateur.prenomNom}</span>
      </div>
      <div class="conteneur-actions">
        <TagNiveauDroit
          niveau={resumeLesDroits(droits)}
          droitsModifiables={true}
          on:droitsChange={(e) =>
            dispatch('droitsChange', {
              utilisateur,
              droits: enDroitsSurRubrique(e.detail),
            })}
          on:choixPersonnalisation={() =>
            dispatch('choixPersonnalisation', utilisateur)}
        />
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <img
          class="bouton-suppression-contributeur"
          src="/statique/assets/images/icone_supprimer_gris.svg"
          alt="bouton de suppression d'un contributeur"
          on:click={() => dispatch('supprimerInvitation', utilisateur)}
        />
      </div>
    </li>
  {/each}
</ul>

<style>
  .contributeur-a-inviter {
    display: flex;
    justify-content: space-between;
  }
  .contenu-nom-prenom {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
