"""
PrakritiAI — shared ML toolkit (Python mirror of `src/frontend/src/ml/*.ts`).

Faithfully reproduces the TypeScript pipeline used by the shipped browser app:

    dataset.ts      -> FEATURE_DEFS, generate_dataset, encode_conditions
    model.ts        -> DoshaNet forward + SGD(momentum) and Adam train loops
    evaluate.ts     -> train_test_split, evaluate (confusion matrix, P/R/F1)
    train.ts        -> canonical training recipe
    test-accuracy.ts-> cross-face generalization harness

The notebooks in this folder import from this module so that each notebook
stays focused on explaining *one* model while sharing one source of truth.

Requires only NumPy; matplotlib is optional (used for the plots).
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Callable, Dict, List, Optional, Sequence, Tuple

import numpy as np

DOSHA_NAMES = ["Vata", "Pitta", "Kapha"]


# --------------------------------------------------------------------------
# Deterministic RNG (mulberry32) — port of `createRng` in dataset.ts
# --------------------------------------------------------------------------
def create_rng(seed: int) -> Callable[[], float]:
    state = {"a": seed & 0xFFFFFFFF}

    def rng() -> float:
        state["a"] = (state["a"] + 0x6D2B79F5) & 0xFFFFFFFF
        a = state["a"]
        t = ((a ^ (a >> 15)) * (a | 1)) & 0xFFFFFFFF
        mul = ((t ^ (t >> 7)) * (t | 61)) & 0xFFFFFFFF
        t = ((t + mul) ^ t) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296.0

    return rng


# --------------------------------------------------------------------------
# Ayurvedic feature vocabulary (port of FEATURE_DEFS from dataset.ts).
# For each observational category and each dosha (0=Vata, 1=Pitta, 2=Kapha)
# we store a probability vector over the possible values.
# --------------------------------------------------------------------------
FEATURE_DEFS: List[Dict] = [
    {
        "key": "faceShape",
        "values": ["Oval", "Round", "Square", "Heart", "Oblong"],
        "by_dosha": {
            0: [0.4, 0.05, 0.1, 0.15, 0.3],  # Vata: thin / oblong / oval
            1: [0.2, 0.15, 0.35, 0.25, 0.05],  # Pitta: medium / square / heart
            2: [0.15, 0.55, 0.1, 0.1, 0.1],  # Kapha: round & full
        },
    },
    {
        "key": "darkCircles",
        "values": ["None", "Mild", "Moderate", "Prominent"],
        "by_dosha": {
            0: [0.05, 0.2, 0.4, 0.35],  # Vata: prominent (dryness / poor sleep)
            1: [0.25, 0.4, 0.25, 0.1],  # Pitta: mild to moderate
            2: [0.6, 0.25, 0.1, 0.05],  # Kapha: rarely
        },
    },
    {
        "key": "puffiness",
        "values": ["None", "Mild", "Moderate", "Significant"],
        "by_dosha": {
            0: [0.6, 0.25, 0.1, 0.05],  # Vata: little fluid retention
            1: [0.3, 0.4, 0.2, 0.1],  # Pitta: mild
            2: [0.05, 0.2, 0.4, 0.35],  # Kapha: significant puffiness
        },
    },
    {
        "key": "skinTone",
        "values": ["Fair, Smooth", "Medium, Warm", "Olive, Balanced", "Deep, Rich", "Light, Cool"],
        "by_dosha": {
            0: [0.25, 0.2, 0.1, 0.15, 0.3],  # Vata: light/cool & dry
            1: [0.35, 0.3, 0.15, 0.1, 0.1],  # Pitta: fair-red/warm
            2: [0.15, 0.25, 0.3, 0.25, 0.05],  # Kapha: olive/deep & smooth
        },
    },
    {
        "key": "skinMoisture",
        "values": ["Dry, Rough", "Normal", "Oily, Smooth"],
        "by_dosha": {
            0: [0.7, 0.2, 0.1],  # Vata: dry & rough
            1: [0.15, 0.55, 0.3],  # Pitta: normal (slightly oily)
            2: [0.05, 0.25, 0.7],  # Kapha: oily & smooth
        },
    },
    {
        "key": "hairTexture",
        "values": ["Dry, Frizzy", "Fine, Straight", "Thick, Oily"],
        "by_dosha": {
            0: [0.65, 0.25, 0.1],  # Vata: dry & frizzy
            1: [0.1, 0.7, 0.2],  # Pitta: fine & early greying
            2: [0.05, 0.25, 0.7],  # Kapha: thick & oily
        },
    },
    {
        "key": "bodyFrame",
        "values": ["Thin, Lean", "Medium", "Broad, Heavy"],
        "by_dosha": {
            0: [0.75, 0.2, 0.05],  # Vata: thin, prominent joints
            1: [0.15, 0.65, 0.2],  # Pitta: medium & muscular
            2: [0.05, 0.25, 0.7],  # Kapha: broad & heavy
        },
    },
    {
        "key": "eyeLook",
        "values": ["Small, Dry", "Sharp, Piercing", "Large, Lustrous"],
        "by_dosha": {
            0: [0.65, 0.2, 0.15],  # Vata: small, dry, restless
            1: [0.15, 0.7, 0.15],  # Pitta: sharp & piercing
            2: [0.05, 0.25, 0.7],  # Kapha: large & lustrous
        },
    },
]

INPUT_SIZE = sum(len(d["values"]) for d in FEATURE_DEFS)  # == 30


# One-hot encode a dict of observed conditions into a length-30 bit vector.
def encode_conditions(conditions: Dict[str, str]) -> np.ndarray:
    vec = np.zeros(INPUT_SIZE, dtype=float)
    offset = 0
    for d in FEATURE_DEFS:
        idx = d["values"].index(conditions[d["key"]])
        vec[offset + idx] = 1.0
        offset += len(d["values"])
    return vec


def _weighted_pick(rng: Callable[[], float], weights: Sequence[float]) -> int:
    total = float(sum(weights))
    roll = rng() * total
    for i, w in enumerate(weights):
        roll -= w
        if roll <= 0:
            return i
    return len(weights) - 1


@dataclass
class Sample:
    features: np.ndarray
    label: int
    conditions: Dict[str, str]


def generate_dataset(
    n: int,
    seed: int,
    dominance_p: float = 0.9,
    dual_p: float = 0.5,
) -> List[Sample]:
    """Port of `generateDataset` from dataset.ts.

    dominance_p : probability that a feature in a *dual-dosha* person comes
                  from the dominant dosha (higher => more learnable).
    dual_p      : fraction of the population with a dual-dosha constitution.
    """
    rng = create_rng(seed)
    samples: List[Sample] = []

    for _ in range(n):
        # Dominant dosha with slight class imbalance for realism.
        roll = rng()
        if roll < 0.36:
            label = 0
        elif roll < 0.68:
            label = 1
        else:
            label = 2

        is_dual = rng() < dual_p
        secondary = (label + 1 + int(rng() * 2)) % 3

        conditions: Dict[str, str] = {}
        for d in FEATURE_DEFS:
            source = label if not (is_dual and rng() > dominance_p) else secondary
            value_idx = _weighted_pick(rng, d["by_dosha"][source])
            conditions[d["key"]] = d["values"][value_idx]

        samples.append(Sample(features=encode_conditions(conditions), label=label, conditions=conditions))

    return samples


# --------------------------------------------------------------------------
# The model — port of DoshaNet from model.ts.
#   x -> h = tanh(W1 x + b1) -> z = W2 h + b2 -> p = softmax(z)
# Optimizers: SGD+momentum ("sgd") or Adam with weight decay + LR schedule.
# --------------------------------------------------------------------------
class DoshaNet:
    def __init__(self, input_size: int, hidden_size: int, output_size: int = 3, seed: int = 0):
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        rng = np.random.default_rng(seed)
        scale1 = math.sqrt(2.0 / input_size)   # He-style, for tanh
        scale2 = math.sqrt(2.0 / hidden_size)
        self.W1 = np.random.uniform(-1, 1, (input_size, hidden_size)) * scale1
        self.b1 = np.zeros(hidden_size)
        self.W2 = np.random.uniform(-1, 1, (hidden_size, output_size)) * scale2
        self.b2 = np.zeros(output_size)

    # --- Forward pass -------------------------------------------------
    def forward(self, x: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        h = np.tanh(x @ self.W1 + self.b1)
        logits = h @ self.W2 + self.b2
        logits = logits - np.max(logits, axis=-1, keepdims=True)
        exps = np.exp(logits)
        return h, exps / exps.sum(axis=-1, keepdims=True)

    def predict(self, x: np.ndarray) -> Tuple[int, np.ndarray]:
        """x may be a single vector (ndim 1) or a batch (ndim 2)."""
        single = x.ndim == 1
        if single:
            x = x[None, :]
        _, probs = self.forward(x)
        labels = np.argmax(probs, axis=-1)
        return (int(labels[0]), probs[0]) if single else (labels, probs)

    # --- Training loop (vectorized batch) -----------------------------
    def train(
        self,
        X: Sequence[np.ndarray],
        Y: Sequence[int],
        epochs: int = 200,
        lr: float = 0.004,
        batch_size: int = 128,
        optimizer: str = "adam",
        momentum: float = 0.9,
        weight_decay: float = 0.0,
        lr_decay: float = 0.0,
        min_lr: float = 0.0,
        verbose: bool = True,
        seed: int = 0,
    ) -> List[float]:
        Xm = np.stack(list(X))
        Ym = np.asarray(list(Y), dtype=int)
        n = len(Ym)
        idx = np.arange(n)
        rng = np.random.default_rng(seed)

        # Optimizer state.
        v_w1 = np.zeros_like(self.W1); v_w2 = np.zeros_like(self.W2)
        v_b1 = np.zeros_like(self.b1); v_b2 = np.zeros_like(self.b2)
        m_w1 = np.zeros_like(self.W1); m_w2 = np.zeros_like(self.W2)
        m_b1 = np.zeros_like(self.b1); m_b2 = np.zeros_like(self.b2)
        vf_w1 = np.zeros_like(self.W1); vf_w2 = np.zeros_like(self.W2)
        vf_b1 = np.zeros_like(self.b1); vf_b2 = np.zeros_like(self.b2)
        beta1, beta2, adam_eps = 0.9, 0.999, 1e-8
        step = 0
        losses: List[float] = []

        for epoch in range(epochs):
            e_lr = max(lr * (lr_decay ** epoch), min_lr)
            rng.shuffle(idx)
            total = 0.0
            for start in range(0, n, batch_size):
                bi = idx[start : start + batch_size]
                xb, yb = Xm[bi], Ym[bi]
                B = len(bi)

                # Forward
                h = np.tanh(xb @ self.W1 + self.b1)
                logits = h @ self.W2 + self.b2
                logits -= logits.max(axis=1, keepdims=True)
                exps = np.exp(logits)
                probs = exps / exps.sum(axis=1, keepdims=True)
                total += -np.log(probs[np.arange(B), yb] + 1e-12).sum()

                # Backward (softmax CE: d_out = probs - one-hot)
                tgt = np.zeros((B, self.output_size))
                tgt[np.arange(B), yb] = 1
                d_out = probs - tgt
                g_w2 = h.T @ d_out                      # (hidden, out)
                g_b2 = d_out.sum(axis=0)
                d_hidden = (d_out @ self.W2.T) * (1 - h * h)
                g_w1 = xb.T @ d_hidden                  # (input, hidden)
                g_b1 = d_hidden.sum(axis=0)

                if optimizer == "adam":
                    step += 1
                    c1 = 1 - beta1 ** step
                    c2 = 1 - beta2 ** step
                    for g, m, v, p in (
                        (g_w1, m_w1, vf_w1, self.W1), (g_b1, m_b1, vf_b1, self.b1),
                        (g_w2, m_w2, vf_w2, self.W2), (g_b2, m_b2, vf_b2, self.b2),
                    ):
                        g_eff = g + weight_decay * p
                        m[...] = beta1 * m + (1 - beta1) * g_eff
                        v[...] = beta2 * v + (1 - beta2) * g_eff ** 2
                        p -= e_lr * (m / c1) / (np.sqrt(v / c2) + adam_eps)
                else:  # SGD + momentum
                    scale = e_lr / B
                    for g, v, p in (
                        (g_w1, v_w1, self.W1), (g_b1, v_b1, self.b1),
                        (g_w2, v_w2, self.W2), (g_b2, v_b2, self.b2),
                    ):
                        g_eff = g + weight_decay * p
                        v[...] = momentum * v - scale * g_eff
                        p += v

            loss = total / n
            losses.append(loss)
            if verbose and (epoch + 1) % 25 == 0 or verbose and epoch == epochs - 1:
                print(f"  epoch {epoch + 1:3d}  loss={loss:.4f}")
        return losses

    # --- Serialize in the same format as weights.json ------------------
    def to_dict(self) -> Dict:
        return {
            "inputSize": self.input_size,
            "hiddenSize": self.hidden_size,
            "outputSize": self.output_size,
            "W1": self.W1.tolist(),
            "b1": self.b1.tolist(),
            "W2": self.W2.tolist(),
            "b2": self.b2.tolist(),
        }

    def num_params(self) -> int:
        return int(self.W1.size + self.b1.size + self.W2.size + self.b2.size)


# --------------------------------------------------------------------------
# Evaluation (port of evaluate.ts).
# --------------------------------------------------------------------------
def train_test_split(
    samples: List[Sample], test_ratio: float, seed: int
) -> Tuple[List[np.ndarray], List[int], List[np.ndarray], List[int]]:
    rng = create_rng(seed)
    idx = list(range(len(samples)))
    for i in range(len(idx) - 1, 0, -1):
        j = int(rng() * (i + 1))
        idx[i], idx[j] = idx[j], idx[i]
    n_test = round(len(samples) * test_ratio)
    test_set = set(idx[:n_test])

    xt, yt, xv, yv = [], [], [], []
    for i, s in enumerate(samples):
        (xv if i in test_set else xt).append(s.features)
        (yv if i in test_set else yt).append(s.label)
    return xt, yt, xv, yv


def evaluate(net: DoshaNet, X: Sequence[np.ndarray], Y: Sequence[int]) -> Dict:
    preds, _ = net.predict(np.stack(list(X)))
    cm = np.zeros((net.output_size, net.output_size), dtype=int)
    for y, p in zip(Y, preds):
        cm[y, p] += 1

    per_class_accuracy, precision, recall, f1 = [], [], [], []
    for c in range(net.output_size):
        tp = cm[c, c]
        fp = cm[:, c].sum() - tp
        fn = cm[c].sum() - tp
        prec = tp / (tp + fp) if tp + fp else 0.0
        rec = tp / (tp + fn) if tp + fn else 0.0
        f = 2 * prec * rec / (prec + rec) if prec + rec else 0.0
        per_class_accuracy.append(tp / cm[c].sum() if cm[c].sum() else 0.0)
        precision.append(prec)
        recall.append(rec)
        f1.append(f)

    correct = int((preds == np.asarray(list(Y))).sum())
    return {
        "overall_accuracy": correct / len(Y),
        "correct": correct,
        "total": len(Y),
        "per_class_accuracy": per_class_accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "confusion_matrix": cm,
    }


def fmt_metrics(m: Dict) -> str:
    lines = [
        f"Overall accuracy : {m['overall_accuracy'] * 100:.2f}%  ({m['correct']}/{m['total']})",
        "Confusion matrix (rows=actual, cols=predicted):",
        "  " + "".join(f"{d:>9}" for d in DOSHA_NAMES) + "   %Acc",
    ]
    for c, row in enumerate(m["confusion_matrix"]):
        cells = "".join(f"{int(v):>9}" for v in row)
        lines.append(f"{DOSHA_NAMES[c]:<5}{cells}   {m['per_class_accuracy'][c] * 100:.1f}%")
    lines.append("Per-class Precision / Recall / F1:")
    lines.append("  Dosha   Precision  Recall    F1")
    for c, d in enumerate(DOSHA_NAMES):
        lines.append(
            f"  {d:<8}{m['precision'][c] * 100:>9.1f}%  {m['recall'][c] * 100:>7.1f}%  {m['f1'][c] * 100:>7.1f}%"
        )
    return "\n".join(lines)


def fmt_metric_bars(v: Sequence[float], names: Sequence[str]) -> str:
    return "  ".join(f"{n} {x * 100:4.1f}%" for n, x in zip(names, v))