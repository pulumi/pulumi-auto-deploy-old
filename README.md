# pulumi-auto-deploy-old

This repo was a proof of concept. A multi-language of this component is now maintained and published to the pulumi registry:
- https://www.pulumi.com/registry/packages/auto-deploy/
- github.com/pulumi/pulumi-auto-deploy

A proof of concept for automatically deploying dependent stacks using [Pulumi Deployments](https://www.pulumi.com/docs/intro/deployments/).


The following example configures automatic deployment of stacks with the following dependency graph:

    a
    ├── b
    │   ├── d
    │   ├── e
    │   └── f
    └── c

Whenever a node in the graph is updated, all downstream nodes will be automatically updated via a webhook triggering Pulumi Deployments.

![](./auto-deploy.gif)

```ts
export const c = new AutoDeployer("auto-deployer-c", {
    org: "pulumi",
    project: "dependency-example",
    stack: "c",
    downstream: [],
    pulumiAccessToken,
});

export const b = new AutoDeployer("auto-deployer-b", {
    org: "pulumi",
    project: "dependency-example",
    stack: "b",
    downstream: [d, e, f],
    pulumiAccessToken,
});

export const a = new AutoDeployer("auto-deployer-a", {
    org: "pulumi",
    project: "dependency-example",
    stack: "a",
    downstream: [b, c],
    pulumiAccessToken,
});
```

`AutoDeployer` does a few things:
1. For each stack create an API Gateway that knows how to trigger an update for the given stack via a call to the Pulumi Deployments REST API.
2. For each dependent downstream stack, register a Pulumi stack webhook such that when an update finished for stack `A`, a webhook is fired to the update API Gateway function for downstream stack `D`.

To run this example:

1. Initialize and create the six stacks in `./dependency-example` in your org of choice. These are the stacks that have dependencies that will be exercised via `AutoDeploy`.
1. Configure deployment settings for all six stacks (these are trivial programs that do not require creds).
2. Create the `pulumi-auto-deploy` example stack and run an update at the root of the directory (requires AWS credentials and exported `PULUMI_ACCESS_TOKEN` environment variables).
3. Trigger an update on `dependency-example/a` and watch all downstream stacks get updated via a deployment
