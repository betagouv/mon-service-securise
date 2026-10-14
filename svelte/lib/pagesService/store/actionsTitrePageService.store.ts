import type { Snippet } from 'svelte';
import { writable } from 'svelte/store';

export const actionsTitrePageServiceStore = writable<Snippet | undefined>();
