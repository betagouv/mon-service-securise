import Blog from './Blog.svelte';

document.body.addEventListener('svelte-recharge-blog', () => rechargeApp());

let app: Blog;
const rechargeApp = () => {
  app?.$destroy();
  app = new Blog({
    target: document.getElementById('blog')!,
  });
};

export default app!;
