import VisiteGuidee from './VisiteGuidee.svelte';
import type { VisiteGuideeProps } from './visiteGuidee.d';
import { utilisateurCourant, visiteGuidee } from './visiteGuidee.store';
import MenuNavigationVisiteGuidee from './kit/MenuNavigationVisiteGuidee.svelte';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-visite-guidee',
  async (e: CustomEvent<VisiteGuideeProps>) => await rechargeApp(e.detail)
);

let appMenuNavigation: ReturnType<typeof mount>;
let app: ReturnType<typeof mount>;
const rechargeApp = async (props: VisiteGuideeProps) => {
  if (appMenuNavigation) await unmount(appMenuNavigation);

  appMenuNavigation = mount(MenuNavigationVisiteGuidee, {
    target: document.getElementById('visite-guidee-menu-navigation')!,
    props: {
      nombreEtapesRestantes: props.nombreEtapesRestantes,
      etapeCourante: props.etapeCourante,
      etapesVues: props.etapesVues,
      enPause: props.enPause,
    },
  });

  if (!props.enPause) {
    if (app) await unmount(app);

    const { etapeCourante, urlEtapePrecedente } = props;
    visiteGuidee.initialise({ etapeCourante, urlEtapePrecedente });
    utilisateurCourant.initialise(props.utilisateurCourant);
    app = mount(VisiteGuidee, {
      target: document.getElementById('visite-guidee')!,
    });
  }
};

export default app!;
