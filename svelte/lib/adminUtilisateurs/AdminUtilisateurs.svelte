<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from './adminUtilisateurs.api';
  import { api as apiEntites } from '../adminEntites/adminEntites.api';
  import Tuiles from './Tuiles.svelte';
  import type { EntiteSupervisee } from '../adminEntites/adminEntites.types';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirGestionUtilisateurAdministre from './TiroirGestionUtilisateurAdministre/TiroirGestionUtilisateurAdministre.svelte';
  import BadgeAdmin from './BadgeAdmin.svelte';
  import TiroirNommerAdmin from './TiroirNommerAdmin/TiroirNommerAdmin.svelte';
  import type { UtilisateurAdministre } from './adminUtilisateurs.types';
  import Toaster from '../ui/Toaster.svelte';
  import BoutonAjouterPremierService from '../ui/BoutonAjouterPremierService.svelte';
  import ChampRecherche from '../ui/ChampRecherche.svelte';
  import { chaineNormalisee } from '../outils/string';
  import AucunResultatRecherche from '../ui/AucunResultatRecherche.svelte';

  let mesUtilisateurs: UtilisateurAdministre[] = $state([]);
  let mesEntites: Array<EntiteSupervisee> = $state([]);
  let recherche = $state('');

  onMount(async () => {
    await rafraichis();
  });

  const rafraichis = async () => {
    mesUtilisateurs = await api.utilisateursDansMonPerimetre();
    mesEntites = await apiEntites.entitesDansMonPerimetre();
  };

  const unAdminExisteAutreQueUtilisateurCourant = $derived(
    mesEntites.some((e) =>
      e.administrateurs.some((a) => !a.estUtilisateurCourant)
    )
  );

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

<Toaster />

<h1>Utilisateurs</h1>

<Tuiles nombreUtilisateurs={mesUtilisateurs.length} {mesEntites} />

{#if mesUtilisateurs.length === 0}
  <div class="aucun-resultat">
    <img src="/statique/assets/images/illustration_recherche_vide.svg" alt="" />
    {#if unAdminExisteAutreQueUtilisateurCourant}
      <h4>Aucun service ou contributeur sur vos entités</h4>
      <span
        >Ajoutez des services sur vos entités et invitez des contributeurs.</span
      >
      <span class="conteneur-action">
        <BoutonAjouterPremierService />
      </span>
    {:else}
      <h4>Aucun admin sur vos entités</h4>
      <span
        >Ajoutez des admins pour déléguer la gestion et le suivi de vos entités.</span
      >
      <span class="conteneur-action">
        <dsfr-button
          size="md"
          kind="primary"
          markup="a"
          href="/admin/entites"
          label="Ajouter des admins à mes entités"
        ></dsfr-button>
      </span>
    {/if}
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
          {#if utilisateur.estAdmin}
            <BadgeAdmin />
          {/if}
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
              {utilisateur.nombreEntites} entité{utilisateur.nombreEntites > 1
                ? 's'
                : ''}
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
            label="Gérer les accès aux services"
            size="sm"
            onclick={() => {
              tiroirStore.afficheContenu(TiroirGestionUtilisateurAdministre, {
                utilisateur,
                toutesEntites: mesEntites,
              });
            }}
          ></dsfr-button>
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
          <dsfr-button
            kind="tertiary"
            label={utilisateur.estAdmin
              ? 'Gérer le droit admin'
              : "Nommer en tant qu'admin"}
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

  :global(#conteneur-admin-utilisateurs) {
    text-align: left;
    background: #fff;
    width: 100%;
    padding: 32px 48px;
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
    max-width: 588px;
    margin: 0 auto;

    h4 {
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

    .conteneur-action {
      margin-top: 16px;
    }
  }
</style>
