<script lang="ts">
  interface Props {
    detail: string;
    nom: string;
    description: string;
    cheminDocument?: string;
    idService?: string;
    href?: string;
    badge?: string;
    desactive?: boolean;
  }

  let {
    detail,
    nom,
    description,
    cheminDocument,
    idService,
    href,
    badge,
    desactive = false,
  }: Props = $props();

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
  detail-end={detail}
  enlarge
  size="sm"
  blank
  has-badge
  disabled={desactive}
>
  {#if badge}
    <dsfr-badge
      slot="badgesgroup"
      label={badge}
      type="accent"
      accent="blue-cumulus"
      size="sm"
    ></dsfr-badge>
  {/if}
</dsfr-card>
