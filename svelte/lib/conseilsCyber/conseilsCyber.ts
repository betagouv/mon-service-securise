import { mount, unmount } from 'svelte';
import ConseilsCyber from './ConseilsCyber.svelte';
import type { ConseilsCyberProps } from './conseilsCyber.types';

document.body.addEventListener(
  'svelte-recharge-conseils-cyber',
  async (e: CustomEvent<ConseilsCyberProps>) =>
    await rechargeApp({ ...e.detail })
);

let app: ConseilsCyber;
const rechargeApp = async (props: ConseilsCyberProps) => {
  if (app) await unmount(app);

  app = mount(ConseilsCyber, {
    target: document.getElementById('conteneur-conseils-cyber')!,
    props: props,
  });
};

export default app!;
