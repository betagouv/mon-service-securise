const adaptateurEnvironnement = require('./adaptateurEnvironnement');
const adaptateurTrackingSendinblue = require('./adaptateurTrackingSendinblue');
const adaptateurTrackingMemoire = require('./adaptateurTrackingMemoire');

const fabriqueAdaptateurTracking = () =>
  adaptateurEnvironnement.sendinblue().clefAPITracking()
    ? adaptateurTrackingSendinblue
    : adaptateurTrackingMemoire;

module.exports = fabriqueAdaptateurTracking;
