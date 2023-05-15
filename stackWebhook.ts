import * as pulumi from "@pulumi/pulumi";
import fetch from "node-fetch";


// Exported type.
export interface StackWebhookArgs {
    org: string;
    project: string;
    stack: string;
    webhookURL: pulumi.Output<string>;
}

// Non-exported type used by the provider functions.
// This interface contains the same inputs, but as un-wrapped types.
interface StackWebhooksProviderInputs {
    org: string;
    project: string;
    stack: string;
    webhookURL: string;
}


interface StackWebhookProviderOutputs {
    org: string;
    project: string;
    stack: string;
    webhookURL: string;
    name: string;
}

class StackWebhookProvider implements pulumi.dynamic.ResourceProvider {
    private name: string;
    constructor(name: string) {
        this.name = name;
    }
    async create(inputs: StackWebhooksProviderInputs): Promise<pulumi.dynamic.CreateResult> {
        const { org, project, stack, webhookURL } = inputs;
        const payload = {
            active: true,
            organizationName: org,
            projectName: project,
            stackName: stack,
            name: this.name,
            displayName: this.name,
            payloadUrl: webhookURL,
            filters: ["update_succeeded"],
        };

        if (!process.env.PULUMI_ACCESS_TOKEN) {
            throw new Error("PULUMI_ACCESS_TOKEN must be set");
        }

        const url = `https://api.pulumi.com/api/stacks/${org}/${project}/${stack}/hooks`;
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `token ${process.env.PULUMI_ACCESS_TOKEN}`
        };
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            let errMessage = "";
            try {
                errMessage = await response.text();
            } catch {}
            throw new Error(`failed to create stack webhook: ${errMessage}`)
        }
        const result = await response.json();
        return {
            id: `${org}-${project}-${stack}-${this.name}`, outs: {
                org,
                project,
                stack,
                name: this.name,
                result,
            }
        };
    }

    async update(id: string, olds:StackWebhookProviderOutputs, news: StackWebhooksProviderInputs): Promise<pulumi.dynamic.UpdateResult> {
        const { org, project, stack, webhookURL } = news;
        const { name } = olds;
        const payload = {
            active: true,
            organizationName: org,
            projectName: project,
            stackName: stack,
            name: this.name,
            displayName: this.name,
            payloadUrl: webhookURL,
            filters: ["update_succeeded"],
        };

        if (!process.env.PULUMI_ACCESS_TOKEN) {
            throw new Error("PULUMI_ACCESS_TOKEN must be set");
        }

        const url = `https://api.pulumi.com/api/stacks/${org}/${project}/${stack}/hooks/${name}`
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `token ${process.env.PULUMI_ACCESS_TOKEN}`
        };
        const response = await fetch(url, {
            method: "PATCH",
            headers,
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            let errMessage = "";
            try {
                errMessage = await response.text();
            } catch {}
            throw new Error(`failed to create stack webhook: ${errMessage}`)
        }
        const result = await response.json();
        return {
            outs: {
                org,
                project,
                stack,
                name: this.name,
                result,
            }
        };
    }

    async delete(id: string, props: StackWebhookProviderOutputs): Promise<void> {
        const { org, project, stack, name } = props;
        const url = `https://api.pulumi.com/api/stacks/${org}/${project}/${stack}/hooks/${name}`
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `token ${process.env.PULUMI_ACCESS_TOKEN}`
        };
        const response = await fetch(url, {
            method: "DELETE",
            headers,
        });
        if (!response.ok) {
            let errMessage = "";
            try {
                errMessage = await response.text();
            } catch {
                throw new Error(`failed to delete stack webhook: ${errMessage}`)
            }

        }
        return;
    }

    async diff(id: string, oldOutputs: StackWebhookProviderOutputs, newInputs: StackWebhooksProviderInputs): Promise<pulumi.dynamic.DiffResult> {
        // TODO implement
        return { 
            changes: true,
            deleteBeforeReplace: true,
        };
    }
}

export class StackWebhook extends pulumi.dynamic.Resource {
    constructor(name: string, args: StackWebhookArgs, opts?: pulumi.CustomResourceOptions) {
        super(new StackWebhookProvider(name), name, args, opts);
    }
}
