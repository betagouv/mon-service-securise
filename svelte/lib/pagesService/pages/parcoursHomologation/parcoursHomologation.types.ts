import type { Component } from 'svelte';

export type EtapeParcoursHomologation = 'autorite' | 'avis';

export interface InstanceEtapeParcoursHomologation {
  enregistre: () => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComposantEtape = Component<any, InstanceEtapeParcoursHomologation>;
