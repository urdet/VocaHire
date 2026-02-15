import os
from urllib.parse import quote_plus
from sqlalchemy import create_engine

# Use default values if any are missing
DB_USER = os.getenv('DB_USER', 'postgres')
RAW_DB_PASSWORD = os.getenv('DB_PASSWORD', '')  # password الأصلية
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'vocahire')

# 🔐 Encode password to avoid issues with special characters (., @, :, etc.)
DB_PASSWORD = quote_plus(RAW_DB_PASSWORD)

DATABASE_URL = (
    f"postgresql+psycopg://{DB_USER}:"
    f"{DB_PASSWORD}@"
    f"{DB_HOST}:"
    f"{DB_PORT}/"
    f"{DB_NAME}"
)

# Debug (hide real password)
print(f"Database URL: {DATABASE_URL.replace(DB_PASSWORD, '***')}")

def get_engine():
    return create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        echo=False
    )
