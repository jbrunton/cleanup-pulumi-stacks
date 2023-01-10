# Cleanup Pulumi Stacks

[![build](https://github.com/jbrunton/cleanup-pulumi-stacks/actions/workflows/build.yml/badge.svg)](https://github.com/jbrunton/cleanup-pulumi-stacks/actions/workflows/build.yml)
[![Mutation coverage](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fjbrunton%2Fcleanup-pulumi-stacks%2Fdevelop)](https://dashboard.stryker-mutator.io/reports/github.com/jbrunton/cleanup-pulumi-stacks/develop)

A GitHub Action to automatically cleanup development/preview stacks in a Pulumi project.

## Contents

- [Cleanup Pulumi Stacks](#cleanup-pulumi-stacks)
  - [Contents](#contents)
  - [Getting Started](#getting-started)
  - [Inputs](#inputs)
  - [Config](#config)
  - [Policies](#policies)
    - [TTL Policy](#ttl-policy)
    - [Stack Name Policy](#stack-name-policy)
    - [Tags Policy](#tags-policy)
  - [Protecting Production Resources](#protecting-production-resources)
    - [Steps you should take](#steps-you-should-take)
    - [Steps this action takes](#steps-this-action-takes)

## Getting Started 

Create a workflow file to run on a schedule. The example below defines a policy called `cleanup-dev-stacks` which cleans up all preview environments where:
* The stack has been marked with the tag `environment`, where the value of the tag is `development`.
* It has been at least 24 hours since the the stack has been updated.

```yaml
name: cleanup-stacks

on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: jbrunton/cleanup-pulumi-stacks@develop
        with:
          working-directory: pulumi
          config: |
            policies:
              cleanup-dev-stacks:
                match:
                  tags:
                    environment: development
                  ttl:
                    hours: 24
        env:
          PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

* `working-directory` - Relative path in the repo to the Pulumi project (i.e. the project with your `Pulumi.yaml` file). Defaults to the current working directory.
* `config` - Yaml config for policies (see below).
* `config_file` - Can be used to specify a path to a config file in place of the `config` input.
* `preview` - When `true`, logs a preview of what the action would do without making changes to any stacks. Defaults to `false`.
* `verbose` - When `true`, provides detailed output on all the policy checks applied to each stack. Defaults to `false`.

## Config

You can specify the config in a couple of different ways:

1. In the workflow, with the `config` key:

```yaml
  - uses: jbrunton/cleanup-pulumi-stacks@develop
    with:
      config: |
        policies:
          cleanup-dev-stacks:
            match:
              name: dev-*
```

2. In a file in source control, with the `config_file` key:

```yaml
  - uses: jbrunton/cleanup-pulumi-stacks@develop
    with:
      config_file: cleanup-config.yml
```

3. By default, if no config or file are specified, the action will default to looking for a config file at `<working-directory>/cleanup-config.yml`.

```yaml
  # uses config file at pulumi/cleanup-config.yml
  - uses: jbrunton/cleanup-pulumi-stacks@develop
    with:
      working-directory: pulumi
```

## Policies

Cleanup policies are listed under the `policies` key in the config. They must be given a `ttl` (time-to-live), and additional match parameters based on stack names or tags.

### TTL Policy

The time-to-live policy can be specified in either days, hours or minutes:

```yaml
policies:

  # cleanup any stacks not updated in the last 3 days
  cleanup-previous-day:
    ttl:
      days: 3

  # cleanup any stacks not updated in the last 6 hours
  cleanup-previous-hour:
    ttl:
      hours: 6
```

### Stack Name Policy

The stack name policy can be given any glob pattern supported by [micromatch](https://github.com/micromatch/micromatch#matching-features).

```yaml
policies:

  # match literal (the stack named `test`)
  cleanup-test:
    match:
      name: test
    ttl:
      hours: 24

  # match glob (any stacks starting with `dev-`)
  cleanup-dev:
    match:
      name: 'dev-*'
    ttl:
      hours: 24

  # match logical 'or' of patterns (any stack named `test` or starting with `dev-`)
  cleanup-all:
    match:
      name: '(test|dev-*)'
    ttl:
      hours: 24

  # match negations
  cleanup-all:
    match:
      name: '!production'
    ttl:
      hours: 24
```

### Tags Policy

The stack name policy can define patterns for arbitrary tags.

```yaml
policies:

  # match literal (any stack where the `env` tag is `test`)
  cleanup-test:
    match:
      tags:
        env: test
    ttl:
      hours: 24

  # match glob (any stacks where the `env` tag starts with `dev-`)
  cleanup-dev:
    match:
      tags:
        env: 'dev-*'
    ttl:
      hours: 24

  # match logical 'or' of patterns
  cleanup-all:
    match:
      tags:
        env: '(test|dev-*)'
    ttl:
      hours: 24
```

## Protecting Production Resources

It goes without saying that you should be careful using any automated tool which will destroy your stacks. Here are a few ways this tool is designed to protect you from accidental deletes, and a few steps you can take.

### Steps you should take

1. Keep the action in preview mode until you're confident your policies work as expected.
2. You can also use Pulumi's [protect resource](https://www.pulumi.com/docs/intro/concepts/resources/options/protect/) option on production resources. This will prevent the action from accidentally destroying anything it shouldn't.
3. Consider using separate projects/accounts for production services.

### Steps this action takes

1. By default the action runs in preview mode, and won't destroy anything. You can view its runs and decide when to disable preview mode.
2. You have to specify at least one `match` policy, so you can't accidentally add a "remove all" policy. You must also define at least one `stack` policy to match on.
3. Test coverage of key application logic is intentionally high, and checked using a mutation testing tool.
