"""
Root conftest — sets required env vars at module level so that pydantic-settings
can load without a real .env file during tests.
"""
import os

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.fake_sig")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.fake_sig")
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test_fake")
os.environ.setdefault("STRIPE_WEBHOOK_SECRET", "whsec_fake")
os.environ.setdefault("STRIPE_PRICE_PRO_MONTHLY", "price_pro_monthly")
os.environ.setdefault("STRIPE_PRICE_PRO_YEARLY", "price_pro_yearly")
os.environ.setdefault("STRIPE_PRICE_STUDIO_MONTHLY", "price_studio_monthly")
os.environ.setdefault("STRIPE_PRICE_STUDIO_YEARLY", "price_studio_yearly")
os.environ.setdefault("AWS_ACCESS_KEY_ID", "fake-key")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "fake-secret")
os.environ.setdefault("AWS_BUCKET_NAME", "test-bucket")
os.environ.setdefault("AI_WORKER_URL", "http://localhost:8001")
os.environ.setdefault("JWT_SECRET", "test-jwt-secret")
os.environ.setdefault("INTERNAL_SECRET", "test-internal-secret")
os.environ.setdefault("ADMIN_SECRET", "test-admin-secret")
