<script lang="ts">
  import Modale from '../ui/Modale.svelte';
  import BadgeAdministrateur from '../adminEntites/LignesDuTableau/BadgeAdministrateur.svelte';
  import NombreServices from '../adminEntites/LignesDuTableau/NombreServices.svelte';
  import NombreUtilisateurs from '../adminEntites/LignesDuTableau/NombreUtilisateurs.svelte';
  import type {
    ServiceAdministre,
    UtilisateurAdministre,
  } from './adminUtilisateurs.types';
  import type { EntiteSupervisee } from '../adminEntites/adminEntites.types';
  import { onMount } from 'svelte';
  import { api } from './adminUtilisateurs.api';
  import { singulierPluriel } from '../outils/string';

  interface Props {
    utilisateur: UtilisateurAdministre | undefined;
    toutesEntites: Array<EntiteSupervisee>;
  }

  let { utilisateur, toutesEntites }: Props = $props();

  let tousServices: ServiceAdministre[] = $state([]);

  let elementModale: Modale | undefined;

  onMount(async () => {
    tousServices = await api.tousServices();
  });

  let entitesDeUtilisateur = $derived.by(() => {
    if (!utilisateur || !toutesEntites || toutesEntites.length === 0) {
      return [];
    }
    const entitesOuEstAdmin = toutesEntites
      .filter((e) =>
        e.administrateurs.map((a) => a.id).includes(utilisateur.id)
      )
      .map((e) => e.siret);

    const entitesOuPossedeService =
      utilisateur.autorisations
        .map((a) => tousServices.find((s) => a.idService === s.id))
        .filter((s) => !!s)
        .map((s) =>
          toutesEntites.find((e) => e.siret === s.siretOrganisationResponsable)
        )
        .filter((e) => !!e)
        .map((e) => e.siret) || [];

    const tousSiretsDeUtilisateur = new Set([
      ...entitesOuEstAdmin,
      ...entitesOuPossedeService,
    ]);

    return toutesEntites.filter((e) => tousSiretsDeUtilisateur.has(e.siret));
  });

  export const affiche = () => {
    elementModale?.affiche();
  };
</script>

<Modale id="modale-entites-utilisateur-administre" bind:this={elementModale}>
  {#snippet contenu()}
    <h4>
      <lab-anssi-icone nom="community-line" taille="md"></lab-anssi-icone>
      Entités associées
    </h4>
    <dsfr-callout
      title="{entitesDeUtilisateur.length} {singulierPluriel(
        'entité est associée',
        'entités sont associées',
        entitesDeUtilisateur.length
      )} à {utilisateur?.prenomNom}"
    ></dsfr-callout>
    <dsfr-table
      columns={[
        { key: 'nom', label: 'Entité' },
        { key: 'admins', label: 'Admin(s)' },
        { key: 'nombreServices', label: 'Nombre de services' },
        { key: 'nombreUtilisateurs', label: "Nombre d'utilisateurs" },
      ]}
      rows={entitesDeUtilisateur}
      rich
      multiline
    >
      {#each entitesDeUtilisateur as entite, i (entite.siret)}
        <div slot="cell:nom:{i}">
          <span><b>{entite.nom}</b></span>
        </div>
        <div slot="cell:admins:{i}" class="conteneur-admins">
          {#each entite.administrateurs as { prenomNom }, j (j)}
            <BadgeAdministrateur {prenomNom} />
          {/each}
        </div>
        <div slot="cell:nombreServices:{i}">
          <NombreServices nombreServices={entite.nombreServices} />
        </div>
        <div slot="cell:nombreUtilisateurs:{i}">
          <NombreUtilisateurs nombreUtilisateurs={entite.nombreUtilisateurs} />
        </div>
      {/each}
    </dsfr-table>
  {/snippet}
  {#snippet actions()}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Fermer"
      kind="primary"
      size="md"
      onclick={() => elementModale?.ferme()}
    ></dsfr-button>
  {/snippet}
</Modale>

<style lang="scss">
  h4 {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 2rem;
    margin: 0 0 16px;
    padding: 0;
  }

  .conteneur-admins {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
</style>
