from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from fastapi import HTTPException
from database import engine, Base, SessionLocal

from datetime import datetime, date, time, timedelta, timedelta, timezone
from fastapi import Query

from pwdlib import PasswordHash
from schemas import  UserLogin, PatientRegister, DoctorUpdate


from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from jwt.exceptions import InvalidTokenError

from sqlalchemy.exc import IntegrityError



import os

import jwt
from fastapi import HTTPException

from schemas import UserLogin


import models
from schemas import (
    DoctorAccountCreate,
    PatientUpdate,
    DoctorCreate,
    SymptomRequest,
    AppointmentCreate,
    AppointmentUpdate,
    ConsultationCreate
)


password_hash = PasswordHash.recommended()

SECRET_KEY = os.getenv("MEDILINK_SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "MEDILINK_SECRET_KEY environment variable is not set"
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(user):
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user.id),
        "role": user.role,
        "patient_id": user.patient_id,
        "doctor_id": user.doctor_id,
        "exp": expires_at
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

Base.metadata.create_all(bind=engine)


app = FastAPI()

bearer_scheme = HTTPBearer()



def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = int(payload.get("sub"))

    except (InvalidTokenError, TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user

def require_role(required_role: str):
    def role_checker(
        current_user: models.User = Depends(get_current_user)
    ):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to access this resource"
            )

        return current_user

    return role_checker
def require_admin(
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user

@app.get("/me")
def get_my_profile(
    current_user: models.User = Depends(get_current_user)
):
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "patient_id": current_user.patient_id,
        "doctor_id": current_user.doctor_id
    }



@app.get("/")
def home():
    return {
        "message": "Welcome to MediLink",
        "status": "running"
    }




@app.put("/patients/{patient_id}")
def update_patient(
    patient_id: int,
    patient: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient"))
):
        # Verify that the logged-in patient owns this profile
    if current_user.patient_id != patient_id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own profile"
        )

    existing_patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id
    ).first()

    if existing_patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

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

@app.get("/patients/{patient_id}")
def get_patient_profile(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient"))
):
    # Verify that the logged-in patient owns this profile
    if current_user.patient_id != patient_id:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own profile"
        )

    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id
    ).first()

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return {
        "id": patient.id,
        "name": patient.name,
        "email": patient.email,
        "age": patient.age,
        "gender": patient.gender,
        "phone": patient.phone,
        "location": patient.location,
        "blood_group": patient.blood_group,
        "allergies": patient.allergies,
        "medical_conditions": patient.medical_conditions,
        "current_medications": patient.current_medications,
        "previous_surgeries": patient.previous_surgeries,
        "emergency_contact_name": patient.emergency_contact_name,
        "emergency_contact_phone": patient.emergency_contact_phone
    }



@app.post("/doctors")
def create_doctor(
    doctor: DoctorCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
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




@app.post("/doctors/create-account")
def create_doctor_account(
    account: DoctorAccountCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    # Find the existing doctor profile
    doctor = db.query(models.Doctor).filter(
        models.Doctor.id == account.doctor_id
    ).first()

    if doctor is None:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    # Check whether this doctor already has an account
    existing_doctor_user = db.query(models.User).filter(
        models.User.doctor_id == doctor.id
    ).first()

    if existing_doctor_user:
        raise HTTPException(
            status_code=409,
            detail="This doctor already has a login account"
        )

    # Check whether the email is already registered
    email = doctor.email.strip().lower()

    existing_email = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=409,
            detail="This email is already registered"
        )

    # Create the doctor's login account
    new_user = models.User(
        email=email,
        hashed_password=password_hash.hash(account.password),
        role="doctor",
        patient_id=None,
        doctor_id=doctor.id
    )

    db.add(new_user)

    try:
        db.commit()
        db.refresh(new_user)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="An account with this email or doctor ID already exists"
        )

    return {
        "message": "Doctor account created successfully",
        "user_id": new_user.id,
        "doctor_id": doctor.id,
        "email": new_user.email,
        "role": new_user.role
    }




