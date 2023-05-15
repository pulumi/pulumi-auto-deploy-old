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


const org = pulumi.getOrganization();
const project = "dependency-example"

export const f = new AutoDeployer("auto-deployer-f", {
    org,
    project,
    stack: "f",
    downstream: [],
    pulumiAccessToken,
});

export const e = new AutoDeployer("auto-deployer-e", {
    org,
    project,
    stack: "e",
    downstream: [],
    pulumiAccessToken,
});

export const d = new AutoDeployer("auto-deployer-d", {
    org,
    project,
    stack: "d",
    downstream: [],
    pulumiAccessToken,
});

export const c = new AutoDeployer("auto-deployer-c", {
    org,
    project,
    stack: "c",
    downstream: [],
    pulumiAccessToken,
});

export const b = new AutoDeployer("auto-deployer-b", {
    org,
    project,
    stack: "b",
    downstream: [d, e, f],
    pulumiAccessToken,
});

export const a = new AutoDeployer("auto-deployer-a", {
    org,
    project,
    stack: "a",
    downstream: [b, c],
    pulumiAccessToken,
});

