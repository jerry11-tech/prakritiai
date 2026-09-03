# PrakritiAI — Learnings

This folder captures what we actually learned from building, running, and
optimizing PrakritiAI. It is not a recap of the code — it is the transferable
knowledge.

---

## 1. Always measure a baseline before you change anything

We recorded 74.9% held-out / 77.98% cross-face **before** touching the model.
Without that number, "we improved it" would have been a feeling, not a fact.
Every later experiment was compared to this same split and the same 5–6
independent populations.

**Rule**: freeze the evaluation protocol first, then iterate.

---

## 2. The data ceiling is often the real bottleneck

Sweeping hidden sizes, epochs, and even switching to Adam barely moved
accuracy. The plateau at ~77% was a **data-coherence ceiling**, not a model
ceiling. Parameterizing `dominanceP` and `dualP` immediately lifted the
ceiling to ~85%.

**Rule**: if a well-tuned model saturates, inspect the *data generating
process* before adding more layers.

---

## 3. Dual-dosha mixing is structured, not random

Ayurveda's dual-dosha (dvandvaja) constitutions are **coherent**: a person
has a *fixed* secondary dosha, not a random mix of all three. Modeling that
structure (one secondary, sampled consistently) is what makes the class
learnable. Random mixing would have been unlearnable.

**Rule**: domain knowledge belongs in the data generator, not just in the
model.

---

## 4. Evaluate on independent populations, not one test split

A 4-point swing between two seeds (76.9% vs 81.0%) would have let us pick a
lucky config. The **cross-face harness** (train once, test on 6 unseen
populations, report mean + std) is what made the 85.1% ± 0.5% number
trustworthy.

**Rule**: report mean *and* variance across independent draws of the data.

---

## 5. Optimizer + regularization + schedule beat "just more epochs"

SGD with a fixed LR either underfits (too small) or overfits late (too
large). Adam's per-parameter adaptive steps, L2 weight decay, and a
geometric LR schedule together:
- dropped training loss from ~1.0 → ~0.45,
- shrank the train/test gap from 14pt → 9pt,
- and did it in the same 200-epoch budget.

**Rule**: treat optimizer, regularization, and schedule as first-class
hyperparameters, not afterthoughts.

---

## 6. Keep the inference API frozen while you change the trainer

`classifier.ts` (the browser) only ever calls `predict` and `fromJSON`.
Everything we added (Adam, L2, LR schedule, extra options) lived *inside*
`train()`. That meant we could retrain and drop in a new `weights.json`
without touching a single line of UI.

**Rule**: isolate training-time complexity behind a frozen inference
interface.

---

## 7. A tiny, well-understood model is enough for this task

The shipping model has **2,179 parameters** (30 → 64 tanh → 3 softmax) and
runs in the browser with no TensorFlow/PyTorch. For a 30-dim one-hot
categorical problem, a 2-layer MLP is the right tool. Bigger would have
overfit the 3,000 training samples.

**Rule**: match model capacity to the *true* dimensionality of the problem.

---

## 8. Reproducibility is a first-class feature

- Seeded `mulberry32` RNG so every dataset is bit-identical given a seed.
- Same TypeScript code path for Node (train) and browser (infer).
- Python `prakriti_ml.py` is a faithful port, not a "similar" rewrite.
- Notebooks were **executed**, not just written.

**Rule**: if you cannot regenerate the number, you do not own the number.

---

## 9. Don't "fix" unrelated lint to look busy

`biome check` reported 92 pre-existing formatting errors. Reformatting 77
unrelated files would have drowned the real change in noise. We verified
our files were clean and used `typecheck` + `build` as the gates.

**Rule**: only change what you own; don't launder the repo.

---

## 10. Tooling quirks are part of the work

- Node v24 strips TypeScript natively — `node src/ml/train.ts` just works.
- PowerShell quoting + Unicode is a trap; write a small `.py` file instead
  of fighting `python -c`.
- Jupyter notebooks are JSON; generate them with a builder, then execute
  every cell to prove they run.

**Rule**: pick the simplest tool that cannot silently fail.

---

## 11. Explainability is a deliverable, not a nice-to-have

Three notebooks, one per model, with the math of the forward/backward pass,
the Ayurvedic feature tables, and a side-by-side comparison. Anyone can
open `03_optimized_doshanet.ipynb` and see *why* 85% is the number, not
just that it is.

**Rule**: if you cannot explain the model, you cannot defend the result.

---

## 12. The questionnaire still carries most of the weight

The facial model is fused at **35%** with the 12-question tally at 65%
(`fuseScores` in `classifier.ts`). That is a product decision, not an ML
one: a questionnaire is a more reliable signal of constitution than a
simulated face. The ML model *adjusts* the outcome; it does not dominate it.

**Rule**: blend model output with the stronger, cheaper signal when you
have one.