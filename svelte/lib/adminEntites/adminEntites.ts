import AdminEntites from './AdminEntites.svelte';
import { mount } from 'svelte';

const app = mount(AdminEntites, {
  target: document.getElementById('conteneur-admin-entites')!,
});

export default app;
