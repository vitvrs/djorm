const { guessRootConfig } = require('lerna-jest')

module.exports = guessRootConfig(__dirname)

const docs = module.exports.projects.find(
  item => item.name === 'djorm-docs-linter'
)

docs.testPathIgnorePatterns.push('/build/')
