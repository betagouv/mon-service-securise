export const decoupeEnPagesALaHauteur = <T>(
  elements: T[],
  tiennentSurLaPage: (page: T[]) => boolean
) =>
  elements.reduce<T[][]>(
    (pages, element) => {
      const pageCourante = pages[pages.length - 1];
      return pageCourante.length === 0 ||
        tiennentSurLaPage([...pageCourante, element])
        ? [...pages.slice(0, -1), [...pageCourante, element]]
        : [...pages, [element]];
    },
    [[]]
  );
