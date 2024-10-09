declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-risques': CustomEvent;
  }
}

export type RisquesProps = {
  idService: string;
  estLectureSeule: boolean;
};
