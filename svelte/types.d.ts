declare namespace svelteHTML {
  interface HTMLAttributes<T> {
    'on:activites-modifiees'?: (event: CustomEvent<never>) => void;
    'on:mesure-modifiee'?: (event: CustomEvent<never>) => void;
    'on:collaboratif-service-modifie'?: (event: CustomEvent<never>) => void;
    'on:modeles-mesure-specifique-associes'?: (
      event: CustomEvent<never>
    ) => void;
    'on:rafraichis-services'?: (event: CustomEvent<never>) => void;
  }
}
