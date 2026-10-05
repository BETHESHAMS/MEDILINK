from sqlalchemy import text
from database import engine


new_columns = {
    "blood_group": "VARCHAR",
    "allergies": "TEXT",
    "medical_conditions": "TEXT",
    "current_medications": "TEXT",
    "previous_surgeries": "TEXT",
    "emergency_contact_name": "VARCHAR",
    "emergency_contact_phone": "VARCHAR"
}


with engine.connect() as connection:

    result = connection.execute(text("PRAGMA table_info(patients)"))

    existing_columns = {
        row[1] for row in result
    }

    for column_name, column_type in new_columns.items():

        if column_name not in existing_columns:

            query = text(
                f"ALTER TABLE patients "
                f"ADD COLUMN {column_name} {column_type}"
            )

            connection.execute(query)

            print(f"Added column: {column_name}")

        else:

            print(f"Already exists: {column_name}")

    connection.commit()


print("Database update completed.")