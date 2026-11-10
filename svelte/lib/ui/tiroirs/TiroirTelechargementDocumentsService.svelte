<script module lang="ts">
  export type DonneesServicePourTelechargementDocuments = {
    id: string;
    documentsPdfDisponibles: string[];
    supportCommissionPptxDisponible?: boolean;
  };
</script>

<script lang="ts">
  import ContenuTiroir from './ContenuTiroir.svelte';
  import DocumentTelechargeable from './DocumentTelechargeable.svelte';

  interface Props {
    service: DonneesServicePourTelechargementDocuments;
  }

  let { service }: Props = $props();

  export const titre = 'Télécharger les documents';
  export const sousTitre =
    "Obtenir les documents utiles à la sécurisation et à l'homologation du service sélectionné.";

  let idService = $derived(service.id);
  let nbPdfDisponibles = $derived(service.documentsPdfDisponibles.length);

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
    />
  {/if}
  {#if documentDisponible('annexes')}
    <DocumentTelechargeable
      {idService}
      type="PDF"
      nom="Annexes"
      description="Ce PDF détaille toutes les informations renseignées sur la sécurité du service."
      cheminDocument="annexes.pdf"
    />
  {/if}
  {#if documentDisponible('dossierDecision')}
    <DocumentTelechargeable
      {idService}
      type="PDF"
      nom="Décision d'homologation de sécurité"
      description="Ce PDF est le document de décision pouvant être signé par l'autorité d'homologation."
      cheminDocument="dossierDecision.pdf"
    />
  {/if}
  {#if service.supportCommissionPptxDisponible}
    <DocumentTelechargeable
      type="PPTX"
      nom="Support de commission d'homologation"
      description="Ce support réunit les éléments utiles à la commission pour décider de l'homologation du service : risques, indice cyber, mesures restantes et avis des membres."
      href="/api/service/{idService}/pptx/supportCommissionHomologation.pptx?timestamp={Date.now()}"
    />
  {/if}
  {#if documentDisponible('archive')}
    <DocumentTelechargeable
      {idService}
      type="ZIP"
      nom="Tous les documents"
      description="Ce fichier .ZIP contient les {nbPdfDisponibles} PDF."
      cheminDocument="documentsHomologation.zip"
    />
  {/if}
</ContenuTiroir>
