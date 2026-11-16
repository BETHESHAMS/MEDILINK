
from database import Base
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Boolean,
    DateTime,
    UniqueConstraint
)
from datetime import datetime, timezone


def utc_now():
    return datetime.now(timezone.utc)


class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    age = Column(Integer)
    gender = Column(String)
    phone = Column(String)
    location = Column(String)

    #medical condition
    blood_group = Column(String, nullable=True)
    allergies = Column(Text, nullable=True)
    medical_conditions = Column(Text, nullable=True)
    current_medications = Column(Text, nullable=True)
    previous_surgeries = Column(Text, nullable=True)

    #emergeny contact

    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)

    specialization = Column(String, nullable=False)
    experience = Column(Integer, nullable=False)

    hospital = Column(String, nullable=False)
    location = Column(String, nullable=False)

    availability = Column(String, nullable=False)
    rating = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True, nullable=False)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(Integer, nullable=False)
    doctor_id = Column(Integer, nullable=False)

    appointment_date = Column(String, nullable=False)
    appointment_time = Column(String, nullable=False)

    status = Column(String, default="Booked")

    reason = Column(Text, nullable=True)



class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)

    appointment_id = Column(Integer, nullable=False)
    patient_id = Column(Integer, nullable=False)
    doctor_id = Column(Integer, nullable=False)

    symptoms = Column(Text, nullable=True)
    doctor_notes = Column(Text, nullable=False)
    treatment = Column(Text, nullable=True)
    prescription = Column(Text, nullable=True)
    follow_up_date = Column(String, nullable=True)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    role = Column(String, nullable=False)

    patient_id = Column(Integer, nullable=True)
    doctor_id = Column(Integer, nullable=True)


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)

    appointment_id = Column(Integer, nullable=False)
    patient_id = Column(Integer, nullable=False)
    doctor_id = Column(Integer, nullable=False)

    reminder_type = Column(String, nullable=False)  # "24_HOURS", "2_HOURS", "15_MINUTES", "CUSTOM"
    message = Column(Text, nullable=False)
    scheduled_time = Column(String, nullable=False)
    is_sent = Column(Boolean, default=False)
    sent_at = Column(String, nullable=True)

class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    __table_args__ = (
        UniqueConstraint(
            "patient_id",
            "doctor_id",
            name="uq_patient_doctor_conversation"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(Integer, nullable=False, index=True)
    doctor_id = Column(Integer, nullable=False, index=True)

    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utc_now)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)

    conversation_id = Column(Integer, nullable=False, index=True)
    sender_user_id = Column(Integer, nullable=False)

    message = Column(Text, nullable=False)

    appointment_id = Column(Integer, nullable=True)

    is_read = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utc_now)