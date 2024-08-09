<script lang="ts">
  import { store } from '../gestionContributeurs.store';
  import PersonnalisationDroits from './PersonnalisationDroits.svelte';
  import { storeAutorisations } from '../stores/autorisations.store';
  import type { Autorisation, Utilisateur } from '../gestionContributeurs.d';

  let contributeur: Utilisateur;
  let originaux: Autorisation;

  $: {
    contributeur = $store.utilisateurEnCoursDePersonnalisation!;
    if (contributeur)
      originaux = $storeAutorisations.autorisations[contributeur.id];
  }

  const envoyerDroits = async (droits: any) => {
    const idService = $store.services[0].id;
    const idAutorisation = originaux.idAutorisation;
    const { data: nouvelleAutorisation } = await axios.patch(
      `/api/service/${idService}/autorisations/${idAutorisation}`,
      { droits }
    );
    storeAutorisations.remplace(nouvelleAutorisation);
    store.navigation.afficheEtapeListe();
  };
</script>

<PersonnalisationDroits
  utilisateur={contributeur}
  droitsOriginaux={originaux.droits}
  on:valider={({ detail: nouveauxDroits }) => envoyerDroits(nouveauxDroits)}
  on:annuler={() => store.navigation.afficheEtapeListe()}
/>
