<script lang="ts">
  import type { Service, Utilisateur } from '../gestionContributeurs.d';
  import { enDroitsSurRubrique } from '../gestionContributeurs.d';
  import { store } from '../gestionContributeurs.store';
  import Initiales from '../../ui/Initiales.svelte';
  import TagNiveauDroit from './TagNiveauDroit.svelte';
  import type { ResumeNiveauDroit } from '../../ui/types';
  import { storeAutorisations } from '../stores/autorisations.store';
  import BoutonSuppressionContributeur from '../../ui/BoutonSuppressionContributeur.svelte';
  import type { Contributeur } from './ChampAvecSuggestions.svelte';

  interface Props {
    droitsModifiables: boolean;
    afficheDroits?: boolean;
    utilisateur: Contributeur | Utilisateur;
  }

  let {
    droitsModifiables,
    afficheDroits = true,
    utilisateur,
  }: Props = $props();

  let serviceUnique: Service = $derived($store.services[0]);

  let autorisation = $derived(
    'id' in utilisateur
      ? $storeAutorisations.autorisations[utilisateur.id]
      : undefined
  );

  const estUtilisateur = (u: Contributeur | Utilisateur): u is Utilisateur =>
    'id' in u;

  const changeDroits = async (nouveauDroit: ResumeNiveauDroit) => {
    const idAutorisation = autorisation!.idAutorisation;

    const { data: autorisationMAJ } = await axios.patch(
      `/api/service/${serviceUnique.id}/autorisations/${idAutorisation}`,
      { droits: enDroitsSurRubrique(nouveauDroit) }
    );

    storeAutorisations.remplace(autorisationMAJ);
  };
</script>

<li class="ligne-contributeur">
  <div class="contenu-nom-prenom">
    <Initiales
      valeur={utilisateur.initiales}
      resumeNiveauDroit={autorisation?.resumeNiveauDroit}
    />
    <div class="nom-prenom-poste">
      <div class="nom-contributeur">{utilisateur.prenomNom}</div>
      {#if 'poste' in utilisateur}
        <div class="poste-contributeur">{utilisateur.poste}</div>
      {/if}
    </div>
  </div>
  <div class="conteneur-actions">
    {#if afficheDroits && autorisation?.resumeNiveauDroit && estUtilisateur(utilisateur)}
      <TagNiveauDroit
        niveau={autorisation.resumeNiveauDroit}
        {droitsModifiables}
        onDroitsChange={(nouveauxDroits) => changeDroits(nouveauxDroits)}
        onChoixPersonnalisation={() =>
          store.navigation.affichePersonnalisationContributeur(utilisateur)}
      />
    {/if}

    {#if droitsModifiables && estUtilisateur(utilisateur)}
      <BoutonSuppressionContributeur
        onclick={() => store.navigation.afficheEtapeSuppression(utilisateur)}
      />
    {/if}
  </div>
</li>

<style>
  .contenu-nom-prenom {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .nom-contributeur {
    font-weight: 500;
    word-break: break-word;
  }
  .poste-contributeur {
    font-weight: 500;
    color: #667892;
  }
</style>
