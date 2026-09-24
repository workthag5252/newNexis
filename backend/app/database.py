from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Fallback gracefully to SQLite if MySQL is not available in local test env
database_url = settings.DATABASE_URL
if database_url.startswith("mysql"):
    try:
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=3600,
        )
        # Test connection
        with engine.connect() as conn:
            pass
    except Exception as e:
        logger.warning(f"Could not connect to MySQL at {database_url}: {e}. Falling back to SQLite for local development.")
        engine = create_engine("sqlite:///./nexus_ai.db", connect_args={"check_same_thread": False})
else:
    engine = create_engine(database_url, connect_args={"check_same_thread": False} if "sqlite" in database_url else {})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
