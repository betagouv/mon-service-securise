<script lang="ts">
  interface Props {
    type: 'PDF' | 'ZIP' | 'CSV' | 'PPTX';
    nom: string;
    description: string;
    cheminDocument?: string;
    idService?: string;
    href?: string;
  }

  let { type, nom, description, cheminDocument, idService, href }: Props =
    $props();

  let lien = $derived(
    href ??
      `/api/service/${idService}/pdf/${cheminDocument}?timestamp=${Date.now()}`
  );
</script>

<dsfr-card
  title={nom}
  has-description
  {description}
  download
  href={lien}
  has-detail-end
  detail-end={type}
  enlarge
  size="sm"
  blank
></dsfr-card>
