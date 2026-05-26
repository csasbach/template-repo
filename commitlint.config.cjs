module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'docs', 'test', 'refactor', 'style', 'perf', 'ci', 'revert', 'polish'],
    ],
    'subject-case': [0],
  },
};