@app.put("/doctors/{doctor_id}")
def update_doctor(
    doctor_id: int,
    doctor: DoctorUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    existing_doctor = db.query(models.Doctor).filter(
        models.Doctor.id == doctor_id
    ).first()

    if existing_doctor is None:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    # Admins can update any doctor.
    # Doctors can update only their own profile.
    if current_user.role != "admin":
        if (
            current_user.role != "doctor"
            or current_user.doctor_id != doctor_id
        ):
            raise HTTPException(
                status_code=403,
                detail="You can only update your own doctor profile"
            )

    update_data = doctor.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(existing_doctor, field, value)

    db.commit()
    db.refresh(existing_doctor)

    return existing_doctor




@app.get("/doctors")
def get_doctors(db: Session = Depends(get_db)):

    doctors = db.query(models.Doctor).all()

    return doctors



@app.get("/doctors/{doctor_id}")
def get_doctor_profile(
    doctor_id: int,
    db: Session = Depends(get_db)
):
    doctor = db.query(models.Doctor).filter(
        models.Doctor.id == doctor_id
    ).first()

    if doctor is None:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    return {
        "id": doctor.id,
        "name": doctor.name,
        "specialization": doctor.specialization,
        "experience": doctor.experience,
        "hospital": doctor.hospital,
        "location": doctor.location,
        "availability": doctor.availability,
        "rating": doctor.rating
    }




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
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient"))
):

        # Check whether the logged-in patient owns this profile
    if current_user.patient_id != patient_id:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own appointments"
        )
    # 1. Check whether the patient exists
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id
    ).first()

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # 2. Get all appointments for this patient
    appointments = db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient_id
    ).all()

    result = []

    for appointment in appointments:
        # 3. Get doctor details
        doctor = db.query(models.Doctor).filter(
            models.Doctor.id == appointment.doctor_id
        ).first()

        # 4. Find the consultation for this appointment
        consultation = db.query(models.Consultation).filter(
            models.Consultation.appointment_id == appointment.id
        ).first()

        # 5. Build the appointment response
        result.append({
            "appointment_id": appointment.id,
            "appointment_date": appointment.appointment_date,
            "appointment_time": appointment.appointment_time,
            "status": appointment.status,
            "reason": appointment.reason,

            "doctor": {
                "id": doctor.id,
                "name": doctor.name,
                "specialization": doctor.specialization,
                "hospital": doctor.hospital,
                "location": doctor.location
            } if doctor else None,

            "consultation": {
                "symptoms": consultation.symptoms,
                "doctor_notes": consultation.doctor_notes,
                "treatment": consultation.treatment,
                "prescription": consultation.prescription,
                "follow_up_date": consultation.follow_up_date
            } if consultation else None
        })

    return result




@app.get("/doctors/{doctor_id}/appointments")
def get_doctor_appointments(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("doctor"))
):
        # Check whether the logged-in doctor owns this profile
    if current_user.doctor_id != doctor_id:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own appointments"
        )
    # 1. Check whether the doctor exists
    doctor = db.query(models.Doctor).filter(
        models.Doctor.id == doctor_id
    ).first()

    if doctor is None:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    # 2. Find appointments and their patients
    results = (
        db.query(models.Appointment, models.Patient)
        .join(
            models.Patient,
            models.Appointment.patient_id == models.Patient.id
        )
        .filter(
            models.Appointment.doctor_id == doctor_id
        )
        .all()
    )

    # 3. Prepare readable appointment details
    appointment_list = []

    for appointment, patient in results:
        appointment_list.append({
            "appointment_id": appointment.id,
            "patient_id": patient.id,
            "patient_name": patient.name,
            "patient_phone": patient.phone,
            "appointment_date": appointment.appointment_date,
            "appointment_time": appointment.appointment_time,
            "reason": appointment.reason,
            "status": appointment.status
        })

    return {
        "doctor_id": doctor.id,
        "doctor_name": doctor.name,
        "appointments": appointment_list
    }




