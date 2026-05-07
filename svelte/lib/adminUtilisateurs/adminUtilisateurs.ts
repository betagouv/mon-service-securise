import AdminUtilisateurs from './AdminUtilisateurs.svelte';
import { mount } from 'svelte';

const app = mount(AdminUtilisateurs, {
  target: document.getElementById('conteneur-admin-utilisateurs')!,
});

export default app;
