<script lang="ts">
  import { store } from '../gestionContributeurs.store';
  import PersonnalisationDroits from './PersonnalisationDroits.svelte';

  $: contributeur = $store.utilisateurEnCoursDePersonnalisation!;
  $: originaux = $store.autorisations[contributeur.id];

  const envoyerDroits = async (droits: any) => {
    const idService = $store.services[0].id;
    const idAutorisation = originaux.idAutorisation;
    const { data: nouvelleAutorisation } = await axios.patch(
      `/api/service/${idService}/autorisations/${idAutorisation}`,
      { droits }
    );
    store.autorisations.remplace(nouvelleAutorisation);
    store.navigation.afficheEtapeListe();
  };
</script>

<PersonnalisationDroits
  utilisateur={contributeur}
  droitsOriginaux={originaux.droits}
  on:valider={({ detail: nouveauxDroits }) => envoyerDroits(nouveauxDroits)}
  on:annuler={() => {
    store.autorisations.remplace(originaux);
    store.navigation.afficheEtapeListe();
  }}
/>
