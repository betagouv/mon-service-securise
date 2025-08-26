module.exports = {
  reporter: process.env.GITHUB_ACTIONS ? 'json' : 'spec',
  'reporter-option': process.env.GITHUB_ACTIONS
    ? ['output=./backend-test-report.json']
    : null,
  spec: './test*/**/*.spec.*(js|ts)',
};
