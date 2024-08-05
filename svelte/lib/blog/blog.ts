import Blog from './Blog.svelte';
import type { BlogProps } from './blog.d';

document.body.addEventListener(
  'svelte-recharge-blog',
  (e: CustomEvent<BlogProps>) => rechargeApp(e.detail)
);

let app: Blog;
const rechargeApp = (props: BlogProps) => {
  app?.$destroy();
  app = new Blog({
    target: document.getElementById('blog')!,
    props,
  });
};

export default app!;
