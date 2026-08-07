// ---------------------------------------------------------------------------
// TRAINING SCRIPT
//
//   node src/ml/train.ts [datasetSize] [epochs] [seed]
//
// Generates a labeled facial-condition dataset grounded in Ayurvedic texts,
// trains the DoshaNet classifier, evaluates on a held-out test split of
// "different faces", prints the full report, and writes the trained weights
// to weights.json so the frontend can load them at runtime.
// ---------------------------------------------------------------------------

import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateDataset } from "./dataset.ts";
import { DoshaNet } from "./model.ts";
import { trainTestSplit, evaluate, formatMetrics } from "./evaluate.ts";
import type { Metrics } from "./types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const datasetSize = Number(process.argv[2]) || 4000;
const epochs = Number(process.argv[3]) || 80;
const seed = Number(process.argv[4]) || 42;
const hiddenSize = 24;
const testRatio = 0.25;

console.log("Generating Ayurvedic facial-condition dataset...");
console.log(`  dataset size : ${datasetSize}`);
console.log(`  epochs       : ${epochs}`);
console.log(`  seed         : ${seed}`);

const samples = generateDataset(datasetSize, seed);
const { XTrain, YTrain, XTest, YTest } = trainTestSplit(samples, testRatio, seed + 1);

const inputSize = XTrain[0].length;
const net = new DoshaNet(inputSize, hiddenSize, 3);

let lastReported = 0;
net.train(XTrain, YTrain, {
  epochs,
  lr: 0.25,
  batchSize: 64,
  momentum: 0.9,
  onEpoch: (epoch, loss) => {
    if (epoch % 20 === 0 || epoch === epochs) {
      console.log(`  epoch ${String(epoch).padStart(3)}  loss=${loss.toFixed(4)}`);
      lastReported = loss;
    }
  },
});

console.log("");
const trainMetrics: Metrics = evaluate(net, XTrain, YTrain, XTrain.length);
const testMetrics: Metrics = evaluate(net, XTest, YTest, XTrain.length);

console.log(formatMetrics(testMetrics));
console.log("");
console.log("  (Train set baseline for overfit check)");
console.log(`  Train accuracy: ${(trainMetrics.overallAccuracy * 100).toFixed(2)}%  |  Test accuracy: ${(testMetrics.overallAccuracy * 100).toFixed(2)}%`);

// Save trained weights for the browser bundle.
const weightsPath = join(__dirname, "weights.json");
writeFileSync(weightsPath, JSON.stringify(net.toJSON(), null, 2));
console.log("");
console.log(`Weights saved to ${weightsPath}`);
