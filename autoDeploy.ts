import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import fetch from "node-fetch";

import { StackWebhook } from "./stackWebhook";

export interface AutoDeployerArgs {
    org: string;
    project: string;
    stack: string;
    downstream: AutoDeployer[];
    pulumiAccessToken: pulumi.Output<string>;
}

export class AutoDeployer extends pulumi.ComponentResource {
    public org: string;
    public project: string;
    public stack: string;
    public webhookURL: pulumi.Output<string>;
    constructor(name: string, args: AutoDeployerArgs, opts?: pulumi.ComponentResourceOptions) {
        super("pulumi:AutoDeployer", name, args, opts);
        this.org = args.org;
        this.project = args.project;
        this.stack = args.stack;

        const webhookHandler = this.makeWebhookHandler(name, this.org, this.project, this.stack, args.pulumiAccessToken);

        this.webhookURL = webhookHandler.url;

        const webhooks: StackWebhook[] = [];
        const ids: pulumi.Output<string>[]= [];

        for (let d of args.downstream) {
            const webhook = new StackWebhook(`${name}-${d.stack}`, {
                org: this.org,
                project: this.project,
                stack: this.stack,
                webhookURL: d.webhookURL,
            }, { parent: this });
            webhooks.push(webhook);
            ids.push(webhook.id);
        }

        this.registerOutputs({
            org: this.org,
            project: this.project,
            stack: this.stack,
            webhookURL: this.webhookURL,
            downstreamWebhooks: webhooks,
            webhookIds: ids,
        });
    }

    makeWebhookHandler(name: string, org: string, project: string, stack: string, pulumiAccessToken: pulumi.Output<string>) {
        return new awsx.classic.apigateway.API(`pulumi-webhook-handler-${name}`, {
            restApiArgs: {
                binaryMediaTypes: ["application/json"],
            },
            routes: [{
                path: "/",
                method: "GET",
                eventHandler: async () => ({
                    statusCode: 200,
                    body: "🍹 Pulumi Webhook Responder🍹\n",
                }),
            }, {
                path: "/",
                method: "POST",
                eventHandler: async (req) => {
                    const webhookKind = req.headers !== undefined ? req.headers["pulumi-webhook-kind"] : "";
                    const bytes = req.body!.toString();
                    const payload = Buffer.from(bytes, "base64").toString();
                    const parsedPayload = JSON.parse(payload);
                    const prettyPrintedPayload = JSON.stringify(parsedPayload, null, 2);
                    console.log(prettyPrintedPayload);

                    const deployment = {
                        operation: "update",
                        inheritSettings: true,
                    };

                    const url = `https://api.pulumi.com/api/preview/${org}/${project}/${stack}/deployments`
                    const headers = {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `token ${pulumiAccessToken.get()}`
                    };
                    const response = await fetch(url, {
                        method: "POST",
                        headers,
                        body: JSON.stringify(deployment),
                    });

                    if (!response.ok) {
                        let errMessage = "";
                        try {
                            errMessage = await response.text();
                        } catch {}
                        throw new Error(`failed to deploy stack: ${errMessage}`);
                    }

                    const deploymentResult = await response.json();
                    console.log(deploymentResult);

                    return { statusCode: 200, body: `update queued for stack ${org}/${project}/${stack}\n` };
                },
            }],
        },
            { parent: this });
    }
}
