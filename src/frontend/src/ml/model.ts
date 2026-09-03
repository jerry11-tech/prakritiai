import type { ModelWeights } from "./types.ts";

// ---------------------------------------------------------------------------
// A small 2-layer feed-forward neural network with a hidden tanh layer and a
// softmax output. Implemented in pure TypeScript (no external ML deps) so it
// runs identically in Node (training) and the browser (inference).
// ---------------------------------------------------------------------------

export class DoshaNet {
  inputSize: number;
  hiddenSize: number;
  outputSize: number;
  W1: number[][];
  b1: number[];
  W2: number[][];
  b2: number[];

  constructor(inputSize: number, hiddenSize: number, outputSize: number) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;
    this.W1 = zeros(inputSize, hiddenSize);
    this.b1 = new Array(hiddenSize).fill(0);
    this.W2 = zeros(hiddenSize, outputSize);
    this.b2 = new Array(outputSize).fill(0);
    this.initWeights();
  }

  private initWeights() {
    // He-style initialization scaled for tanh.
    const scale1 = Math.sqrt(2 / this.inputSize);
    const scale2 = Math.sqrt(2 / this.hiddenSize);
    for (let i = 0; i < this.inputSize; i++) {
      for (let j = 0; j < this.hiddenSize; j++) {
        this.W1[i][j] = (Math.random() * 2 - 1) * scale1;
      }
    }
    for (let i = 0; i < this.hiddenSize; i++) {
      for (let j = 0; j < this.outputSize; j++) {
        this.W2[i][j] = (Math.random() * 2 - 1) * scale2;
      }
    }
  }

  // Forward pass. Returns hidden activations and softmax probabilities.
  forward(input: number[]): { hidden: number[]; probs: number[] } {
    const hidden = new Array(this.hiddenSize);
    for (let j = 0; j < this.hiddenSize; j++) {
      let z = this.b1[j];
      for (let i = 0; i < this.inputSize; i++) {
        z += input[i] * this.W1[i][j];
      }
      hidden[j] = Math.tanh(z);
    }
    const logits = new Array(this.outputSize);
    for (let k = 0; k < this.outputSize; k++) {
      let z = this.b2[k];
      for (let j = 0; j < this.hiddenSize; j++) {
        z += hidden[j] * this.W2[j][k];
      }
      logits[k] = z;
    }
    const probs = softmax(logits);
    return { hidden, probs };
  }

  predict(input: number[]): { label: number; probs: number[] } {
    const { probs } = this.forward(input);
    let best = 0;
    for (let k = 1; k < this.outputSize; k++) {
      if (probs[k] > probs[best]) best = k;
    }
    return { label: best, probs };
  }

  // Trains via mini-batch SGD (momentum) or Adam, with optional L2 weight
  // decay and per-epoch learning-rate decay. Adam + L2 + lr schedule was
  // measured to lift held-out and cross-face accuracy substantially over
  // plain SGD while staying compact enough for the browser.
  train(
    X: number[][],
    Y: number[],
    opts: {
      epochs?: number;
      lr?: number;
      batchSize?: number;
      momentum?: number;
      optimizer?: "sgd" | "adam";
      weightDecay?: number;
      lrDecay?: number;
      minLr?: number;
      onEpoch?: (epoch: number, loss: number) => void;
    } = {},
  ) {
    const epochs = opts.epochs ?? 60;
    const lr = opts.lr ?? 0.15;
    const batchSize = opts.batchSize ?? 32;
    const momentum = opts.momentum ?? 0.9;
    const optimizer = opts.optimizer ?? "sgd";
    const weightDecay = opts.weightDecay ?? 0;
    const lrDecay = opts.lrDecay ?? 0;
    const minLr = opts.minLr ?? 0;

    // SGD momentum buffers.
    const vW1 = zeros(this.inputSize, this.hiddenSize);
    const vb1 = new Array(this.hiddenSize).fill(0);
    const vW2 = zeros(this.hiddenSize, this.outputSize);
    const vb2 = new Array(this.outputSize).fill(0);

    // Adam first/second moments + bias-corrected steps.
    const mW1 = zeros(this.inputSize, this.hiddenSize);
    const vfW1 = zeros(this.inputSize, this.hiddenSize);
    const mb1 = new Array(this.hiddenSize).fill(0);
    const vfb1 = new Array(this.hiddenSize).fill(0);
    const mW2 = zeros(this.hiddenSize, this.outputSize);
    const vfW2 = zeros(this.hiddenSize, this.outputSize);
    const mb2 = new Array(this.outputSize).fill(0);
    const vfb2 = new Array(this.outputSize).fill(0);
    const beta1 = 0.9;
    const beta2 = 0.999;
    const adamEps = 1e-8;
    let step = 0;

    const n = X.length;
    const idx = Array.from({ length: n }, (_, i) => i);

    for (let epoch = 0; epoch < epochs; epoch++) {
      // Geometric LR decay, floored at minLr.
      const epochLr = Math.max(lr * Math.pow(lrDecay, epoch), minLr);

      // Shuffle.
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [idx[i], idx[j]] = [idx[j], idx[i]];
      }

      let totalLoss = 0;

      for (let start = 0; start < n; start += batchSize) {
        const end = Math.min(start + batchSize, n);
        const size = end - start;

        // Accumulate gradients over the batch.
        const gW1 = zeros(this.inputSize, this.hiddenSize);
        const gb1 = new Array(this.hiddenSize).fill(0);
        const gW2 = zeros(this.hiddenSize, this.outputSize);
        const gb2 = new Array(this.outputSize).fill(0);

        for (let m = start; m < end; m++) {
          const xi = X[idx[m]];
          const yi = Y[idx[m]];

          // Inputs are one-hot -> skip zeros for a large speedup.
          const hidden = new Array(this.hiddenSize);
          for (let j = 0; j < this.hiddenSize; j++) hidden[j] = this.b1[j];
          for (let i = 0; i < this.inputSize; i++) {
            const x = xi[i];
            if (x === 0) continue;
            const row = this.W1[i];
            for (let j = 0; j < this.hiddenSize; j++) {
              hidden[j] += x * row[j];
            }
          }
          for (let j = 0; j < this.hiddenSize; j++) hidden[j] = Math.tanh(hidden[j]);

          const logits = new Array(this.outputSize);
          for (let k = 0; k < this.outputSize; k++) {
            let z = this.b2[k];
            for (let j = 0; j < this.hiddenSize; j++) {
              z += hidden[j] * this.W2[j][k];
            }
            logits[k] = z;
          }
          const probs = softmax(logits);
          const target = new Array(this.outputSize).fill(0);
          target[yi] = 1;

          // Output layer gradient: (probs - target).
          const dOut = new Array(this.outputSize);
          for (let k = 0; k < this.outputSize; k++) {
            dOut[k] = probs[k] - target[k];
            totalLoss += -Math.log(Math.max(probs[yi], 1e-12));
          }

          // Hidden layer gradient via tanh'.
          const dHidden = new Array(this.hiddenSize);
          for (let j = 0; j < this.hiddenSize; j++) {
            let sum = 0;
            for (let k = 0; k < this.outputSize; k++) {
              sum += dOut[k] * this.W2[j][k];
            }
            dHidden[j] = sum * (1 - hidden[j] * hidden[j]);
          }

          // Accumulate.
          for (let j = 0; j < this.hiddenSize; j++) {
            gb2[j] += dOut[j];
            for (let k = 0; k < this.outputSize; k++) {
              gW2[j][k] += dOut[k] * hidden[j];
            }
          }
          for (let i = 0; i < this.inputSize; i++) {
            gb1[i] += dHidden[i];
            for (let j = 0; j < this.hiddenSize; j++) {
              gW1[i][j] += dHidden[j] * xi[i];
            }
          }
        }

        // Apply gradients.
        if (optimizer === "adam") {
          step += 1;
          const c1 = 1 - Math.pow(beta1, step);
          const c2 = 1 - Math.pow(beta2, step);
          for (let i = 0; i < this.inputSize; i++) {
            for (let j = 0; j < this.hiddenSize; j++) {
              const g = gW1[i][j] + weightDecay * this.W1[i][j];
              mW1[i][j] = beta1 * mW1[i][j] + (1 - beta1) * g;
              vfW1[i][j] = beta2 * vfW1[i][j] + (1 - beta2) * g * g;
              this.W1[i][j] -=
                epochLr *
                (mW1[i][j] / c1) /
                (Math.sqrt(vfW1[i][j] / c2) + adamEps);
            }
          }
          for (let j = 0; j < this.hiddenSize; j++) {
            mb1[j] = beta1 * mb1[j] + (1 - beta1) * gb1[j];
            vfb1[j] = beta2 * vfb1[j] + (1 - beta2) * gb1[j] * gb1[j];
            this.b1[j] -= epochLr * (mb1[j] / c1) / (Math.sqrt(vfb1[j] / c2) + adamEps);
          }
          for (let i = 0; i < this.hiddenSize; i++) {
            for (let j = 0; j < this.outputSize; j++) {
              const g = gW2[i][j] + weightDecay * this.W2[i][j];
              mW2[i][j] = beta1 * mW2[i][j] + (1 - beta1) * g;
              vfW2[i][j] = beta2 * vfW2[i][j] + (1 - beta2) * g * g;
              this.W2[i][j] -=
                epochLr *
                (mW2[i][j] / c1) /
                (Math.sqrt(vfW2[i][j] / c2) + adamEps);
            }
          }
          for (let j = 0; j < this.outputSize; j++) {
            mb2[j] = beta1 * mb2[j] + (1 - beta1) * gb2[j];
            vfb2[j] = beta2 * vfb2[j] + (1 - beta2) * gb2[j] * gb2[j];
            this.b2[j] -= epochLr * (mb2[j] / c1) / (Math.sqrt(vfb2[j] / c2) + adamEps);
          }
        } else {
          // SGD with momentum (gradients pre-scaled by 1/batchSize).
          const scale = epochLr / size;
          for (let i = 0; i < this.inputSize; i++) {
            for (let j = 0; j < this.hiddenSize; j++) {
              const g = gW1[i][j] + weightDecay * this.W1[i][j];
              vW1[i][j] = momentum * vW1[i][j] - scale * g;
              this.W1[i][j] += vW1[i][j];
            }
          }
          for (let j = 0; j < this.hiddenSize; j++) {
            vb1[j] = momentum * vb1[j] - scale * gb1[j];
            this.b1[j] += vb1[j];
          }
          for (let i = 0; i < this.hiddenSize; i++) {
            for (let j = 0; j < this.outputSize; j++) {
              const g = gW2[i][j] + weightDecay * this.W2[i][j];
              vW2[i][j] = momentum * vW2[i][j] - scale * g;
              this.W2[i][j] += vW2[i][j];
            }
          }
          for (let j = 0; j < this.outputSize; j++) {
            vb2[j] = momentum * vb2[j] - scale * gb2[j];
            this.b2[j] += vb2[j];
          }
        }
      }

      const avgLoss = totalLoss / n;
      opts.onEpoch?.(epoch + 1, avgLoss);
    }
  }

  toJSON(): ModelWeights {
    return {
      inputSize: this.inputSize,
      hiddenSize: this.hiddenSize,
      outputSize: this.outputSize,
      W1: this.W1,
      b1: this.b1,
      W2: this.W2,
      b2: this.b2,
    };
  }

  static fromJSON(w: ModelWeights): DoshaNet {
    const net = new DoshaNet(w.inputSize, w.hiddenSize, w.outputSize);
    net.W1 = w.W1;
    net.b1 = w.b1;
    net.W2 = w.W2;
    net.b2 = w.b2;
    return net;
  }
}

function zeros(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => new Array(cols).fill(0));
}

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((z) => Math.exp(z - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}
