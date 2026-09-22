declare global {
  const axios: AxiosStatic;
  interface HTMLElementEventMap {
    'svelte-recharge-cle-api': CustomEvent;
  }
}

export type CleApiPublique = {
  id: string;
  prefixe: string;
  dateCreation: string;
  dateExpiration: string;
};

export type CleApiCreee = CleApiPublique & {
  valeurEnClair: string;
};

export type CleApiProps = {
  cles: CleApiPublique[];
};
