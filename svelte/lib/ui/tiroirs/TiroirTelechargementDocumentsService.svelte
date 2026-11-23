<script module lang="ts">
  import type { VersionService } from '../../../../src/modeles/versionService';

  export type DonneesServicePourTelechargementDocuments = {
    id: string;
    documentsDisponibles: string[];
    version: VersionService | undefined;
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

  const documentDisponible = (document: string) =>
    document === 'archive'
      ? service.documentsDisponibles.length > 0
      : service.documentsDisponibles.includes(document);
</script>

<ContenuTiroir>
  {#if documentDisponible('syntheseSecurite')}
    <DocumentTelechargeable
      {idService}
      detail="PDF"
      nom="Synthèse de la sécurité du service"
      description="Ce PDF résume en 1 page l'état de la sécurité du service."
      cheminDocument="syntheseSecurite.pdf"
    />
  {/if}
  {#if service.version === 'v2'}
    <DocumentTelechargeable
      detail={documentDisponible('supportHomologation')
        ? 'PPTX'
        : "PPTX : disponible une fois le projet d'homologation renseigné"}
      nom="Support de commission d'homologation"
      description="Ce support réunit les éléments utiles à la commission pour décider de l'homologation du service : risques, indice cyber, mesures restantes et avis des membres."
      href="/api/service/{idService}/pptx/supportCommissionHomologation.pptx?timestamp={Date.now()}"
      badge="bêta"
      desactive={!documentDisponible('supportHomologation')}
    />
  {/if}
  {#if documentDisponible('annexes')}
    <DocumentTelechargeable
      {idService}
      detail="PDF"
      nom="Annexes"
      description="Ce PDF détaille toutes les informations renseignées sur la sécurité du service."
      cheminDocument="annexes.pdf"
    />
  {/if}
  {#if documentDisponible('dossierDecision')}
    <DocumentTelechargeable
      {idService}
      detail="PDF"
      nom="Décision d'homologation de sécurité"
      description="Ce PDF est le document de décision pouvant être signé par l'autorité d'homologation."
      cheminDocument="dossierDecision.pdf"
    />
  {/if}
  {#if documentDisponible('archive')}
    <DocumentTelechargeable
      {idService}
      detail="ZIP"
      nom="Tous les documents"
      description="Ce fichier .ZIP contient l’ensemble des documents ci-dessus."
      cheminDocument="documentsHomologation.zip"
    />
  {/if}
</ContenuTiroir>