@app.post("/appointments")
def create_appointment(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient"))
):
        # Verify that the logged-in patient owns this appointment request
    if current_user.patient_id != appointment.patient_id:
        raise HTTPException(
            status_code=403,
            detail="You can only book appointments for yourself"
        )
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

    # 3. Validate the appointment date and time
    try:
        requested_date = datetime.strptime(
            appointment.appointment_date, "%Y-%m-%d"
        ).date()

        requested_time = datetime.strptime(
            appointment.appointment_time, "%H:%M"
        ).time()

    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Use date YYYY-MM-DD and time HH:MM"
        )
    # Reject appointments scheduled in the past
    requested_datetime = datetime.combine(
        requested_date,
        requested_time
)

    if requested_datetime <= datetime.now():
        raise HTTPException(
            status_code=400,
            detail="You cannot book an appointment in the past"
        )

    # 4. Check the doctor's supported working schedule
    availability = doctor.availability.replace(" ", "").upper()

    if availability != "MON-SAT10AM-4PM":
        raise HTTPException(
            status_code=400,
            detail="Doctor availability format is not supported yet"
        )

    # Reject Sundays
    if requested_date.weekday() == 6:
        raise HTTPException(
            status_code=400,
            detail="Doctor is not available on Sundays"
        )

    # Allow 30-minute slots between 10:00 and 15:30
    start_time = time(10, 0)
    end_time = time(16, 0)

    if not (
        start_time <= requested_time
        and requested_time < end_time
        and requested_time.minute in (0, 30)
    ):
        raise HTTPException(
            status_code=400,
            detail="Choose a 30-minute slot between 10:00 and 15:30"
        )

    # 5. Check if the doctor is already booked
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

    # 6. Create the appointment
    new_appointment = models.Appointment(
        patient_id=current_user.patient_id,
        doctor_id=appointment.doctor_id,
        appointment_date=appointment.appointment_date,
        appointment_time=appointment.appointment_time,
        reason=appointment.reason,
        status="Booked"
    )

    db.add(new_appointment)

    try:
        db.commit()
        db.refresh(new_appointment)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This appointment slot has just been booked. Please choose another slot."
        )

    return new_appointment



@app.patch("/appointments/{appointment_id}/cancel")
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient"))
):
    # Find the appointment
    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id
    ).first()

    # Check whether it exists
    if appointment is None:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )
    # Verify appointment ownership
    if appointment.patient_id != current_user.patient_id:
        raise HTTPException(
             status_code=403,
            detail="You can only cancel your own appointments"
    )
    

    # Check whether it is already cancelled
    if appointment.status == "Cancelled":
        raise HTTPException(
            status_code=400,
            detail="Appointment is already cancelled"
        )

    # Update the status
    appointment.status = "Cancelled"

    db.commit()
    db.refresh(appointment)

    return {
        "message": "Appointment cancelled successfully",
        "appointment": {
            "id": appointment.id,
            "patient_id": appointment.patient_id,
            "doctor_id": appointment.doctor_id,
            "appointment_date": appointment.appointment_date,
            "appointment_time": appointment.appointment_time,
            "status": appointment.status
        }
    }


@app.post("/consultations")
def create_consultation(
    consultation: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("doctor"))
):
    # Find the appointment
    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == consultation.appointment_id
    ).first()

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )
    # Verify that this appointment belongs to the logged-in doctor
    if appointment.doctor_id != current_user.doctor_id:
        raise HTTPException(
            status_code=403,
            detail="You can only create consultations for your own appointments"
    )
    
    # Check whether a consultation already exists
    existing_consultation = db.query(models.Consultation).filter(
        models.Consultation.appointment_id == appointment.id
    ).first()

    if existing_consultation:
        raise HTTPException(
            status_code=409,
            detail="A consultation already exists for this appointment"
        )


    # Prevent a consultation for an appointment that is not booked
    if appointment.status != "Booked":
        raise HTTPException(
            status_code=400,
            detail="Consultation can only be added to a booked appointment"
        )

    # Create the consultation record
    new_consultation = models.Consultation(
        appointment_id=appointment.id,
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        symptoms=consultation.symptoms,
        doctor_notes=consultation.doctor_notes,
        treatment=consultation.treatment,
        prescription=consultation.prescription,
        follow_up_date=consultation.follow_up_date
    )

    
    db.add(new_consultation)

    # Mark the appointment as completed
    appointment.status = "Completed"

    try:
        db.commit()
        db.refresh(new_consultation)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A consultation already exists for this appointment"
        )


    return {
        "message": "Consultation saved successfully",
        "consultation_id": new_consultation.id,
        "appointment_id": new_consultation.appointment_id,
        "patient_id": new_consultation.patient_id,
        "doctor_id": new_consultation.doctor_id
    }

@app.get("/patients/{patient_id}/consultations")
def get_patient_consultations(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
        # Allow patients to access only their own records
    if current_user.role == "patient":
        if current_user.patient_id != patient_id:
            raise HTTPException(
                status_code=403,
                detail="You can only access your own consultation history"
            )

    # Allow doctors only if they have treated this patient
    elif current_user.role == "doctor":
        has_treated_patient = db.query(models.Consultation).filter(
            models.Consultation.patient_id == patient_id,
            models.Consultation.doctor_id == current_user.doctor_id
        ).first()

        if not has_treated_patient:
            raise HTTPException(
                status_code=403,
                detail="You are not authorized to access this patient's consultation history"
            )

    else:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access consultation history"
        )
    # Check whether the patient exists
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # Retrieve the patient's consultation records
    consultations = db.query(models.Consultation).filter(
        models.Consultation.patient_id == patient_id
    ).all()

    return consultations



