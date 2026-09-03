"""
Comprehensive RBAC Security & Boundary Test Suite for PrakritiAI.

Verifies:
  1. USER -> Admin API (403 Forbidden)
  2. USER -> Expert API (403 Forbidden)
  3. USER -> Other user's test data (403 Forbidden / IDOR prevention)
  4. USER -> Role Escalation Attempt (Forced to USER role)
  5. EXPERT -> Admin API (403 Forbidden)
  6. EXPERT -> Unauthorized Specialization Domain (403 Forbidden)
  7. ADMIN -> Admin API (200 OK)
  8. ADMIN -> Expert & User Management (200 OK)
  9. Brute Force Protection (Lockout after 5 failed attempts -> 429)
  10. Security Audit Logging Verification
"""

import sys
import os
import time
import requests

BASE_URL = "http://127.0.0.1:8000"


def run_security_tests():
    print("=" * 70)
    print("[SEC] RUNNING PRAKRITIAI RBAC SECURITY & BOUNDARY TEST SUITE")
    print("=" * 70)

    session = requests.Session()

    # -----------------------------------------------------------------------
    # Step 1: Login as Admin (Level 3)
    # -----------------------------------------------------------------------
    print("\n[Test 1] Logging in as Level-3 ADMIN (admin@prakritiai.org / admin123)...")
    res = session.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@prakritiai.org", "password": "admin123"})
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    admin_token = res.json()["token"]
    print("[PASS] ADMIN login successful. Token acquired.")

    # -----------------------------------------------------------------------
    # Step 2: Test ADMIN -> Admin API (Should succeed - 200 OK)
    # -----------------------------------------------------------------------
    print("\n[Test 2] ADMIN accessing /api/admin/users & /api/admin/audit-logs...")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    r_users = session.get(f"{BASE_URL}/api/admin/users", headers=admin_headers)
    assert r_users.status_code == 200, f"ADMIN list users failed: {r_users.text}"
    
    r_audit = session.get(f"{BASE_URL}/api/admin/audit-logs", headers=admin_headers)
    assert r_audit.status_code == 200, f"ADMIN audit logs failed: {r_audit.text}"
    print("[PASS] ADMIN access to Admin endpoints verified (200 OK).")

    # -----------------------------------------------------------------------
    # Step 3: Register & Login standard User A (Level 1)
    # -----------------------------------------------------------------------
    user_a_email = f"usera_{int(time.time())}@test.com"
    print(f"\n[Test 3] Registering User A ({user_a_email})...")
    res_reg_a = session.post(f"{BASE_URL}/api/auth/register", json={"name": "User A", "email": user_a_email, "password": "password123"})
    assert res_reg_a.status_code == 200, f"User A registration failed: {res_reg_a.text}"
    token_a = res_reg_a.json()["token"]
    user_a_id = res_reg_a.json()["user"]["id"]
    headers_a = {"Authorization": f"Bearer {token_a}"}
    print(f"[PASS] User A registered (ID={user_a_id}, Role=USER).")

    # -----------------------------------------------------------------------
    # Step 4: Register & Login standard User B (Level 1)
    # -----------------------------------------------------------------------
    user_b_email = f"userb_{int(time.time())}@test.com"
    print(f"\n[Test 4] Registering User B ({user_b_email})...")
    res_reg_b = session.post(f"{BASE_URL}/api/auth/register", json={"name": "User B", "email": user_b_email, "password": "password123"})
    assert res_reg_b.status_code == 200, f"User B registration failed: {res_reg_b.text}"
    token_b = res_reg_b.json()["token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}
    print(f"[PASS] User B registered (ID={res_reg_b.json()['user']['id']}, Role=USER).")

    # User A creates a test result
    print("\n[Test 4.1] User A running Prakriti analysis...")
    res_test = session.post(
        f"{BASE_URL}/api/prakriti/analyze",
        json={"answers": {"q1": "Thin & light body", "q2": "Dry & rough skin"}},
        headers=headers_a,
    )
    assert res_test.status_code == 200, f"User A analysis failed: {res_test.text}"
    test_id_a = res_test.json()["test_id"]
    print(f"[PASS] Created Test ID: {test_id_a} for User A.")

    # -----------------------------------------------------------------------
    # Step 5: Test USER -> Admin API (Must return 403 Forbidden)
    # -----------------------------------------------------------------------
    print("\n[Test 5] Boundary Test: USER A calling Admin API /api/admin/users...")
    res_u_admin = session.get(f"{BASE_URL}/api/admin/users", headers=headers_a)
    assert res_u_admin.status_code == 403, f"SECURITY BREACH: USER accessed Admin API! Got {res_u_admin.status_code}"
    print(f"[PASS] Protected! USER -> Admin API returned 403 Forbidden.")

    # -----------------------------------------------------------------------
    # Step 6: Test USER -> Expert API (Must return 403 Forbidden)
    # -----------------------------------------------------------------------
    print("\n[Test 6] Boundary Test: USER A calling Expert API /api/expert/dashboard...")
    res_u_expert = session.get(f"{BASE_URL}/api/expert/dashboard", headers=headers_a)
    assert res_u_expert.status_code == 403, f"SECURITY BREACH: USER accessed Expert API! Got {res_u_expert.status_code}"
    print(f"[PASS] Protected! USER -> Expert API returned 403 Forbidden.")

    # -----------------------------------------------------------------------
    # Step 7: Test USER -> Other User's Data / IDOR Prevention (Must return 403 Forbidden)
    # -----------------------------------------------------------------------
    print(f"\n[Test 7] IDOR Test: USER B attempting to view User A's test ({test_id_a})...")
    res_idor = session.get(f"{BASE_URL}/api/prakriti/tests/{test_id_a}", headers=headers_b)
    assert res_idor.status_code == 403, f"SECURITY BREACH: USER B accessed User A's data! Got {res_idor.status_code}"
    print(f"[PASS] Protected! IDOR attempt returned 403 Forbidden.")

    # -----------------------------------------------------------------------
    # Step 8: Privilege Escalation Test (Must reject role modification)
    # -----------------------------------------------------------------------
    print("\n[Test 8] Privilege Escalation Test: Attempting register payload with 'role': 'ADMIN'...")
    hacker_email = f"hacker_{int(time.time())}@test.com"
    res_hack = session.post(f"{BASE_URL}/api/auth/register", json={"name": "Hacker", "email": hacker_email, "password": "password123", "role": "ADMIN"})
    assert res_hack.status_code == 200
    assigned_role = res_hack.json()["user"]["role"]
    assert assigned_role == "USER", f"SECURITY BREACH: Public register accepted role escalation to '{assigned_role}'!"
    print(f"[PASS] Protected! Payload requesting 'ADMIN' role was safely forced to '{assigned_role}'.")

    # -----------------------------------------------------------------------
    # Step 9: Login as Pitta Expert (Level 2)
    # -----------------------------------------------------------------------
    print("\n[Test 9] Logging in as Pitta Expert (pitta.expert@ayurveda.org)...")
    res_exp = session.post(f"{BASE_URL}/api/expert/login", json={"email": "pitta.expert@ayurveda.org", "password": "expert123"})
    assert res_exp.status_code == 200, f"Pitta Expert login failed: {res_exp.text}"
    token_pitta = res_exp.json()["token"]
    headers_pitta = {"Authorization": f"Bearer {token_pitta}"}
    print("[PASS] Pitta Expert login successful.")

    # -----------------------------------------------------------------------
    # Step 10: EXPERT -> Admin API (Must return 403 Forbidden)
    # -----------------------------------------------------------------------
    print("\n[Test 10] Boundary Test: EXPERT calling Admin API /api/admin/audit-logs...")
    res_exp_admin = session.get(f"{BASE_URL}/api/admin/audit-logs", headers=headers_pitta)
    assert res_exp_admin.status_code == 403, f"SECURITY BREACH: EXPERT accessed Admin API! Got {res_exp_admin.status_code}"
    print(f"[PASS] Protected! EXPERT -> Admin API returned 403 Forbidden.")

    # -----------------------------------------------------------------------
    # Step 11: EXPERT -> Unauthorized Specialization Domain Test
    # Create a Vata-dominant test specifically for this boundary check
    # -----------------------------------------------------------------------
    print("\n[Test 11] Specialization Boundary Test: Pitta Expert attempting to view/verify Vata domain resource...")
    # Create a Vata test in DB manually or via API
    vata_test_id = f"T_VATA_{int(time.time())}"
    with requests.get(f"{BASE_URL}/api/health") as h:
        # Insert a dummy Vata test into SQLite
        import sqlite3
        db_p = os.path.join(os.path.dirname(__file__), "..", "src", "backend", "db", "prakriti.db")
        with sqlite3.connect(db_p) as conn:
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO prakriti_tests (id, user_id, vata_score, pitta_score, kapha_score, dominant_dosha, ai_confidence, created_at)
                VALUES (?, ?, 80.0, 10.0, 10.0, 'Vata', 90.0, '2026-08-31 00:00:00')
            """, (vata_test_id, user_a_id))
            conn.commit()

    res_domain = session.get(f"{BASE_URL}/api/expert/tests/{vata_test_id}", headers=headers_pitta)
    assert res_domain.status_code == 403, f"SECURITY BREACH: Pitta expert accessed Vata test! Got {res_domain.status_code}"
    print(f"[PASS] Protected! Pitta Expert accessing Vata test returned 403 Forbidden.")

    # -----------------------------------------------------------------------
    # Step 12: Brute-Force Lockout Test (5 failed attempts -> 429)
    # -----------------------------------------------------------------------
    print("\n[Test 12] Brute-Force Protection Test: 5 consecutive failed login attempts...")
    target_dummy_email = f"bruteforce_{int(time.time())}@test.com"
    session.post(f"{BASE_URL}/api/auth/register", json={"name": "Dummy", "email": target_dummy_email, "password": "correct_password"})

    for i in range(1, 6):
        r_fail = session.post(f"{BASE_URL}/api/auth/login", json={"email": target_dummy_email, "password": "wrong_password"})
        print(f"  Attempt {i}: HTTP {r_fail.status_code}")

    r_locked = session.post(f"{BASE_URL}/api/auth/login", json={"email": target_dummy_email, "password": "correct_password"})
    assert r_locked.status_code == 429, f"Brute force failed to lock account! Got {r_locked.status_code}"
    print(f"[PASS] Protected! Account locked after 5 failed attempts (429 Too Many Requests).")

    # -----------------------------------------------------------------------
    # Step 13: Audit Log Verification
    # -----------------------------------------------------------------------
    print("\n[Test 13] Verifying Security Audit Log entries...")
    res_audit_check = session.get(f"{BASE_URL}/api/admin/audit-logs?limit=50", headers=admin_headers)
    assert res_audit_check.status_code == 200
    logs = res_audit_check.json()["logs"]
    assert len(logs) > 0, "No audit logs found!"
    print(f"[PASS] Security Audit Log active. Total recorded entries: {res_audit_check.json()['total']}.")
    print("\n" + "=" * 70)
    print("SUCCESS: ALL 13 RBAC SECURITY BOUNDARY & PRIVILEGE TESTS PASSED 100%")
    print("=" * 70)


if __name__ == "__main__":
    run_security_tests()
