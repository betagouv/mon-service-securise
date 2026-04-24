import type { Component } from 'svelte';

export const idEtapeParcoursHomologation = {
  autorite: 'autorite',
  avis: 'avis',
  documents: 'documents',
  dateTelechargement: 'dateTelechargement',
  decision: 'decision',
} as const;

export type IdEtapeParcoursHomologation =
  (typeof idEtapeParcoursHomologation)[keyof typeof idEtapeParcoursHomologation];

export type EtapeParcoursHomologation = {
  id: IdEtapeParcoursHomologation;
  numero: number;
  libelle: string;
};

export interface InstanceEtapeParcoursHomologation {
  enregistre: () => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComposantEtape = Component<any, InstanceEtapeParcoursHomologation>;
