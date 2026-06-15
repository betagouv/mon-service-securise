import * as adaptateurOidc from './adaptateurOidc.js';
import * as adaptateurOidcTestsAccessibilite from './adaptateurOidcTestsAccessibilite.js';

const fabriqueAdaptateurOidc = () =>
  process.env.NODE_ENV === 'test_accessibilite'
    ? adaptateurOidcTestsAccessibilite
    : adaptateurOidc;

export { fabriqueAdaptateurOidc };
