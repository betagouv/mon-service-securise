import middleware from './middleware.js';

export type Middleware = ReturnType<typeof middleware>;
