<script lang="ts">
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';
  import KitDeTeleversement from '../../ui/televersement/KitDeTeleversement.svelte';
  import { FormatAccepte } from '../../ui/televersement/KitDeTeleversement.types';

  export const titre: string = 'Téléverser des mesures';
  export const sousTitre: string =
    'Importez votre liste de mesures, associez-les aux services de votre choix, puis ajustez leur statut ou leur précision simultanément.';
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
      console.log(e);
    }}
  />
</ContenuTiroir>
<ActionsTiroir>
  <h4>Sauvegarder</h4>
</ActionsTiroir>
