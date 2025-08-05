<script lang="ts">
  import ContenuTiroir from '../../../ui/tiroirs/ContenuTiroir.svelte';
  import ActionsTiroir from '../../../ui/tiroirs/ActionsTiroir.svelte';
  import { tiroirStore } from '../../../ui/stores/tiroir.store';
  import Onglets from '../../../ui/Onglets.svelte';
  import { ajouteModeleMesureSpecifique } from '../../listeMesures.api';
  import { modelesMesureSpecifique } from '../modelesMesureSpecifique.store';
  import { toasterStore } from '../../../ui/stores/toaster.store';
  import type { ListeMesuresProps } from '../../listeMesures.d';
  import InformationsModeleMesureSpecifique from '../InformationsModeleMesureSpecifique.svelte';
  import TiroirConfigurationModeleMesureSpecifique from '../configuration/TiroirConfigurationModeleMesureSpecifique.svelte';
  import type {
    ReferentielStatut,
    ReferentielTypesService,
  } from '../../../ui/types';

  export let statuts: ReferentielStatut;
  export let referentielTypesService: ReferentielTypesService;
  export let categories: ListeMesuresProps['categories'];
  export const titre: string = 'Ajouter une mesure';
  export const sousTitre: string =
    'Ajoutez une mesure, associez-la aux services de votre choix et ajustez le statut ou la précision sur plusieurs services simultanément.';
  export const taille = 'large';

  let donneesModeleMesureAjoute = {
    description: '',
    descriptionLongue: '',
    categorie: '',
  };
  let enCoursDenvoi = false;

  $: formulaireValide =
    !!donneesModeleMesureAjoute.description &&
    !!donneesModeleMesureAjoute.categorie;

  const ajouteModele = async () => {
    enCoursDenvoi = true;
    try {
      const idModele = await ajouteModeleMesureSpecifique(
        donneesModeleMesureAjoute
      );
      await modelesMesureSpecifique.rafraichis();
      tiroirStore.afficheContenu(TiroirConfigurationModeleMesureSpecifique, {
        categories,
        statuts,
        modeleMesure: $modelesMesureSpecifique.find((m) => m.id === idModele)!,
        referentielTypesService,
        ongletActif: 'servicesAssocies',
      });
      toasterStore.succes('Succès', 'La mesure a été créée');
    } catch (e) {
      toasterStore.erreur(
        'Une erreur est survenue',
        "Veuillez réessayer. Si l'erreur persiste, merci de contacter le support."
      );
    } finally {
      enCoursDenvoi = false;
    }
  };
</script>

<ContenuTiroir>
  <Onglets
    onglets={[{ id: 'info', label: 'Informations' }]}
    ongletActif="info"
  />
  <InformationsModeleMesureSpecifique
    {categories}
    bind:donneesModeleMesure={donneesModeleMesureAjoute}
  />
</ContenuTiroir>
<ActionsTiroir>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <lab-anssi-bouton
    variante="tertiaire-sans-bordure"
    taille="md"
    titre="Annuler"
    on:click={() => tiroirStore.ferme()}
  />
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <lab-anssi-bouton
    variante="primaire"
    taille="md"
    titre="Ajouter cette mesure"
    icone="add-line"
    position-icone="gauche"
    on:click={async () => await ajouteModele()}
    actif={formulaireValide && !enCoursDenvoi}
  />
</ActionsTiroir>
