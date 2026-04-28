from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_bucket_name: str
    aws_region: str = "eu-west-3"

    api_url: str
    api_internal_secret: str

    model_id: str = "ACE-Step/ACE-Step-v1.5"
    device: str = "cuda"

    class Config:
        env_file = ".env"


settings = Settings()
