import GestionContributeurs from './GestionContributeurs.svelte';
import type {
  GestionContributeursProps,
  Service,
} from './gestionContributeurs.d';
import { store } from './gestionContributeurs.store';
import { donneesServiceVisiteGuidee } from './modeVisiteGuidee/donneesVisiteGuidee';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-contributeurs',
  async (e: CustomEvent<GestionContributeursProps>) =>
    await rechargeApp({ ...e.detail })
);

let app: GestionContributeurs;

const reinitialiseStore = (services: Service[]) => {
  store.reinitialise(services);
};

const rechargeApp = async (props: GestionContributeursProps) => {
  if (app) await unmount(app);

  const { modeVisiteGuidee, services } = props;
  reinitialiseStore(modeVisiteGuidee ? [donneesServiceVisiteGuidee] : services);
  app = mount(GestionContributeurs, {
    target: document.getElementById('conteneur-gestion-contributeurs')!,
    props: { modeVisiteGuidee },
  });
};

export default app!;
