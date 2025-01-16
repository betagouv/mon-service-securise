const adaptateurEnvironnement = require('./adaptateurEnvironnement');
const adaptateurTrackingSendinblue = require('./adaptateurTrackingSendinblue');
const {
  fabriqueAdaptateurTrackingMemoire,
} = require('./adaptateurTrackingMemoire');

const fabriqueAdaptateurTracking = () =>
  adaptateurEnvironnement.sendinblue().clefAPITracking()
    ? adaptateurTrackingSendinblue
    : fabriqueAdaptateurTrackingMemoire();

module.exports = fabriqueAdaptateurTracking;
