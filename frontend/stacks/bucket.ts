import { Bucket, type StackContext } from "sst/constructs";

export function Storage({ stack }: StackContext) {
  const bucket = new Bucket(stack, "Assets", {
    cdk: {
      bucket: {
        publicReadAccess: true,
      },
    },
  });

  return bucket;
}
