import * as adaptateurOidc from './adaptateurOidc.js';
import * as adaptateurOidcMemoire from './adaptateurOidcMemoire.js';

const fabriqueAdaptateurOidc = () =>
  process.env.NODE_ENV === 'test_accessibilite'
    ? adaptateurOidcMemoire
    : adaptateurOidc;

export { fabriqueAdaptateurOidc };
