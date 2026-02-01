#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Main Flask application for the AI-based Emotion Recognition System
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import base64
import numpy as np
import cv2
import datetime
import logging
from werkzeug.utils import secure_filename

# Import custom modules
from database.models import (
    initialize_database, Doctor, Patient, EmotionLog, 
    MedicineRecommendation, PatientFeedback, ClinicalReport
)
from patient_mode.face_detector import analyze_face_emotion
from patient_mode.voice_analyzer import analyze_voice_emotion
from doctor_mode.recommend_engine import MedicineRecommender
from chatbot.rule_engine import RuleBasedChatbot

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, static_folder='build')
CORS(app)  # Enable CORS for all routes

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize database
initialize_database()

# Initialize medicine recommender
medicine_recommender = MedicineRecommender()

# Initialize chatbot
chatbot = RuleBasedChatbot()

# Serve React frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# API Routes

# Doctor authentication
@app.route('/api/doctor/login', methods=['POST'])
def doctor_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400
    
    doctor = Doctor.login(username, password)
    if doctor:
        return jsonify({
            'success': True,
            'doctor': {
                'id': doctor['id'],
                'full_name': doctor['full_name'],
                'specialization': doctor['specialization']
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

# Patient authentication
@app.route('/api/patient/login', methods=['POST'])
def patient_login():
    data = request.json
    patient_id = data.get('patient_id')
    
    if not patient_id:
        return jsonify({'success': False, 'message': 'Patient ID required'}), 400
    
    patient = Patient.get_patient_by_id(patient_id)
    if patient:
        return jsonify({
            'success': True,
            'patient': {
                'id': patient['id'],
                'full_name': patient['full_name'],
                'age': patient['age'],
                'gender': patient['gender'],
                'diagnosis': patient['diagnosis']
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Patient not found'}), 404

# Get all patients for a doctor
@app.route('/api/doctor/<int:doctor_id>/patients', methods=['GET'])
def get_doctor_patients(doctor_id):
    patients = Patient.get_patients_by_doctor(doctor_id)
    return jsonify({'success': True, 'patients': patients})

# Get patient details
@app.route('/api/patient/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    patient = Patient.get_patient_by_id(patient_id)
    if patient:
        return jsonify({'success': True, 'patient': patient})
    else:
        return jsonify({'success': False, 'message': 'Patient not found'}), 404

# Add new patient
@app.route('/api/patient', methods=['POST'])
def add_patient():
    data = request.json
    patient_id = data.get('patient_id')
    full_name = data.get('full_name')
    age = data.get('age')
    gender = data.get('gender')
    diagnosis = data.get('diagnosis')
    doctor_id = data.get('doctor_id')
    
    if not patient_id or not full_name or not doctor_id:
        return jsonify({'success': False, 'message': 'Required fields missing'}), 400
    
    new_id = Patient.add_patient(patient_id, full_name, age, gender, diagnosis, doctor_id)
    if new_id:
        return jsonify({'success': True, 'id': new_id})
    else:
        return jsonify({'success': False, 'message': 'Failed to add patient'}), 500

# Face emotion analysis
@app.route('/api/analyze/face', methods=['POST'])
def analyze_face():
    try:
        data = request.json
        image_data = data.get('image')
        patient_id = data.get('patient_id')
        
        if not image_data:
            return jsonify({'success': False, 'message': 'No image data provided'}), 400
        
        # Decode base64 image
        image_data = image_data.split(',')[1] if ',' in image_data else image_data
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Analyze face emotion
        result = analyze_face_emotion(img)
        
        if not result:
            return jsonify({'success': False, 'message': 'No face detected'}), 400
        
        # Calculate depression and aggression indices
        emotions = result['emotions']
        depression_index = (emotions.get('sad', 0) * 0.6 + 
                           emotions.get('fear', 0) * 0.3 + 
                           emotions.get('disgust', 0) * 0.1) * 10
        
        aggression_index = (emotions.get('angry', 0) * 0.7 + 
                           emotions.get('disgust', 0) * 0.3) * 10
        
        # Save to database if patient_id provided
        if patient_id:
            timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            log_id = EmotionLog.add_log(
                patient_id, 
                timestamp, 
                json.dumps(emotions), 
                depression_index, 
                aggression_index, 
                'face'
            )
            
            # Get medicine recommendations
            depression_rec = None
            aggression_rec = None
            
            if depression_index > 3:
                depression_rec = medicine_recommender.recommend_for_depression(depression_index)
            
            if aggression_index > 3:
                aggression_rec = medicine_recommender.recommend_for_aggression(aggression_index)
            
            # Combine recommendations
            recommendations = []
            if depression_rec and depression_rec[0]:
                recommendations.append({
                    'type': 'depression',
                    'medicine': depression_rec[0],
                    'dosage': depression_rec[1],
                    'notes': depression_rec[2]
                })
            
            if aggression_rec and aggression_rec[0]:
                recommendations.append({
                    'type': 'aggression',
                    'medicine': aggression_rec[0],
                    'dosage': aggression_rec[1],
                    'notes': aggression_rec[2]
                })
            
            # Save recommendations to database
            for rec in recommendations:
                MedicineRecommendation.add_recommendation(
                    patient_id,
                    timestamp,
                    rec['medicine'],
                    rec['dosage'],
                    rec['notes'],
                    rec['type']
                )
            
            result['log_id'] = log_id
            result['recommendations'] = recommendations
        
        result['depression_index'] = round(depression_index, 2)
        result['aggression_index'] = round(aggression_index, 2)
        result['success'] = True
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in face analysis: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

# Voice emotion analysis
@app.route('/api/analyze/voice', methods=['POST'])
def analyze_voice():
    try:
        if 'audio' not in request.files:
            return jsonify({'success': False, 'message': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        patient_id = request.form.get('patient_id')
        
        if audio_file.filename == '':
            return jsonify({'success': False, 'message': 'No audio file selected'}), 400
        
        # Save audio file temporarily
        filename = secure_filename(audio_file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        audio_file.save(file_path)
        
        # Analyze voice emotion
        result = analyze_voice_emotion(file_path)
        
        # Remove temporary file
        os.remove(file_path)
        
        if not result:
            return jsonify({'success': False, 'message': 'Failed to analyze audio'}), 400
        
        # Calculate depression and aggression indices
        emotions = result['emotions']
        depression_index = (emotions.get('sad', 0) * 0.6 + 
                           emotions.get('fear', 0) * 0.3 + 
                           emotions.get('disgust', 0) * 0.1) * 10
        
        aggression_index = (emotions.get('angry', 0) * 0.7 + 
                           emotions.get('disgust', 0) * 0.3) * 10
        
        # Save to database if patient_id provided
        if patient_id:
            timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            log_id = EmotionLog.add_log(
                patient_id, 
                timestamp, 
                json.dumps(emotions), 
                depression_index, 
                aggression_index, 
                'voice'
            )
            
            result['log_id'] = log_id
        
        result['depression_index'] = round(depression_index, 2)
        result['aggression_index'] = round(aggression_index, 2)
        result['success'] = True
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in voice analysis: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

# Get emotion logs for a patient
@app.route('/api/patient/<int:patient_id>/logs', methods=['GET'])
def get_patient_logs(patient_id):
    limit = request.args.get('limit', default=10, type=int)
    logs = EmotionLog.get_logs_for_patient(patient_id, limit=limit)
    return jsonify({'success': True, 'logs': logs})

# Get medicine recommendations for a patient
@app.route('/api/patient/<int:patient_id>/recommendations', methods=['GET'])
def get_patient_recommendations(patient_id):
    limit = request.args.get('limit', default=10, type=int)
    recommendations = MedicineRecommendation.get_recommendations_for_patient(patient_id, limit=limit)
    return jsonify({'success': True, 'recommendations': recommendations})

# Add patient feedback for a medicine
@app.route('/api/feedback', methods=['POST'])
def add_feedback():
    data = request.json
    patient_id = data.get('patient_id')
    medicine = data.get('medicine')
    effectiveness = data.get('effectiveness')
    side_effects = data.get('side_effects')
    notes = data.get('notes')
    
    if not patient_id or not medicine or effectiveness is None:
        return jsonify({'success': False, 'message': 'Required fields missing'}), 400
    
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    feedback_id = PatientFeedback.add_feedback(
        patient_id, timestamp, medicine, effectiveness, side_effects, notes
    )
    
    if feedback_id:
        return jsonify({'success': True, 'id': feedback_id})
    else:
        return jsonify({'success': False, 'message': 'Failed to add feedback'}), 500

# Add clinical report
@app.route('/api/report', methods=['POST'])
def add_report():
    try:
        report_type = request.form.get('report_type')
        patient_id = request.form.get('patient_id')
        doctor_id = request.form.get('doctor_id')
        report_content = request.form.get('report_content')
        
        if not report_type or not patient_id or not doctor_id:
            return jsonify({'success': False, 'message': 'Required fields missing'}), 400
        
        file_path = None
        if 'file' in request.files:
            file = request.files['file']
            if file.filename != '':
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
        
        report_date = datetime.datetime.now().strftime('%Y-%m-%d')
        doctor = Doctor.get_doctor_by_id(doctor_id)
        doctor_name = doctor['full_name'] if doctor else 'Unknown'
        
        report_id = ClinicalReport.add_report(
            patient_id, doctor_id, doctor_name, report_type, 
            report_date, report_content, file_path
        )
        
        if report_id:
            return jsonify({'success': True, 'id': report_id})
        else:
            return jsonify({'success': False, 'message': 'Failed to add report'}), 500
    
    except Exception as e:
        logger.error(f"Error adding report: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

# Get clinical reports for a patient
@app.route('/api/patient/<int:patient_id>/reports', methods=['GET'])
def get_patient_reports(patient_id):
    reports = ClinicalReport.get_reports_for_patient(patient_id)
    return jsonify({'success': True, 'reports': reports})

# Chatbot endpoint
@app.route('/api/chatbot', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message')
    patient_id = data.get('patient_id')
    emotion = data.get('emotion')
    
    if not message:
        return jsonify({'success': False, 'message': 'No message provided'}), 400
    
    # Get response from chatbot
    response = chatbot.get_response(message, emotion)
    
    return jsonify({
        'success': True,
        'response': response,
        'timestamp': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })

# Get mood visualization data
@app.route('/api/patient/<int:patient_id>/mood', methods=['GET'])
def get_mood_data(patient_id):
    days = request.args.get('days', default=7, type=int)
    
    # Get logs for the specified number of days
    logs = EmotionLog.get_logs_for_patient_by_days(patient_id, days)
    
    if not logs:
        return jsonify({'success': True, 'data': []})
    
    # Process data for visualization
    dates = []
    depression_values = []
    aggression_values = []
    emotions_data = []
    
    for log in logs:
        date = log['timestamp'].split(' ')[0]
        if date not in dates:
            dates.append(date)
            depression_values.append(log['depression_index'])
            aggression_values.append(log['aggression_index'])
            
            # Parse emotions JSON
            emotions = json.loads(log['emotions'])
            emotions_data.append({
                'date': date,
                'happy': emotions.get('happy', 0),
                'sad': emotions.get('sad', 0),
                'angry': emotions.get('angry', 0),
                'fear': emotions.get('fear', 0),
                'disgust': emotions.get('disgust', 0),
                'surprise': emotions.get('surprise', 0),
                'neutral': emotions.get('neutral', 0)
            })
    
    return jsonify({
        'success': True,
        'data': {
            'dates': dates,
            'depression': depression_values,
            'aggression': aggression_values,
            'emotions': emotions_data
        }
    })

# Update patient status
@app.route('/api/patient/<int:patient_id>/status', methods=['PUT'])
def update_patient_status(patient_id):
    data = request.json
    status = data.get('status')
    
    if not status:
        return jsonify({'success': False, 'message': 'Status required'}), 400
    
    success = Patient.update_status(patient_id, status)
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'Failed to update status'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
