import Tiroir from './Tiroir.svelte';
import { mount } from 'svelte';

document.body.addEventListener('svelte-recharge-tiroir', () => rechargeApp());

let app: Tiroir;
const rechargeApp = () => {
  app?.$destroy();
  app = mount(Tiroir, {
    target: document.getElementById('tiroir')!,
  });
};

export default app!;
