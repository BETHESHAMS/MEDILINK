# MediLink – Medical Patient & Doctor Management System

## 1. Introduction
**MediLink** is a healthcare management platform designed to connect patients with suitable doctors based on their symptoms, medical history, doctor specialization, experience, availability, and location.

The main objective of MediLink is to make the process of finding an appropriate doctor easier while maintaining a patient's medical history for future consultations. Instead of providing a diagnosis, the system helps route patients toward the relevant medical specialty and facilitates communication and appointment management.

## 2. Features

### Patient Module
* Account creation and profile management.
* Enter symptoms to receive a suggested medical specialty.
* View and filter recommended doctors (by specialization, rating, experience, location).
* Maintain a longitudinal medical history (allergies, blood group, medical conditions, medications, surgeries).
* Emergency medical profile.

### Doctor Module
* Create doctor accounts.
* View appointments and patient history.
* Record consultation notes and treatments.

### Smart Recommendation Engine
MediLink uses a symptom-matching system. 
For example, if a patient inputs **"Persistent knee pain and difficulty walking"**, the system identifies **Orthopedics** as the recommended specialty and ranks available doctors based on rating, experience, and availability.

## 3. Technology Stack
* **Backend:** Python, FastAPI, SQLAlchemy
* **Database:** SQLite (local development)
* **Data Validation:** Pydantic

## 4. Setup Instructions

### Prerequisites
Make sure you have Python installed on your machine.

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/BETHESHAMS/MEDILINK.git
   cd MEDILINK
   ```
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Install the required dependencies (FastAPI, Uvicorn, SQLAlchemy):
   ```bash
   pip install fastapi uvicorn sqlalchemy pydantic
   ```
4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
5. Open your browser and navigate to the interactive API documentation at:
   * **http://127.0.0.1:8000/docs**

## 5. System Workflow
1. **Patient Registration:** Patient registers and fills out medical history.
2. **Symptom Processing:** Patient enters symptoms.
3. **Specialty Identification:** System analyzes text and identifies medical specialty.
4. **Doctor Recommendation:** System ranks suitable doctors.
5. **Booking:** Patient selects a doctor and books an appointment.
6. **Consultation:** Doctor reviews history, consults, and updates records.

## 6. Disclaimer
**Note:** The current version is a prototype/academic MVP and should not be used to store real patient information without appropriate security, privacy, consent, access-control, encryption, backup, compliance, and clinical-governance measures. It does not replace emergency medical services or professional diagnosis.
