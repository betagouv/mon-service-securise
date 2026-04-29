import type { PageServiceGeree } from '../pagesServiceGerees';

export const pageDepuisURL = (url: string) => {
  const { pathname } = new URL(url, window.location.origin);

  let match: RegExpExecArray | null = null;
  if (pathname.includes('service')) {
    match = /\/service\/[0-9a-zA-Z-]*\/([a-zA-Z]*)/.exec(pathname);
  } else if (pathname.includes('visiteGuidee')) {
    match = /\/visiteGuidee\/([a-zA-Z]*)/.exec(pathname);
  }

  return match?.[1] as PageServiceGeree;
};
