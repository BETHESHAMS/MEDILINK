from pydantic import BaseModel
from typing import Optional


class PatientCreate(BaseModel):
    name: str
    email: str
    age: int
    gender: str
    phone: str
    location: str

    # Medical information
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None
    current_medications: Optional[str] = None
    previous_surgeries: Optional[str] = None

    # Emergency contact
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None


class PatientUpdate(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None

    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None
    current_medications: Optional[str] = None
    previous_surgeries: Optional[str] = None

    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None


class DoctorCreate(BaseModel):
    name: str
    email: str
    phone: str

    specialization: str
    experience: int

    hospital: str
    location: str

    availability: str
    rating: Optional[float] = 0.0


class SymptomRequest(BaseModel):
    symptoms: str


class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_date: str
    appointment_time: str
    reason: str | None = None

class AppointmentUpdate(BaseModel):
    status: str