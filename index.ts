import * as pulumi from "@pulumi/pulumi";

import { AutoDeployer } from "./autoDeploy";


if (!process.env.PULUMI_ACCESS_TOKEN) {
    throw new Error("PULUMI_ACCESS_TOKEN must be set");
}

const pulumiAccessToken = pulumi.secret(process.env.PULUMI_ACCESS_TOKEN || "");

/**
 *
 * The following example configures automatic deployment of stacks with the following dependency graph:
    a
    ├── b
    │   ├── d
    │   ├── e
    │   └── f
    └── c
 * Whenever a node in the graph is updated, 
 * all downstream nodes will be automatically updated via a webhook triggering Pulumi Deployments.
 */

export const f = new AutoDeployer("auto-deployer-f", {
    org: "pulumi",
    project: "dependency-example",
    stack: "f",
    downstream: [],
    pulumiAccessToken,
});

export const e = new AutoDeployer("auto-deployer-e", {
    org: "pulumi",
    project: "dependency-example",
    stack: "e",
    downstream: [],
    pulumiAccessToken,
});

export const d = new AutoDeployer("auto-deployer-d", {
    org: "pulumi",
    project: "dependency-example",
    stack: "d",
    downstream: [],
    pulumiAccessToken,
});

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

