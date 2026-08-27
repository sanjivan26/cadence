from app.core.database import SessionLocal
from app.services.seed import seed_initial_data


def main():
    db = SessionLocal()

    try:
        seed_initial_data(db)
        print("Database seeded successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    main()