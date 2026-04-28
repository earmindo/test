from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    redis_url: str

    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str

    stripe_secret_key: str
    stripe_webhook_secret: str
    stripe_price_pro_monthly: str
    stripe_price_pro_yearly: str
    stripe_price_studio_monthly: str
    stripe_price_studio_yearly: str

    aws_access_key_id: str
    aws_secret_access_key: str
    aws_bucket_name: str
    aws_region: str = "eu-west-3"

    ai_worker_url: str
    jwt_secret: str
    # Dedicated secret for worker→api internal calls. Falls back to jwt_secret if unset.
    internal_secret: str = ""
    cors_origins: str = "http://localhost:3000"
    revenuecat_webhook_secret: str = ""
    resend_api_key: str = ""
    app_url: str = "https://musicai.app"
    # Must be overridden in production — no sane default to prevent accidents.
    admin_secret: str = ""

    @property
    def effective_internal_secret(self) -> str:
        return self.internal_secret or self.jwt_secret

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
