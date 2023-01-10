/** @type {import('@types/semantic-release').Options} */
const options = {
  branches: ["develop", "semantic-release"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        releaseRules: [
          { type: "breaking", release: "major" },
          { type: "major", release: "major" },
          { type: "feat", release: "minor" },
          { type: "perf", release: "minor" },
          { type: "build", release: "patch" },
          { type: "chore", release: "patch" },
          { type: "fix", release: "patch" },
          { type: "refactor", release: "patch" },
          { type: "ci", release: false },
          { type: "docs", release: false },
          { type: "style", release: false },
          { type: "test", release: false },
        ],
      },
    ],
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/npm",
      {
        publish: false,
      },
    ],
    [
      "@semantic-release/github",
      {
        successComment: false,
        releasedLabels: false,
      },
    ],
  ],
};

module.exports = options;
