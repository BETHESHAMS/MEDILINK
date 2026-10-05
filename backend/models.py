from sqlalchemy import Column, Integer, String, Text, Float
from database import Base


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