<script lang="ts">
  import type {
    ResumeNiveauDroit,
    Service,
    Utilisateur,
  } from './gestionContributeurs.d';
  import { store } from './gestionContributeurs.store';
  import Initiales from './Initiales.svelte';
  import TagNiveauDroit from './TagNiveauDroit.svelte';
  import { enDroitsSurRubrique } from './gestionContributeurs.d';

  export let droitsModifiables: boolean;
  export let afficheDroits: boolean = true;
  export let utilisateur: Utilisateur;

  let serviceUnique: Service;
  $: serviceUnique = $store.services[0];
  $: autorisation = $store.autorisations[utilisateur.id];

  const changeDroits = async (nouveauDroit: ResumeNiveauDroit) => {
    const idAutorisation = autorisation!.idAutorisation;

    const { data: autorisationMAJ } = await axios.patch(
      `/api/service/${serviceUnique.id}/autorisations/${idAutorisation}`,
      { droits: enDroitsSurRubrique(nouveauDroit) }
    );

    store.autorisations.remplace(autorisationMAJ);
  };
</script>

<li class="ligne-contributeur">
  <div class="contenu-nom-prenom">
    <Initiales
      valeur={utilisateur.initiales}
      resumeNiveauDroit={autorisation?.resumeNiveauDroit}
    />
    <div class="nom-prenom-poste">
      <div class="nom-contributeur">{@html utilisateur.prenomNom}</div>
      {#if utilisateur.poste}
        <div class="poste-contributeur">{@html utilisateur.poste}</div>
      {/if}
    </div>
  </div>
  <div class="conteneur-actions">
    {#if afficheDroits && autorisation?.resumeNiveauDroit}
      <TagNiveauDroit
        niveau={autorisation.resumeNiveauDroit}
        {droitsModifiables}
        on:droitsChange={({ detail: nouveauxDroits }) =>
          changeDroits(nouveauxDroits)}
        on:choixPersonnalisation={() =>
          store.navigation.affichePersonnalisationContributeur(utilisateur)}
      />
    {/if}

    {#if droitsModifiables}
      <!--    svelte-ignore a11y-click-events-have-key-events-->
      <div
        class="conteneur-suppression"
        on:click={() => store.navigation.afficheEtapeSuppression(utilisateur)}
      >
        <img
          src="/statique/assets/images/icone_supprimer_gris.svg"
          alt="supression d'un contributeur"
          title="Supprimer ce contributeur"
        />
      </div>
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

  .conteneur-suppression {
    display: flex;
    cursor: pointer;
  }
</style>
