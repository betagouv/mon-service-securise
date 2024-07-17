type Direction = 'top' | 'bottom' | 'left' | 'right';
const directions: Record<Direction, string> = {
  top: 'translateY(-',
  bottom: 'translateY(',
  left: 'translateX(-',
  right: 'translateX(',
};

export const glisse = (
  node: HTMLElement,
  { depuis = 'top', duree = 200 }: { depuis: Direction; duree: number }
) => {
  return {
    duration: duree,
    tick: (avancement: number, restant: number) => {
      node.style.setProperty(
        'transform',
        `${directions[depuis]}${restant * 100.0}%)`
      );
      node.style.setProperty('opacity', `${avancement}`);
    },
  };
};
