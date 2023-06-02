import * as pulumi from "@pulumi/pulumi";
import * as service from "@pulumi/pulumiservice";

const webhook = new service.Webhook("webhook", {
    organizationName: "deploy-testing",
    projectName: pulumi.getProject(),
    stackName: pulumi.getStack(),
    format: service.WebhookFormat.PulumiDeployments,
    payloadUrl: "https://api.komal.pulumi-dev.io/api/preview/deploy-testing/child/dev/deployments",
    active: true,
    displayName: "deploy-child-stack"
});
