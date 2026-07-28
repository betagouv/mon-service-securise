import AdminStatistiques from './AdminStatistiques.svelte';
import { mount } from 'svelte';

const app = mount(AdminStatistiques, {
  target: document.getElementById('conteneur-admin-statistiques')!,
});

export default app;