@app.get("/doctors/{doctor_id}/consultations")
def get_doctor_consultations(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("doctor"))
):
        # Verify that the logged-in doctor owns this profile
    if current_user.doctor_id != doctor_id:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own consultation records"
        )
    # Check whether the doctor exists
    doctor = db.query(models.Doctor).filter(
        models.Doctor.id == doctor_id
    ).first()

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    # Retrieve the doctor's consultation records
    consultations = db.query(models.Consultation).filter(
        models.Consultation.doctor_id == doctor_id
    ).all()

    return consultations


@app.get("/doctors/{doctor_id}/available-slots")
def get_available_slots(
    doctor_id: int,
    requested_date: date = Query(..., alias="date"),
    db: Session = Depends(get_db)
):
    # Find the doctor
    doctor = db.query(models.Doctor).filter(
        models.Doctor.id == doctor_id
    ).first()

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    # Check the doctor's availability format
    availability = doctor.availability.replace(" ", "")
    parts = availability.split("10AM-4PM")

    if not availability.startswith("Mon-Sat") or len(parts) != 2:
        raise HTTPException(
            status_code=400,
            detail="Unsupported availability format"
        )

    # Check whether the requested day is within working days
    if requested_date.weekday() == 6:
        return {
            "doctor_id": doctor_id,
            "date": str(requested_date),
            "available_slots": []
        }

    # Generate 30-minute slots from 10 AM to 4 PM
    start = datetime.combine(requested_date, time(10, 0))
    end = datetime.combine(requested_date, time(16, 0))

    booked = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor_id,
        models.Appointment.appointment_date == str(requested_date),
        models.Appointment.status == "Booked"
    ).all()

    booked_times = {appointment.appointment_time for appointment in booked}

    slots = []
    current = start

    while current + timedelta(minutes=30) <= end:
        slot = current.strftime("%H:%M")

        if slot not in booked_times:
            slots.append(slot)

        current += timedelta(minutes=30)

    return {
        "doctor_id": doctor_id,
        "date": str(requested_date),
        "available_slots": slots
    }


@app.post("/register")
def register_patient(
    patient: PatientRegister,
    db: Session = Depends(get_db)
):
    email = patient.email.strip().lower()

    # 1. Check whether this email already has a login account
    existing_user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email is already registered"
        )

    # 2. Prevent duplicate patient profiles
    existing_patient = db.query(models.Patient).filter(
        models.Patient.email == email
    ).first()

    if existing_patient:
        raise HTTPException(
            status_code=409,
            detail="A patient profile with this email already exists"
        )

    try:
        # 3. Create the patient profile
        new_patient = models.Patient(
            name=patient.name,
            email=email,
            age=patient.age,
            gender=patient.gender,
            phone=patient.phone,
            location=patient.location,
            blood_group=patient.blood_group,
            allergies=patient.allergies,
            medical_conditions=patient.medical_conditions,
            current_medications=patient.current_medications,
            previous_surgeries=patient.previous_surgeries,
            emergency_contact_name=patient.emergency_contact_name,
            emergency_contact_phone=patient.emergency_contact_phone
        )

        db.add(new_patient)

        # Generate the patient ID without committing yet
        db.flush()

        # 4. Create the linked login account
        new_user = models.User(
            email=email,
            hashed_password=password_hash.hash(patient.password),
            role="patient",
            patient_id=new_patient.id,
            doctor_id=None
        )

        db.add(new_user)

        # 5. Save both records together
        db.commit()

        db.refresh(new_patient)
        db.refresh(new_user)

        return {
            "message": "Patient registered successfully",
            "patient_id": new_patient.id,
            "user_id": new_user.id,
            "email": new_user.email,
            "role": new_user.role
        }

    except Exception:
        db.rollback()
        raise

@app.post("/login")
def login_user(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    # 1. Find the account by email
    user = db.query(models.User).filter(
        models.User.email == credentials.email.lower()
    ).first()

    # 2. Verify the password
    if user is None or not password_hash.verify(
        credentials.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # 3. Generate an access token
    access_token = create_access_token(user)

    # 4. Return the token
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "role": user.role
    }
