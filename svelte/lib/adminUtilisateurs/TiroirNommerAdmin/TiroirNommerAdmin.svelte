<script lang="ts">
  import { untrack } from 'svelte';
  import type { UtilisateurAdministre } from '../adminUtilisateurs.api';
  import type { EntiteSupervisee } from '../../adminEntites/adminEntites.types';

  interface Props {
    utilisateur: UtilisateurAdministre;
    toutesEntites: Array<EntiteSupervisee>;
  }

  let { utilisateur, toutesEntites }: Props = $props();

  export const titre: string = untrack(() =>
    utilisateur.estAdmin
      ? `Gérer le droit admin de ${utilisateur.prenomNom}`
      : `Nommer ${utilisateur.prenomNom} en tant qu'admin`
  );

  export const sousTitre: string = untrack(() =>
    utilisateur.estAdmin
      ? `Cochez les entités sur lesquelles ${utilisateur.prenomNom} doit être Admin. Décochez celles à retirer.`
      : `Sélectionnez les entités de votre périmètre que vous souhaitez déléguer. ${utilisateur.prenomNom} deviendra Admin de tous les services rattachés à ces entités.`
  );

  export const taille = 'large';
</script>

<pre>{JSON.stringify(utilisateur, null, 2)}</pre>

<pre>{JSON.stringify(toutesEntites, null, 2)}</pre>

<style lang="scss">
  h1 {
    text-align: center;
  }
</style>
