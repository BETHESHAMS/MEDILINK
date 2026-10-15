from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from fastapi import HTTPException
from database import engine, Base, SessionLocal
import models
from schemas import (
    PatientCreate,
    PatientUpdate,
    DoctorCreate,
    SymptomRequest,
    AppointmentCreate,
    AppointmentUpdate
)


Base.metadata.create_all(bind=engine)


app = FastAPI()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {
        "message": "Welcome to MediLink",
        "status": "running"
    }


@app.post("/patients")
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):

    new_patient = models.Patient(
        name=patient.name,
        email=patient.email,
        age=patient.age,
        gender=patient.gender,
        phone=patient.phone,
        location=patient.location,

        # Medical information
        blood_group=patient.blood_group,
        allergies=patient.allergies,
        medical_conditions=patient.medical_conditions,
        current_medications=patient.current_medications,
        previous_surgeries=patient.previous_surgeries,

        # Emergency contact
        emergency_contact_name=patient.emergency_contact_name,
        emergency_contact_phone=patient.emergency_contact_phone
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return new_patient

@app.put("/patients/{patient_id}")
def update_patient(
    patient_id: int,
    patient: PatientUpdate,
    db: Session = Depends(get_db)
):

    existing_patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id
    ).first()

    if existing_patient is None:
        return {
            "message": "Patient not found"
        }

    if patient.phone is not None:
        existing_patient.phone = patient.phone

    if patient.location is not None:
        existing_patient.location = patient.location

    if patient.blood_group is not None:
        existing_patient.blood_group = patient.blood_group

    if patient.allergies is not None:
        existing_patient.allergies = patient.allergies

    if patient.medical_conditions is not None:
        existing_patient.medical_conditions = patient.medical_conditions

    if patient.current_medications is not None:
        existing_patient.current_medications = patient.current_medications

    if patient.previous_surgeries is not None:
        existing_patient.previous_surgeries = patient.previous_surgeries

    if patient.emergency_contact_name is not None:
        existing_patient.emergency_contact_name = patient.emergency_contact_name

    if patient.emergency_contact_phone is not None:
        existing_patient.emergency_contact_phone = patient.emergency_contact_phone

    db.commit()
    db.refresh(existing_patient)

    return existing_patient


@app.post("/doctors")
def create_doctor(
    doctor: DoctorCreate,
    db: Session = Depends(get_db)
):

    new_doctor = models.Doctor(
        name=doctor.name,
        email=doctor.email,
        phone=doctor.phone,
        specialization=doctor.specialization,
        experience=doctor.experience,
        hospital=doctor.hospital,
        location=doctor.location,
        availability=doctor.availability,
        rating=doctor.rating
    )

    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)

    return new_doctor

@app.get("/doctors")
def get_doctors(db: Session = Depends(get_db)):

    doctors = db.query(models.Doctor).all()

    return doctors


@app.get("/recommend-doctors")
def recommend_doctors(
    specialization: str,
    location: str = None,
    db: Session = Depends(get_db)
):

    query = db.query(models.Doctor).filter(
        models.Doctor.specialization.ilike(f"%{specialization}%")
    )

    # Filter by location if provided
    if location:
        query = query.filter(
            models.Doctor.location.ilike(f"%{location}%")
        )

    doctors = query.all()

    # Rank doctors
    doctors.sort(
        key=lambda doctor: (
            doctor.rating,
            doctor.experience
        ),
        reverse=True
    )

    return doctors

@app.post("/analyze-symptoms")
def analyze_symptoms(data: SymptomRequest):

    symptoms = data.symptoms.lower()

    specialization = "General Physician"
    emergency = False

    # Cardiology
    if any(word in symptoms for word in [
        "chest pain",
        "heart pain",
        "palpitations",
        "shortness of breath"
    ]):
        specialization = "Cardiologist"

    # Dermatology
    elif any(word in symptoms for word in [
        "skin rash",
        "rash",
        "itching",
        "acne",
        "skin"
    ]):
        specialization = "Dermatologist"

    # Orthopedics
    elif any(word in symptoms for word in [
        "bone pain",
        "joint pain",
        "back pain",
        "knee pain",
        "fracture"
    ]):
        specialization = "Orthopedic"

    # Neurology
    elif any(word in symptoms for word in [
        "seizure",
        "migraine",
        "numbness",
        "memory loss"
    ]):
        specialization = "Neurologist"

    # Emergency symptoms
    if any(word in symptoms for word in [
        "severe chest pain",
        "unconscious",
        "cannot breathe",
        "difficulty breathing",
        "heavy bleeding",
        "stroke"
    ]):
        emergency = True

    return {
        "symptoms": data.symptoms,
        "recommended_specialization": specialization,
        "emergency": emergency
    }



@app.get("/patients/{patient_id}/appointments")
def get_patient_appointments(
    patient_id: int,
    db: Session = Depends(get_db)
):

    appointments = db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient_id
    ).all()

    return appointments


@app.get("/doctors/{doctor_id}/appointments")
def get_doctor_appointments(
    doctor_id: int,
    db: Session = Depends(get_db)
):

    appointments = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor_id
    ).all()

    return appointments


@app.post("/appointments")
def create_appointment(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db)
):

    # 1. Check if patient exists
    patient = db.query(models.Patient).filter(
        models.Patient.id == appointment.patient_id
    ).first()

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # 2. Check if doctor exists
    doctor = db.query(models.Doctor).filter(
        models.Doctor.id == appointment.doctor_id
    ).first()

    if doctor is None:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    # 3. Check if doctor is already booked
    existing_appointment = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == appointment.doctor_id,
        models.Appointment.appointment_date == appointment.appointment_date,
        models.Appointment.appointment_time == appointment.appointment_time,
        models.Appointment.status == "Booked"
    ).first()

    if existing_appointment:
        raise HTTPException(
            status_code=409,
            detail="Doctor is already booked at this date and time"
        )

    # 4. Create appointment
    new_appointment = models.Appointment(
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        appointment_date=appointment.appointment_date,
        appointment_time=appointment.appointment_time,
        reason=appointment.reason,
        status="Booked"
    )

    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    return new_appointment