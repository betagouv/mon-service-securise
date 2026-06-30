<script lang="ts">
  import { routeurStore } from '../store/routeur.store';
  import type { EtapeService } from '../../menuNavigationService/menuNavigationService.d';
  import { pageCourante } from '../store/pageCourante.store';
  import { VersionService } from '../../../../src/modeles/versionService';

  interface Props {
    idService: string;
    visible: Record<EtapeService, boolean>;
    avecRisquesV2: boolean;
    versionService: VersionService | undefined;
  }

  let { idService, visible, avecRisquesV2, versionService }: Props = $props();

  const configurationNav = $derived.by(() => {
    const navVisibles = [];
    if (visible.mesures)
      navVisibles.push({
        label: 'Mesures de sécurité',
        href: `/service/${idService}/mesures`,
        current: $pageCourante === 'mesures',
      });
    if (visible.risques)
      navVisibles.push({
        label: 'Risques de sécurité',
        href: `/service/${idService}/risques`,
        current: $pageCourante === 'risques',
      });
    if (visible.indiceCyber)
      navVisibles.push({
        label: 'Indice Cyber',
        href: `/service/${idService}/indiceCyber`,
        current: $pageCourante === 'indiceCyber',
      });

    return navVisibles;
  });

  const indexRisques = $derived(
    configurationNav.findIndex((c) => c.label === 'Risques de sécurité')
  );

  type TabnavLink = { href: string };
  const gereClicNavigation = (e: CustomEvent<{ link: TabnavLink }>) => {
    routeurStore.navigue(e.detail.link.href);
  };
</script>

<dsfr-tabnav
  links={configurationNav}
  aria-label="Navigation dans Sécuriser"
  onlinkclicked={gereClicNavigation}
  routerMode
>
  {#if indexRisques > 0}
    <div slot="link-{indexRisques + 1}" class="titre-risques">
      <span>Risques de sécurité</span>
      {#if avecRisquesV2 && versionService === VersionService.v2}
        <dsfr-badge label="BÊTA" type="accent" accent="blue-cumulus" size="sm"
        ></dsfr-badge>
      {/if}
    </div>
  {/if}
</dsfr-tabnav>

<style lang="scss">
  dsfr-tabnav {
    margin-top: -2rem;
  }

  .titre-risques {
    display: flex;
    gap: 8px;
  }
</style>
