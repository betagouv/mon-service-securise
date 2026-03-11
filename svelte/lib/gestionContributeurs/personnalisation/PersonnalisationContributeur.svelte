<script lang="ts">
  import { store } from '../gestionContributeurs.store';
  import PersonnalisationDroits from './PersonnalisationDroits.svelte';
  import { storeAutorisations } from '../stores/autorisations.store';
  import { derived } from 'svelte/store';

  let contributeur = derived(
    store,
    ($s) => $s.utilisateurEnCoursDePersonnalisation!
  );
  let originaux = derived([contributeur, storeAutorisations], ([$c, $s]) => {
    if ($c) return $s.autorisations[$c.id];
  });

  const envoyerDroits = async (droits: unknown) => {
    if (!$originaux) return;

    const idService = $store.services[0].id;
    const idAutorisation = $originaux.idAutorisation;
    const { data: nouvelleAutorisation } = await axios.patch(
      `/api/service/${idService}/autorisations/${idAutorisation}`,
      { droits }
    );
    storeAutorisations.remplace(nouvelleAutorisation);
    store.navigation.afficheEtapeListe();
  };
</script>

{#if $contributeur && $originaux}
  <PersonnalisationDroits
    utilisateur={$contributeur}
    droitsOriginaux={$originaux.droits}
    onValider={(droits) => envoyerDroits(droits)}
    onAnnuler={() => store.navigation.afficheEtapeListe()}
  />
{/if}
