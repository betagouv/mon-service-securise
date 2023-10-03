<script lang="ts">
  import type {
    Autorisation,
    ResumeNiveauDroit,
    Service,
    Utilisateur,
  } from './gestionContributeurs.d';
  import { store } from './gestionContributeurs.store';
  import Initiales from './Initiales.svelte';
  import TagNiveauDroit from './TagNiveauDroit.svelte';
  import { enPermission } from './gestionContributeurs.d';

  export let droitsModifiables: boolean;
  export let utilisateur: Utilisateur;
  export let autorisation: Autorisation | undefined;

  let serviceUnique: Service;
  $: serviceUnique = $store.services[0];

  const changeDroits = async (nouveauDroit: ResumeNiveauDroit) => {
    const permission = enPermission(nouveauDroit);
    const idAutorisation = autorisation!.idAutorisation;
    const { data: autorisationMAJ } = await axios.patch(
      `/api/service/${serviceUnique.id}/autorisations/${idAutorisation}`,
      {
        droits: {
          DECRIRE: permission,
          SECURISER: permission,
          HOMOLOGUER: permission,
          RISQUES: permission,
          CONTACTS: permission,
        },
      }
    );

    autorisation = autorisationMAJ;
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
      <div class="poste-contributeur">{@html utilisateur.poste}</div>
    </div>
  </div>
  <div class="conteneur-actions">
    {#if autorisation?.resumeNiveauDroit}
      <TagNiveauDroit
        niveau={autorisation.resumeNiveauDroit}
        {droitsModifiables}
        on:droitsChange={(e) => changeDroits(e.detail)}
      />
    {/if}

    {#if droitsModifiables}
      <!--    svelte-ignore a11y-click-events-have-key-events-->
      <div
        class="conteneur-suppression"
        on:click={() => store.afficheEtapeSuppression(utilisateur)}
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
    align-items: center;
    justify-content: flex-end;
    cursor: pointer;
  }
</style>
