import VisiteGuidee from './VisiteGuidee.svelte';
import type { VisiteGuideeProps } from './visiteGuidee.d';
import { utilisateurCourant, visiteGuidee } from './visiteGuidee.store';
import MenuNavigation from './kit/MenuNavigation.svelte';

document.body.addEventListener(
  'svelte-recharge-visite-guidee',
  (e: CustomEvent<VisiteGuideeProps>) => rechargeApp(e.detail)
);

let appMenuNavigation: MenuNavigation;
let app: VisiteGuidee;
const rechargeApp = (props: VisiteGuideeProps) => {
  appMenuNavigation?.$destroy();
  appMenuNavigation = new MenuNavigation({
    target: document.getElementById('visite-guidee-menu-navigation')!,
    props: {
      nombreEtapesRestantes: props.nombreEtapesRestantes,
      etapeCourante: props.etapeCourante,
      etapesVues: props.etapesVues,
      enPause: props.enPause,
    },
  });

  if (!props.enPause) {
    app?.$destroy();
    visiteGuidee.initialise(props.etapeCourante);
    utilisateurCourant.initialise(props.utilisateurCourant);
    app = new VisiteGuidee({
      target: document.getElementById('visite-guidee')!,
    });
  }
};

export default app!;
