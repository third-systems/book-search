import { type SSTConfig } from "sst";
import { Storage } from "stacks/bucket";
import { Web } from "stacks/web";

export default {
  config(_input) {
    return {
      name: "book-search",
      region: "us-east-1",
    };
  },
  stacks(app) {
    if (app.stage !== "production") {
      app.setDefaultRemovalPolicy("destroy");
    }
    app.stack(Storage).stack(Web);
  },
} satisfies SSTConfig;
