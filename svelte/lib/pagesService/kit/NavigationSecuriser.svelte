<script lang="ts">
  import { routeurStore } from '../store/routeur.store';
  import type { EtapeService } from '../../menuNavigationService/menuNavigationService.d';
  import { pageCourante } from '../store/pageCourante.store';

  interface Props {
    idService: string;
    visible: Record<EtapeService, boolean>;
  }

  let { idService, visible }: Props = $props();

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
></dsfr-tabnav>

<style lang="scss">
  dsfr-tabnav {
    margin-top: -2rem;
  }
</style>
