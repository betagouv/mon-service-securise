<script lang="ts">
  import type { Service } from '../../tableauDeBord/tableauDeBord.d';
  import ContenuTiroir from './ContenuTiroir.svelte';
  import DocumentTelechargeable from './DocumentTelechargeable.svelte';

  export let service: Service;
  export let modeVisiteGuidee: boolean = false;

  export const titre = 'Télécharger les PDF';
  export const sousTitre =
    "Obtenir les documents utiles à la sécurisation et à l'homologation du service sélectionné.";

  const idService = service.id;
  const nbPdfDisponibles = service.documentsPdfDisponibles.length;

  const documentDisponible = (document: string) =>
    document === 'archive'
      ? service.documentsPdfDisponibles.length > 0
      : service.documentsPdfDisponibles.includes(document);
</script>

<ContenuTiroir>
  {#if documentDisponible('syntheseSecurite')}
    <DocumentTelechargeable
      {idService}
      type="PDF"
      nom="Synthèse de la sécurité du service"
      description="Ce PDF résume en 1 page l'état de la sécurité du service."
      cheminDocument="syntheseSecurite.pdf"
      {modeVisiteGuidee}
    />
  {/if}
  {#if documentDisponible('annexes')}
    <DocumentTelechargeable
      {idService}
      type="PDF"
      nom="Annexes"
      description="Ce PDF détaille toutes les informations renseignées sur la sécurité du service."
      cheminDocument="annexes.pdf"
      {modeVisiteGuidee}
    />
  {/if}
  {#if documentDisponible('dossierDecision')}
    <DocumentTelechargeable
      {idService}
      type="PDF"
      nom="Décision d'homologation de sécurité"
      description="Ce PDF est le document de décision pouvant être signé par l'autorité d'homologation."
      cheminDocument="dossierDecision.pdf"
      {modeVisiteGuidee}
    />
  {/if}
  {#if documentDisponible('archive')}
    <DocumentTelechargeable
      {idService}
      type="ZIP"
      nom="Tous les documents"
      description="Ce fichier .ZIP contient les {nbPdfDisponibles} PDF."
      cheminDocument="documentsHomologation.zip"
      {modeVisiteGuidee}
    />
  {/if}
</ContenuTiroir>
