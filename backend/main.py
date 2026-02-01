#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Main entry point for the AI-based Emotion Recognition and Treatment Recommendation System
"""

import sys
import os
from PyQt5.QtWidgets import QApplication, QMainWindow, QStackedWidget, QMessageBox
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QIcon

# Import application modules
from doctor_mode.login import LoginScreen
from patient_mode.ui_main import PatientMainScreen
from database.models import initialize_database

class MainApplication(QMainWindow):
    """Main application window that manages mode switching between doctor and patient modes"""
    
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Medical Emotion Analysis System")
        self.setMinimumSize(1200, 800)
        
        # Create stacked widget to manage different screens
        self.central_widget = QStackedWidget()
        self.setCentralWidget(self.central_widget)
        
        # Initialize database
        initialize_database()
        
        # Create login screen (first screen)
        self.login_screen = LoginScreen(self)
        self.central_widget.addWidget(self.login_screen)
        
        # Create patient screen
        self.patient_screen = PatientMainScreen(self)
        self.central_widget.addWidget(self.patient_screen)
        
        # Set initial screen to login
        self.central_widget.setCurrentIndex(0)
        
        # Apply stylesheet
        self.apply_stylesheet()
        
    def apply_stylesheet(self):
        """Apply global stylesheet to the application"""
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f0f2f5;
            }
            QPushButton {
                background-color: #4a6fa5;
                color: white;
                border-radius: 4px;
                padding: 8px 16px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #3a5a80;
            }
            QPushButton:pressed {
                background-color: #2d4a6d;
            }
            QLineEdit, QTextEdit, QComboBox {
                border: 1px solid #ccc;
                border-radius: 4px;
                padding: 8px;
                background-color: white;
            }
            QLabel {
                color: #333;
            }
            QGroupBox {
                font-weight: bold;
                border: 1px solid #ccc;
                border-radius: 4px;
                margin-top: 12px;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 5px 0 5px;
            }
        """)
    
    def switch_to_doctor_dashboard(self, doctor_id):
        """Switch to doctor dashboard after successful login"""
        from doctor_mode.dashboard import DoctorDashboard
        
        # Create doctor dashboard
        self.doctor_dashboard = DoctorDashboard(self, doctor_id)
        self.central_widget.addWidget(self.doctor_dashboard)
        self.central_widget.setCurrentWidget(self.doctor_dashboard)
    
    def switch_to_patient_mode(self, patient_id=None):
        """Switch to patient mode, optionally with a specific patient ID"""
        self.patient_screen.setup_patient(patient_id)
        self.central_widget.setCurrentWidget(self.patient_screen)
    
    def logout(self):
        """Log out and return to login screen"""
        reply = QMessageBox.question(self, 'Logout', 
                                    'Are you sure you want to logout?',
                                    QMessageBox.Yes | QMessageBox.No, 
                                    QMessageBox.No)
        
        if reply == QMessageBox.Yes:
            # Clear any sensitive data
            self.central_widget.setCurrentWidget(self.login_screen)
            self.login_screen.clear_fields()
            
            # Remove any dynamic widgets (like doctor dashboard)
            for i in range(self.central_widget.count() - 1, 1, -1):
                widget = self.central_widget.widget(i)
                self.central_widget.removeWidget(widget)
                if widget:
                    widget.deleteLater()

if __name__ == "__main__":
    # Create required directories if they don't exist
    os.makedirs('database', exist_ok=True)
    os.makedirs('logs', exist_ok=True)
    
    # Initialize application
    app = QApplication(sys.argv)
    app.setStyle('Fusion')  # Use Fusion style for consistent cross-platform look
    
    # Set application icon
    # app.setWindowIcon(QIcon('assets/icon.png'))
    
    # Create and show main window
    window = MainApplication()
    window.show()
    
    # Start application event loop
    sys.exit(app.exec_())
