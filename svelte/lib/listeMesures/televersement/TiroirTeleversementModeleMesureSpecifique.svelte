<script lang="ts">
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';
  import KitDeTeleversement from '../../ui/televersement/KitDeTeleversement.svelte';
  import {
    type EtatTeleversement,
    FormatAccepte,
  } from '../../ui/televersement/KitDeTeleversement.types';
  import { tiroirStore } from '../../ui/stores/tiroir.store';

  export const titre: string = 'Téléverser des mesures';
  export const sousTitre: string =
    'Importez votre liste de mesures, associez-les aux services de votre choix, puis ajustez leur statut ou leur précision simultanément.';

  let etatTeleversement: EtatTeleversement = 'EnAttente';

  const afficheRapportDuTeleversement = async () => {
    if (etatTeleversement !== 'Valide') return;

    console.log('📋 Vers le rapport de téléversement… ');
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
    lesLimitations={['Taille maximale : 1 Mo. Format supporté : XLSX.']}
    apiPostDuTeleversement="/api/televersement/modelesMesureSpecifique"
    formatAccepte={FormatAccepte.Excel}
    on:televersementChange={(e) => {
      etatTeleversement = e.detail;
    }}
  />
</ContenuTiroir>
<ActionsTiroir>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <lab-anssi-bouton
    titre="Annuler"
    variante="tertiaire-sans-bordure"
    taille="md"
    positionIcone="sans"
    actif={etatTeleversement !== 'EnCoursEnvoi'}
    on:click={() => {
      if (etatTeleversement !== 'EnCoursEnvoi') tiroirStore.ferme();
    }}
  />

  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <lab-anssi-bouton
    titre="Valider le fichier"
    variante="primaire"
    taille="md"
    icone="check-line"
    positionIcone="gauche"
    actif={etatTeleversement === 'Valide'}
    on:click={afficheRapportDuTeleversement}
  />
</ActionsTiroir>
