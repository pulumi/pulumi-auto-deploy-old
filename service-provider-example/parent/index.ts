import * as pulumi from "@pulumi/pulumi";
import * as service from "@pulumi/pulumiservice";

const settings = new service.DeploymentSettings("settings", {
    organization: "deploy-testing",
    project: pulumi.getProject(),
    stack: pulumi.getStack(),
    sourceContext: {
        git: {
            repoUrl: "https://github.com/pulumi/pulumi-auto-deploy.git",
            branch: "komal/service-provider",
            repoDir: "service-provider-example/parent",
        }
    }
});

const webhook = new service.Webhook("webhook", {
    organizationName: "deploy-testing",
    projectName: pulumi.getProject(),
    stackName: pulumi.getStack(),
    format: service.WebhookFormat.PulumiDeployments,
    payloadUrl: "child/dev",
    active: true,
    displayName: "deploy-child-stack",
    filters: [service.WebhookFilters.UpdateSucceeded]
});
