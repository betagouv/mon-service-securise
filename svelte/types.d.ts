import 'svelte/elements';

declare module 'svelte/elements' {
  interface HTMLAttributes {
    'on:activites-modifiees'?: (event: CustomEvent<never>) => void;
    'on:mesure-modifiee'?: (event: CustomEvent<never>) => void;
    'on:collaboratif-service-modifie'?: (event: CustomEvent<never>) => void;
    'on:modeles-mesure-specifique-associes'?: (
      event: CustomEvent<never>
    ) => void;
    'on:rafraichis-services'?: (event: CustomEvent<never>) => void;
    'on:risques-v2-modifies'?: (event: CustomEvent<never>) => void;
    'on:description-service-modifiee'?: (event: CustomEvent<never>) => void;
  }
}
