from pydantic import BaseModel, Field
from typing import Optional
from pydantic import BaseModel, Field, field_validator

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

class PatientRegister(BaseModel):
    # Patient details
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

    # Login credentials
    password: str = Field(min_length=8)


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

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    experience: Optional[int] = None
    hospital: Optional[str] = None
    location: Optional[str] = None
    availability: Optional[str] = None
    rating: Optional[float] = None

class DoctorAccountCreate(BaseModel):
    doctor_id: int
    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value):
        if not value.strip():
            raise ValueError("Password cannot contain only spaces")
        return value


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



class ConsultationCreate(BaseModel):
    appointment_id: int
    symptoms: Optional[str] = None
    doctor_notes: str
    treatment: Optional[str] = None
    prescription: Optional[str] = None
    follow_up_date: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str
