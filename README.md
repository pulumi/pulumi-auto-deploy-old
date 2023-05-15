# pulumi-auto-deploy
A proof of concept for automatically deploying dependent stacks using [Pulumi Deployments](https://www.pulumi.com/docs/intro/deployments/).


The following example configures automatic deployment of stacks with the following dependency graph:

    a
    ├── b
    │   ├── d
    │   ├── e
    │   └── f
    └── c

Whenever a node in the graph is updated, all downstream nodes will be automatically updated via a webhook triggering Pulumi Deployments.

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
