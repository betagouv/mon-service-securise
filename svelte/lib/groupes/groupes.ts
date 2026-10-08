import Groupes from './Groupes.svelte';
import type { GroupesProps } from './groupes.d';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-groupes',
  async (e: CustomEvent<GroupesProps>) => await rechargeApp({ ...e.detail })
);

let app: ReturnType<typeof mount>;
const rechargeApp = async (props: GroupesProps) => {
  if (app) await unmount(app);

  app = mount(Groupes, {
    target: document.getElementById('conteneur-groupes')!,
    props,
  });
};

export default app!;
