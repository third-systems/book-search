import { NextjsSite, use, type StackContext } from "sst/constructs";
import { Storage } from "./bucket";

export function Web({ stack }: StackContext) {
  const bucket = use(Storage);

  const site = new NextjsSite(stack, "Web", {
    bind: [bucket],
    customDomain: {
      domainName: "third.systems",
    },
  });
  stack.addOutputs({
    SiteUrl: site.customDomainUrl ?? site.url,
  });
  return site;
}
