# PrakritiAI — Issues Faced & How We Solved Them

This document is a running log of the problems hit while running and improving
PrakritiAI, what the root cause was, and the concrete fix we used. It is meant
so that anyone (including us, later) can avoid retreading the same ground.

---

## 1. Project would not run — dependencies missing

**Symptom**: `pnpm dev` could not start; no `node_modules` existed after cloning.

**Root cause**: Dependencies were never installed.

**Solution**: Run the workspace install first, then start the server, then
verify with an HTTP probe rather than assuming:
```powershell
pnpm install --prefer-offline
cd src/frontend
pnpm dev          # verify with Invoke-WebRequest http://localhost:5173 -> 200
```
**Takeaway**: "Running the project" = install → start → probe. The probe is the
only thing that proves it is actually serving.

---

## 2. Baseline model was underfitting and weak on Pitta

**Symptom**: held-out accuracy only 74.9%; training loss still high; Pitta class
sat at **69.9%** cross-face accuracy.

**Root cause (two-part)**:
1. **Undercapacity/underfitting** — a 24-unit tanh MLP with fixed-LR SGD cannot
   model the structured dual-dosha feature mixing.
2. **Data noise** — with `dominanceP=0.78` and `dualP=0.6`, a large share of
   faces were internally ambiguous, dragging achievable accuracy down.

**Solution**:
- Better optimizer: **Adam + L2 weight decay + geometric LR schedule**.
- More capacity: hidden 24 → 64.
- More learnable, still-Ayurvedic data: `dominanceP=0.90, dualP=0.50`.

**Result**: held-out 74.9% → 85.5%; Pitta 69.9% → 79.1%.

---

## 3. Model-only tuning hit a hard plateau (~77%)

**Symptom**: sweeping hidden sizes 24→96 and epochs 80→250 with the best
optimizer changed almost nothing — every config landed at 74–77%.

**Root cause**: The accuracy ceiling was **not** in the model — it was in the
*synthetic data generator*. Dual-dosha faces drawn with `dominanceP=0.78`
produce label ambiguity that no classifier can resolve. No amount of model
capacity can exceed a noisy data ceiling.

**Solution**: Stop optimizing the model; fix the data. We parameterized
`generateDataset(n, seed, dominanceP, dualP)` and measured how the ceiling moved:
0.85 → ~82% cross-face, 0.90 → ~85%. That partition of the problem (data vs
model) was the key insight.

---

## 4. High variance across face populations (std ~1.7%)

**Symptom**: per-population accuracy jumped around (76.9% → 81.0% depending on
seed); a single test split would have been misleading.

**Root cause**: Single held-out splits are noisy; small model + noisy data made
results seed-dependent.

**Solution**: Evaluate with a **cross-face harness** — train once, then test on
several *independent* populations (5–6 seeds, 800–1000 faces each) and report
mean **and** std deviation. We then chose a config that was not just
high-accuracy but *stable* (final std: 0.50%).

---

## 5. Train/test generalization gap was large (89% vs 75%)

**Symptom**: 14-point gap between train and test accuracy — the model was
memorizing at least partially instead of generalizing.

**Root cause**: Small dataset relative to capacity, fixed LR SGD that over-fits late.

**Solution**: L2 weight decay + LR schedule keep weights small and let the model
settle gently. The gap shrank to ~9 points while *both* numbers improved.

---

## 6. Python mirror had a gradient-shape bug

**Symptom**: runtime `ValueError: operands could not be broadcast together with
shapes (64,30) (30,64)` while building the notebook toolkit.

**Root cause**: For a linear layer `out = x @ W`, the gradient must be
`xᵀ @ d_out` — I had written `d_outᵀ @ x`, producing a transposed gradient.

**Solution**: `g_w1 = xb.T @ d_hidden` (and checked W2's gradient by the same
rule). Lesson: verify *every* matrix multiply's shapes against the parameter
shapes in the first smoke test, not at the end.

---

## 7. `pnpm check` (biome) fails across the whole repo

**Symptom**: `biome check src` reports **92 formatting errors across 77 files**,
in files we never touched (CRLF churn, formatting drift).

**Root cause**: Pre-existing repo state — the codebase was never fully biome-formatted.

**Solution/conclusion**: Don't "fix" unrelated files (would create a huge,
noisy diff). Instead:
- confirmed **none** of our edited files (`model.ts`, `dataset.ts`, `train.ts`,
  `classifier.ts`, `evaluate.ts`, `types.ts`) appeared in the diagnostics;
- used `pnpm typecheck` + `pnpm build` as the real gates.

---

## 8. PowerShell mangled text when patching the notebook

**Symptom**: inline `python -c "..."` with nested quotes/unicode produced a
corrupted apostrophe (`dosha�s`) and, on another attempt, a
"terminator missing" parser error.

**Root cause**: Mixing PowerShell quoting rules with Python string escapes.

**Solution**: Write a small **patch script file** (via the file tool) and run it
with `python patch.py` instead of fighting inline quoting. Then grep to confirm
the fix landed.

---

## 9. Hand-writing `.ipynb` JSON was error-prone

**Symptom**: the risk of invalid JSON / mangled string escapes when authoring
Jupyter notebooks by hand.

**Root cause**: Notebooks are JSON with heavily-escaped, multi-line code cells.

**Solution**: Generated them with a **Node builder script** that splits source
lines and serializes valid `nbformat` 4.5, then **executed every code cell** in a
headless runner to prove the notebooks run and reproduce the claimed accuracy.

---

## 10. Running TypeScript snippets in plain Node

**Symptom/context**: the ML scripts import with `.ts` extensions and run via
`node src/ml/train.ts`.

**Resolution**: Node v24 strips types natively, so no build step is needed.
On Node < 22.6 you would need `--experimental-strip-types` or a build step —
documented so this doesn't become a mystery later.