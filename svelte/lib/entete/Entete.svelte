<script lang="ts">
  import { onMount } from 'svelte';
  import { getUtilisateurCourant, type ProfilUtilisateur } from './entete.api';

  let connecte: ProfilUtilisateur | null | undefined = $state();

  onMount(async () => {
    connecte = await getUtilisateurCourant();
  });
</script>

{#if !connecte}
  <dsfr-button
    label="S'inscrire"
    kind="tertiary-no-outline"
    size="sm"
    markup="a"
    type="button"
    href="/inscription"
    target="_self"
    data-themeable="false"
  ></dsfr-button>
  <dsfr-button
    label="Se connecter"
    kind="tertiary-no-outline"
    size="sm"
    markup="a"
    type="button"
    href="/connexion"
    target="_self"
    data-themeable="false"
    has-icon
    icon-place="left"
    icon="account-circle-fill"
  ></dsfr-button>
{:else}
  <dsfr-dropdown
    id="menu-utilisateur-courant"
    collapse-id="menu-utilisateur-courant-collapse"
    button-title={connecte.utilisateur.prenomNom}
    button-kind="tertiary-no-outline"
    button-size="sm"
    button-icon="user-fill"
    content-type="links"
    align="left"
    data-themeable="false"
    items={[
      { label: 'Mon tableau de bord', href: '/tableauDeBord' },
      { label: 'Mettre à jour mon profil', href: '/profil' },
    ]}
  >
  </dsfr-dropdown>

  <dsfr-button
    label="Se déconnecter"
    kind="tertiary-no-outline"
    size="sm"
    icon="logout-box-r-line"
    icon-place="left"
    markup="a"
    type="button"
    href="/deconnexion"
    target="_self"
    has-icon
    data-themeable="false"
  ></dsfr-button>
{/if}
