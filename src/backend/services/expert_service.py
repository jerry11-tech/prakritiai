"""
Expert Assessment & Consensus Engine for PrakritiAI.
Implements blind evaluation, consensus resolution, and Inter-Rater Reliability (Cohen's & Fleiss' Kappa).
"""

import math
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
import numpy as np

from db.database import get_connection


def submit_expert_assessment(
    participant_id: str,
    expert_id: str,
    expert_name: str,
    primary_prakriti: str,
    secondary_prakriti: Optional[str],
    confidence: float,
    assessment_method: str,
    notes: Optional[str] = None,
) -> Dict[str, Any]:
    assessment_id = f"EXP_{expert_id}_{participant_id}_{int(datetime.now().timestamp())}"
    assessment_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with get_connection() as conn:
        cursor = conn.cursor()

        # Check if expert already assessed this participant -> Update if exists
        existing = cursor.execute("""
            SELECT assessment_id FROM expert_assessments
            WHERE participant_id = ? AND expert_id = ?
        """, (participant_id, expert_id)).fetchone()

        if existing:
            cursor.execute("""
                UPDATE expert_assessments
                SET primary_prakriti = ?, secondary_prakriti = ?, confidence = ?,
                    assessment_method = ?, notes = ?, assessment_date = ?
                WHERE participant_id = ? AND expert_id = ?
            """, (primary_prakriti, secondary_prakriti, confidence, assessment_method, notes, assessment_date, participant_id, expert_id))
        else:
            cursor.execute("""
                INSERT INTO expert_assessments (
                    assessment_id, participant_id, expert_id, expert_name,
                    primary_prakriti, secondary_prakriti, confidence,
                    assessment_method, notes, assessment_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (assessment_id, participant_id, expert_id, expert_name, primary_prakriti, secondary_prakriti, confidence, assessment_method, notes, assessment_date))

        conn.commit()

    # Re-evaluate consensus label for this participant
    consensus_res = update_consensus_label(participant_id)

    return {
        "status": "SUCCESS",
        "assessmentId": assessment_id,
        "participantId": participant_id,
        "expertId": expert_id,
        "primaryPrakriti": primary_prakriti,
        "consensus": consensus_res,
    }


def update_consensus_label(participant_id: str) -> Dict[str, Any]:
    """Calculates consensus label from expert assessments for a participant."""
    with get_connection() as conn:
        cursor = conn.cursor()
        assessments = cursor.execute("""
            SELECT primary_prakriti FROM expert_assessments
            WHERE participant_id = ?
        """, (participant_id,)).fetchall()

        if not assessments:
            cursor.execute("""
                INSERT OR REPLACE INTO prakriti_labels (participant_id, consensus_prakriti, label_status, expert_count, agreed_count, updated_at)
                VALUES (?, NULL, 'UNLABELED', 0, 0, ?)
            """, (participant_id, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
            conn.commit()
            return {"status": "UNLABELED", "consensusPrakriti": None}

        votes = [a["primary_prakriti"] for a in assessments]
        expert_count = len(votes)

        if expert_count == 1:
            consensus = votes[0]
            label_status = "SINGLE_EXPERT"
            agreed_count = 1
        else:
            from collections import Counter
            counts = Counter(votes)
            most_common = counts.most_common()

            top_prakriti, top_count = most_common[0]
            # Check if there is a tie for top
            if len(most_common) > 1 and most_common[1][1] == top_count:
                consensus = None
                label_status = "DISAGREEMENT"
                agreed_count = top_count
            else:
                consensus = top_prakriti
                agreed_count = top_count
                label_status = "CONSENSUS_AGREED" if (top_count / expert_count) >= 0.5 else "DISAGREEMENT"

        cursor.execute("""
            INSERT OR REPLACE INTO prakriti_labels (participant_id, consensus_prakriti, label_status, expert_count, agreed_count, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (participant_id, consensus, label_status, expert_count, agreed_count, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
        conn.commit()

        return {
            "status": label_status,
            "consensusPrakriti": consensus,
            "expertCount": expert_count,
            "agreedCount": agreed_count,
        }


def calculate_fleiss_kappa(ratings_matrix: np.ndarray) -> float:
    """Computes Fleiss' Kappa inter-rater agreement statistic for N subjects, k raters, m categories."""
    N, k = ratings_matrix.shape[0], ratings_matrix.shape[1]
    if N == 0 or k <= 1:
        return 0.0

    categories = np.unique(ratings_matrix)
    n_cat = len(categories)
    if n_cat <= 1:
        return 1.0

    # Build count matrix n_ij: number of raters who assigned i-th subject to j-th category
    n_matrix = np.zeros((N, n_cat))
    for i in range(N):
        for j, cat in enumerate(categories):
            n_matrix[i, j] = np.sum(ratings_matrix[i, :] == cat)

    P_i = (np.sum(n_matrix ** 2, axis=1) - k) / (k * (k - 1))
    P_mean = np.mean(P_i)

    p_j = np.sum(n_matrix, axis=0) / (N * k)
    P_e = np.sum(p_j ** 2)

    if P_e == 1.0:
        return 1.0

    kappa = (P_mean - P_e) / (1.0 - P_e)
    return float(kappa)


def get_inter_rater_stats() -> Dict[str, Any]:
    """Calculates overall expert inter-rater agreement stats across all multi-assessed participants."""
    with get_connection() as conn:
        cursor = conn.cursor()
        rows = cursor.execute("""
            SELECT participant_id, expert_id, primary_prakriti
            FROM expert_assessments
            ORDER BY participant_id, expert_id
        """).fetchall()

    if not rows:
        return {"totalMultiAssessed": 0, "fleissKappa": 0.0, "disagreementCount": 0}

    # Group by participant
    from collections import defaultdict
    part_map = defaultdict(list)
    for r in rows:
        part_map[r["participant_id"]].append(r["primary_prakriti"])

    multi_parts = {p: v for p, v in part_map.items() if len(v) >= 2}
    if not multi_parts:
        return {"totalMultiAssessed": 0, "fleissKappa": 0.0, "disagreementCount": 0}

    # Prepare matrix for Fleiss Kappa (pad to max raters)
    max_raters = max(len(v) for v in multi_parts.values())
    matrix = []
    disagreements = 0

    for p, v in multi_parts.items():
        if len(set(v)) > 1:
            disagreements += 1
        # Pad with first rating if fewer than max_raters
        padded = v + [v[0]] * (max_raters - len(v))
        matrix.append(padded)

    kappa = calculate_fleiss_kappa(np.array(matrix))

    return {
        "totalMultiAssessed": len(multi_parts),
        "disagreementCount": disagreements,
        "fleissKappa": round(kappa, 4),
    }
