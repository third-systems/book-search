/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/ban-types */
import {
  pipeline,
  env,
  type FeatureExtractionPipeline,
} from "@xenova/transformers";

// Skip local model check
env.allowLocalModels = false;

// Use the Singleton pattern to enable lazy construction of the pipeline.
class PipelineSingleton {
  static model = "Supabase/gte-small";
  static instance: Promise<FeatureExtractionPipeline> | null = null;

  static async getInstance(progress_callback: Function | undefined) {
    if (this.instance === null) {
      this.instance = pipeline("feature-extraction", this.model, {
        progress_callback,
      });
    }
    return this.instance;
  }
}

addEventListener("message", async (event: MessageEvent<{ text: string }>) => {
  // Retrieve the classification pipeline. When called for the first time,
  // this will load the pipeline and save it for future use.
  const model = await PipelineSingleton.getInstance((x: any) => {
    // We also add a progress callback to the pipeline so that we can
    // track model loading.
    postMessage(x);
  });

  // Actually perform the classification
  const output = await model(event.data.text, {
    pooling: "mean",
    normalize: true,
  });

  // Send the output back to the main thread
  postMessage({
    status: "complete",
    output: Array.from(output.data),
  });
});
