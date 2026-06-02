<script lang="ts">
  import { untrack } from 'svelte';
  import type { UtilisateurAdministre } from '../adminUtilisateurs.api';
  import type { EntiteSupervisee } from '../../adminEntites/adminEntites.types';
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';

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

  let etape: 'SELECTION' | 'RECAPITULATIF' = $state('SELECTION');
</script>

<ContenuTiroir>
  <dsfr-stepper
    title={etape === 'SELECTION' ? 'Sélection des entités' : 'Récapitulatif'}
    nextStep={etape === 'SELECTION' ? 'Récapitulatif' : undefined}
    currentStep={etape === 'SELECTION' ? 1 : 2}
    stepCount={2}
  ></dsfr-stepper>

  <pre>{JSON.stringify(utilisateur, null, 2)}</pre>

  <pre>{JSON.stringify(toutesEntites, null, 2)}</pre>
</ContenuTiroir>

<style lang="scss">
  h1 {
    text-align: center;
  }
</style>
