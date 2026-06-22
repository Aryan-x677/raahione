from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "RaahiOne Commute API"
    database_url: str 
    secret_key: str 
    algorithm: str 
    access_token_expire_minutes: int 
    admin_registration_key: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
