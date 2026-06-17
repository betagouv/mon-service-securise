<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../adminUtilisateurs/adminUtilisateurs.api';
  import { api as apiEntites } from '../adminEntites/adminEntites.api';
  import type { EntiteSupervisee } from '../adminEntites/adminEntites.types';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirNommerAdmin from '../adminUtilisateurs/TiroirNommerAdmin/TiroirNommerAdmin.svelte';
  import type { UtilisateurAdministre } from '../adminUtilisateurs/adminUtilisateurs.types';
  import Toaster from '../ui/Toaster.svelte';
  import Tuiles from './Tuiles.svelte';
  import { chaineNormalisee, singulierPluriel } from '../outils/string';
  import AucunResultatRecherche from '../ui/AucunResultatRecherche.svelte';
  import ChampRecherche from '../ui/ChampRecherche.svelte';
  import Bouton from '../ui/Bouton.svelte';
  import ModaleEntitesUtilisateurAdministre from '../adminUtilisateurs/ModaleEntitesUtilisateurAdministre.svelte';

  let mesUtilisateurs: UtilisateurAdministre[] = $state([]);
  let mesEntites: Array<EntiteSupervisee> = $state([]);
  let recherche = $state('');
  let utilisateurSelectionne: UtilisateurAdministre | undefined = $state();

  let modale: ModaleEntitesUtilisateurAdministre | undefined;

  onMount(async () => {
    await rafraichis();
  });

  const rafraichis = async () => {
    mesUtilisateurs = (await api.utilisateursDansMonPerimetre()).filter(
      (u) => u.estAdmin
    );
    mesEntites = await apiEntites.entitesDansMonPerimetre();
  };

  let rechercheNormalisee = $derived(chaineNormalisee(recherche));

  const mesUtilisateursFiltres = $derived(
    mesUtilisateurs.filter(
      (u) =>
        chaineNormalisee(u.prenomNom).includes(rechercheNormalisee) ||
        chaineNormalisee(u.email).includes(rechercheNormalisee)
    )
  );
</script>

<svelte:document on:utilisateurs-administres-modifies={rafraichis} />

<ModaleEntitesUtilisateurAdministre
  bind:this={modale}
  utilisateur={utilisateurSelectionne}
  toutesEntites={mesEntites}
/>

<Toaster />

<h1>Admins</h1>

<Tuiles nombreAdministrateurs={mesUtilisateurs.length} {mesEntites} />

{#if mesUtilisateurs.length === 0}
  <div class="aucun-resultat">
    <img src="/statique/assets/images/illustration_recherche_vide.svg" alt="" />
    <h2>Aucun admin sur vos entités</h2>
    <span
      >Ajoutez des admins pour déléguer la gestion et le suivi de vos entités.</span
    >
    <dsfr-button
      size="md"
      kind="primary"
      markup="a"
      href="/admin/entites"
      label="Ajouter des admins à mes entités"
    ></dsfr-button>
  </div>
{:else}
  <ChampRecherche bind:valeur={recherche} />

  {#if recherche.length > 0 && mesUtilisateursFiltres.length === 0}
    <AucunResultatRecherche onclick={() => (recherche = '')} />
  {:else}
    <dsfr-table
      columns={[
        { key: 'prenomNom', label: 'Nom' },
        { key: 'postes', label: 'Rôle' },
        { key: 'nombreEntites', label: 'Entité(s) associée(s)' },
        { key: 'nombreServices', label: 'Service(s) associé(s)' },
        { key: 'actions', label: 'Actions' },
      ]}
      rows={mesUtilisateursFiltres}
      rich
      multiline
    >
      {#each mesUtilisateursFiltres as utilisateur, i (utilisateur.id)}
        <div slot="cell:prenomNom:{i}" class="conteneur-nom">
          <span><b>{utilisateur.prenomNom}</b></span>
          {#if utilisateur.email !== utilisateur.prenomNom}
            <span>{utilisateur.email}</span>
          {/if}
        </div>
        <div slot="cell:nombreEntites:{i}">
          <span>
            {#if utilisateur.nombreEntites === 0}
              Aucune entité
            {:else}
              <Bouton
                type="lien-dsfr"
                titre="{utilisateur.nombreEntites} {singulierPluriel(
                  'entité',
                  'entités',
                  utilisateur.nombreEntites
                )}"
                onclick={() => {
                  utilisateurSelectionne = utilisateur;
                  modale?.affiche();
                }}
              />
            {/if}
          </span>
        </div>
        <div slot="cell:nombreServices:{i}">
          <span>
            {#if utilisateur.autorisations.length === 0}
              Aucun service
            {:else}
              {utilisateur.autorisations.length} service{utilisateur
                .autorisations.length > 1
                ? 's'
                : ''}
            {/if}
          </span>
        </div>
        <div slot="cell:actions:{i}">
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
          <dsfr-button
            kind="secondary"
            label="Gérer les accès"
            size="sm"
            onclick={() => {
              tiroirStore.afficheContenu(TiroirNommerAdmin, {
                utilisateur,
                toutesEntites: mesEntites,
              });
            }}
          ></dsfr-button>
        </div>
      {/each}
    </dsfr-table>
  {/if}
{/if}

<style lang="scss">
  :global(main) {
    background: white;
  }

  :global(#conteneur-admin-administrateurs) {
    text-align: left;
    background: #fff;
    width: 100%;
    padding: 32px 20px;
    overflow: auto;
  }

  h1 {
    font-size: 2.5rem;
    line-height: 3rem;
    margin: 0;
  }

  .conteneur-nom {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 0.875rem;
    line-height: 1.5rem;
  }

  .aucun-resultat {
    padding: 36px 0;
    display: flex;
    gap: 8px;
    align-items: center;
    flex-direction: column;
    color: #161616;

    h2 {
      margin: 0;
      font-size: 1.5rem;
      line-height: 2rem;
      font-weight: bold;
    }

    span {
      color: #3a3a3a;
      font-size: 1.125rem;
      line-height: 1.75rem;
      max-width: 588px;
      text-align: center;
    }

    img {
      max-width: 128px;
      transform: scaleX(-1);
    }

    dsfr-button {
      margin-top: 16px;
    }
  }
</style>
