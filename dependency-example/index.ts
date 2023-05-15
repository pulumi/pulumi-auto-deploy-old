import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config();

const parent = config.get("parent") || "";

let depChain = pulumi.output(pulumi.getStack());

if (parent != "") {
    const org = pulumi.getOrganization();
    const project = pulumi.getProject();
    const parentStack = new pulumi.StackReference(`${org}/${project}/${parent}`);
    
    depChain = parentStack.getOutput("dependencyChain").apply(d => `${d} -> ${pulumi.getStack()}`);
}

export const dependencyChain = depChain;

