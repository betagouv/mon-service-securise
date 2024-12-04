<script lang="ts">
  import type { Service } from '../../tableauDeBord/tableauDeBord.d';
  import ContenuTiroir from './ContenuTiroir.svelte';
  import DocumentTelechargeable from './DocumentTelechargeable.svelte';

  // eslint-disable-next-line svelte/valid-compile
  export let service: Service;

  let nbPdfDisponibles = 0;
</script>

<ContenuTiroir>
  <DocumentTelechargeable
    type="PDF"
    nom="Synthèse de la sécurité du service"
    description="Ce PDF résume en 1 page l'état de la sécurité du service."
    lien="lien-synthese"
  />
  <DocumentTelechargeable
    type="PDF"
    nom="Annexes"
    description="Ce PDF détaille toutes les informations renseignées sur la sécurité du service."
    lien="lien-annexes"
  />
  <DocumentTelechargeable
    type="PDF"
    nom="Décision d'homologation de sécurité"
    description="Ce PDF est le document de décision pouvant être signé par l'autorité d'homologation."
    lien="lien-decision"
  />
  <DocumentTelechargeable
    type="ZIP"
    nom="Tous les documents"
    description="Ce fichier .ZIP contient les {nbPdfDisponibles} PDF."
    lien="lien-archive"
  />
</ContenuTiroir>
