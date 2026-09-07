from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError


def build_connection_url(
    engine_type: str,
    username: str,
    password: str,
    host: str,
    port: int,
    database_name: str,
) -> str:
    if engine_type == "postgresql":
        driver = "postgresql+psycopg2"
    elif engine_type == "mysql":
        driver = "mysql+pymysql"
    else:
        raise ValueError(f"Unsupported engine type: {engine_type}")

    return f"{driver}://{username}:{password}@{host}:{port}/{database_name}"


def test_connection(url: str) -> tuple[bool, str]:
    """Try connecting. Returns (success, message)."""
    try:
        engine = create_engine(
            url, connect_args={"connect_timeout": 5} if "postgresql" in url else {}
        )
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "Connection successful"
    except OperationalError as e:
        return False, f"Connection failed: {str(e.orig)}"
    except Exception as e:
        return False, f"Connection failed: {str(e)}"
