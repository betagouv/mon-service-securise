<script lang="ts">
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';
  import KitDeTeleversement from '../../ui/televersement/KitDeTeleversement.svelte';
  import {
    type EtatTeleversement,
    FormatAccepte,
  } from '../../ui/televersement/KitDeTeleversement.types';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import { ajouteParametreAUrl } from '../../outils/url';
  import type { CapaciteAjoutDeMesure } from '../listeMesures.d';
  import { modelesMesureSpecifique } from '../../ui/stores/modelesMesureSpecifique.store';
  import { singulierPluriel } from '../../outils/string';

  export const titre: string = 'Téléverser des mesures';
  export const sousTitre: string =
    'Importez votre liste de mesures, associez-les aux services de votre choix, puis ajustez leur statut ou leur précision simultanément.';
  interface Props {
    capaciteAjoutDeMesure: CapaciteAjoutDeMesure;
  }

  let { capaciteAjoutDeMesure }: Props = $props();

  let nombreRestantModelesAjoutables = $derived(
    capaciteAjoutDeMesure.nombreMaximum - $modelesMesureSpecifique.length
  );

  let etatTeleversement: EtatTeleversement = $state('EnAttente');

  const afficheRapportDuTeleversement = async () => {
    if (etatTeleversement !== 'Valide') return;

    document.body.dispatchEvent(
      new CustomEvent(
        'svelte-recharge-rapport-televersement-modeles-mesure-specifique',
        { detail: { capaciteAjoutDeMesure } }
      )
    );
    ajouteParametreAUrl('rapportTeleversement', 'true');
    tiroirStore.ferme();
  };
</script>

<ContenuTiroir>
  <KitDeTeleversement
    etape1="Téléchargez et complétez le template de vos mesures"
    template={{
      href: '/statique/assets/fichiers/Template mesures - MSS.xlsx',
      nom: 'Template mesures - MSS.xlsx',
      titre: 'Template de mesures à télécharger',
      sousTitre: 'XLSX - 56 kB',
    }}
    lesLimitations={[
      'Taille maximale : 1 Mo. Format supporté : XLSX.',
      `Vous pouvez ajouter jusqu'à ${singulierPluriel(
        '1 mesure supplémentaire',
        `${nombreRestantModelesAjoutables} mesures supplémentaires`,
        nombreRestantModelesAjoutables
      )}.`,
    ]}
    apiPostDuTeleversement="/api/televersement/modelesMesureSpecifique"
    formatAccepte={FormatAccepte.Excel}
    on:televersementChange={(e) => {
      etatTeleversement = e.detail;
    }}
  />
</ContenuTiroir>
<ActionsTiroir>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <lab-anssi-bouton
    titre="Annuler"
    variante="tertiaire-sans-bordure"
    taille="md"
    positionIcone="sans"
    actif={etatTeleversement !== 'EnCoursEnvoi'}
    onclick={() => {
      if (etatTeleversement !== 'EnCoursEnvoi') tiroirStore.ferme();
    }}
  ></lab-anssi-bouton>

  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <lab-anssi-bouton
    titre="Valider le fichier"
    variante="primaire"
    taille="md"
    icone="check-line"
    positionIcone="gauche"
    actif={etatTeleversement === 'Valide'}
    onclick={afficheRapportDuTeleversement}
  ></lab-anssi-bouton>
</ActionsTiroir>
