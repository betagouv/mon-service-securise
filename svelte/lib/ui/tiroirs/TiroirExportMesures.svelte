<script lang="ts">
  import ContenuTiroir from './ContenuTiroir.svelte';
  import DocumentTelechargeable from './DocumentTelechargeable.svelte';

  interface Props {
    idService: string;
    avecReferentielsExternes: boolean;
  }

  let { idService, avecReferentielsExternes }: Props = $props();

  export const titre = 'Exporter la liste des mesures de sécurité';
  export const sousTitre = 'Obtenir la liste complète des mesures de sécurité.';
</script>

<ContenuTiroir>
  <DocumentTelechargeable
    type="CSV"
    nom="Liste sans données additionnelles renseignées"
    description="Cette liste ne contient ni statut ni commentaire ajoutés aux mesures."
    href="/service/{idService}/mesures/export.csv?timestamp={Date.now()}"
  />
  <DocumentTelechargeable
    type="CSV"
    nom="Liste avec données additionnelles renseignées"
    description="Cette liste contient les statuts et les commentaires ajoutés aux mesures."
    href="/service/{idService}/mesures/export.csv?avecDonneesAdditionnelles=true{avecReferentielsExternes
      ? '&avecReferentielsExternes=true'
      : ''}&timestamp={Date.now()}"
  />
</ContenuTiroir>
