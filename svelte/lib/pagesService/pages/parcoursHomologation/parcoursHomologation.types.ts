import type { Component } from 'svelte';

export type IdEtapeParcoursHomologation = 'autorite' | 'avis' | 'documents';

export type EtapeParcoursHomologation = {
  numero: number;
  libelle: string;
  id: IdEtapeParcoursHomologation;
};

export interface InstanceEtapeParcoursHomologation {
  enregistre: () => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComposantEtape = Component<any, InstanceEtapeParcoursHomologation>;
