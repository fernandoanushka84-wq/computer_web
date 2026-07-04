import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', '.env'))

DB_TYPE = os.getenv('DB_TYPE', 'mysql').lower()
DATABASE_URL = os.getenv('DATABASE_URL', '').strip()
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'computer_shop')
DB_ECHO = os.getenv('DB_ECHO', 'false').lower() in ('1', 'true', 'yes')

if DB_TYPE == 'sqlite':
    if not DATABASE_URL:
        database_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'database', 'computer_shop.db')
        DATABASE_URL = f"sqlite:///{os.path.abspath(database_path)}"
    engine = create_engine(DATABASE_URL, echo=DB_ECHO, connect_args={"check_same_thread": False})
else:
    if not DATABASE_URL:
        DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        BASE_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/"

        def ensure_database_exists() -> None:
            admin_engine = create_engine(BASE_DATABASE_URL, echo=False)
            try:
                with admin_engine.connect() as connection:
                    connection.execute(text(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}`"))
            finally:
                admin_engine.dispose()

        ensure_database_exists()

    engine = create_engine(DATABASE_URL, echo=DB_ECHO)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
