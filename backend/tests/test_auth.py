from app.main import hash_password, verify_password


def test_password_hashing_round_trip():
    raw = "SuperSecure123"
    hashed = hash_password(raw)

    assert hashed != raw
    assert verify_password(raw, hashed)
    assert not verify_password("wrong-password", hashed)
