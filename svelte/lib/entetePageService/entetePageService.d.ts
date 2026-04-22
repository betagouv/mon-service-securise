declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-entete-page-service': CustomEvent;
  }
}

export type EntetePageServiceProps = {
  idService: string;
  nomService: string;
  organisationResponsable: string;
  indiceCyber: number;
  indiceCyberPersonnalise: number;
  noteMax: number;
  avecIndiceCyber: boolean;
};
