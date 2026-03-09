<script lang="ts">
  import ContenuTiroir from '../../../ui/tiroirs/ContenuTiroir.svelte';
  import ActionsTiroir from '../../../ui/tiroirs/ActionsTiroir.svelte';
  import { tiroirStore } from '../../../ui/stores/tiroir.store';
  import Onglets from '../../../ui/Onglets.svelte';
  import { ajouteModeleMesureSpecifique } from '../../listeMesures.api';
  import { modelesMesureSpecifique } from '../../../ui/stores/modelesMesureSpecifique.store';
  import { toasterStore } from '../../../ui/stores/toaster.store';
  import type { ListeMesuresProps } from '../../listeMesures.d';
  import InformationsModeleMesureSpecifique from '../InformationsModeleMesureSpecifique.svelte';
  import TiroirConfigurationModeleMesureSpecifique from '../configuration/TiroirConfigurationModeleMesureSpecifique.svelte';
  import type {
    ReferentielStatut,
    ReferentielTypesService,
  } from '../../../ui/types';
  import { servicesAvecMesuresAssociees } from '../../servicesAssocies/servicesAvecMesuresAssociees.store';

  interface Props {
    statuts: ReferentielStatut;
    referentielTypesService: ReferentielTypesService;
    categories: ListeMesuresProps['categories'];
  }

  let { statuts, referentielTypesService, categories }: Props = $props();
  export const titre: string = 'Ajouter une mesure';
  export const sousTitre: string =
    'Ajoutez une mesure, associez-la aux services de votre choix et ajustez le statut ou la précision sur plusieurs services simultanément.';
  export const taille = 'large';

  let donneesModeleMesureAjoute = $state({
    description: '',
    descriptionLongue: '',
    categorie: '',
  });
  let enCoursDenvoi = $state(false);

  let formulaireValide = $derived(
    !!donneesModeleMesureAjoute.description &&
      !!donneesModeleMesureAjoute.categorie
  );

  const ajouteModele = async () => {
    enCoursDenvoi = true;
    try {
      const idModele = await ajouteModeleMesureSpecifique(
        donneesModeleMesureAjoute
      );
      await modelesMesureSpecifique.rafraichis();
      await servicesAvecMesuresAssociees.rafraichis();
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
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <lab-anssi-bouton
    variante="tertiaire-sans-bordure"
    taille="md"
    titre="Annuler"
    onclick={() => tiroirStore.ferme()}
  ></lab-anssi-bouton>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <lab-anssi-bouton
    variante="primaire"
    taille="md"
    titre="Ajouter cette mesure"
    icone="add-line"
    position-icone="gauche"
    onclick={async () => await ajouteModele()}
    actif={formulaireValide && !enCoursDenvoi}
  ></lab-anssi-bouton>
</ActionsTiroir>
