import type { PageServiceGeree } from '../pagesServiceGerees';

export const pageDepuisURL = (url: string) => {
  const { pathname } = new URL(url, window.location.origin);
  const match = /\/service\/[0-9a-zA-Z-]*\/([a-zA-Z]*)/.exec(pathname);
  return match?.[1] as PageServiceGeree;
};
