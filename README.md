# cleanup-pulumi-stacks

[![build](https://github.com/jbrunton/cleanup-pulumi-stacks/actions/workflows/build.yml/badge.svg)](https://github.com/jbrunton/cleanup-pulumi-stacks/actions/workflows/build.yml)
[![Mutation coverage](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fjbrunton%2Fcleanup-pulumi-stacks%2Fdevelop)](https://dashboard.stryker-mutator.io/reports/github.com/jbrunton/cleanup-pulumi-stacks/develop)

A GitHub Action to automatically cleanup development/preview stacks in a Pulumi project.

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

Cleanup policies are listed under the `policies` key in the config. They must be given a `ttl` (time-to-live), and can be configured to match on either stack names, tags or both.

### TTL Policy

The time-to-live policy can be specified in either minutes or hours:

```yaml
policies:

  # cleanup any stacks not updated in the last 24 hours
  cleanup-previous-day:
    ttl:
      hours: 24

  # cleanup any stacks not updated in the last 30 minutes
  cleanup-previous-hour:
    ttl:
      minutes: 30
```

### Stack Name Policy

The stack name policy can be given a comma separated list of literals or glob patterns.

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
      name: dev-*
    ttl:
      hours: 24

  # match list of patterns (any stack named `test` or start with `dev-`)
  cleanup-all:
    match:
      name: test, dev-*
    ttl:
      hours: 24
```

# Tags Policy

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
        env: dev-*
    ttl:
      hours: 24

  # match list of patterns
  cleanup-all:
    match:
      tags:
        env: test, dev-*
    ttl:
      hours: 24
```
