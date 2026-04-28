<script lang="ts">
  import { couleursStatutHomologation } from '../../ui/couleursStatutHomologation';

  interface Props {
    statutHomologation: string;
    label: string;
    idService: string;
    dateExpiration?: string;
  }

  let {
    statutHomologation,
    label,
    idService,
    dateExpiration = '',
  }: Props = $props();

  const tabActive = $derived.by(() => {
    if (statutHomologation === 'refusee') return 'refusees';
    if (statutHomologation === 'nonRealisee') return 'courant';
    return 'actif';
  });
</script>

<dsfr-tag
  label="{label} {statutHomologation === 'bientotExpiree'
    ? dateExpiration
    : statutHomologation === 'refusee'
      ? `le ${dateExpiration}`
      : ''}"
  type="clickable"
  accent={couleursStatutHomologation[statutHomologation]}
  size="sm"
  href="/service/{idService}/dossiers?tab={tabActive}"
></dsfr-tag>

<style>
  dsfr-tag {
    white-space: nowrap;
  }
</style>
