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

  // Trains via mini-batch SGD with momentum.
  train(
    X: number[][],
    Y: number[],
    opts: {
      epochs?: number;
      lr?: number;
      batchSize?: number;
      momentum?: number;
      onEpoch?: (epoch: number, loss: number) => void;
    } = {},
  ) {
    const epochs = opts.epochs ?? 60;
    const lr = opts.lr ?? 0.15;
    const batchSize = opts.batchSize ?? 32;
    const momentum = opts.momentum ?? 0.9;

    // Momentum buffers.
    const vW1 = zeros(this.inputSize, this.hiddenSize);
    const vb1 = new Array(this.hiddenSize).fill(0);
    const vW2 = zeros(this.hiddenSize, this.outputSize);
    const vb2 = new Array(this.outputSize).fill(0);

    const n = X.length;
    const idx = Array.from({ length: n }, (_, i) => i);

    for (let epoch = 0; epoch < epochs; epoch++) {
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

        // Apply gradients with momentum.
        const scale = lr / size;
        for (let i = 0; i < this.inputSize; i++) {
          for (let j = 0; j < this.hiddenSize; j++) {
            vW1[i][j] = momentum * vW1[i][j] - scale * gW1[i][j];
            this.W1[i][j] += vW1[i][j];
          }
        }
        for (let j = 0; j < this.hiddenSize; j++) {
          vb1[j] = momentum * vb1[j] - scale * gb1[j];
          this.b1[j] += vb1[j];
        }
        for (let i = 0; i < this.hiddenSize; i++) {
          for (let j = 0; j < this.outputSize; j++) {
            vW2[i][j] = momentum * vW2[i][j] - scale * gW2[i][j];
            this.W2[i][j] += vW2[i][j];
          }
        }
        for (let j = 0; j < this.outputSize; j++) {
          vb2[j] = momentum * vb2[j] - scale * gb2[j];
          this.b2[j] += vb2[j];
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
