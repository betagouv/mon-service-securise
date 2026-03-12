<script lang="ts">
  import type { Droits, Invitation } from '../gestionContributeurs.d';
  import { enDroitsSurRubrique } from '../gestionContributeurs.d';
  import Initiales from '../../ui/Initiales.svelte';
  import TagNiveauDroit from '../kit/TagNiveauDroit.svelte';
  import type { ResumeNiveauDroit } from '../../ui/types';
  import BoutonSuppressionContributeur from '../../ui/BoutonSuppressionContributeur.svelte';
  import type { Contributeur } from '../kit/ChampAvecSuggestions.svelte';

  interface Props {
    invitations: Invitation[];
    onDroitsChange: (invitation: Invitation) => void;
    onChoixPersonnalisation: (utilisateur: Contributeur) => void;
    onSupprimerInvitation: (utilisateur: Contributeur) => void;
  }

  let {
    invitations,
    onChoixPersonnalisation,
    onDroitsChange,
    onSupprimerInvitation,
  }: Props = $props();

  const resumeLesDroits = (droits: Droits): ResumeNiveauDroit => {
    if (droits.estProprietaire) return 'PROPRIETAIRE';
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
        <span class="prenom-nom">{utilisateur.prenomNom}</span>
      </div>
      <div class="conteneur-actions">
        <TagNiveauDroit
          niveau={resumeLesDroits(droits)}
          droitsModifiables={true}
          onDroitsChange={(droits) =>
            onDroitsChange({
              utilisateur,
              droits: enDroitsSurRubrique(droits),
            })}
          onChoixPersonnalisation={() => onChoixPersonnalisation(utilisateur)}
        />
        <BoutonSuppressionContributeur
          onclick={() => onSupprimerInvitation(utilisateur)}
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
    font-weight: 500;
    overflow: hidden;
  }

  .prenom-nom {
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
