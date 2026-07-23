import React, { useState } from 'react';
import LoginScreen from "./components/LoginScreen";
import SignupScreen from "./components/SignupScreen";
import StudentDashboard from "./components/Dashboard";        // ✅ Changed Dashbord → Dashboard
import PatientDataInput from "./components/Patientdatainput";
import RiskAssessmentScreen from "./components/Riskassessmentscreen";
import DosageEstimationScreen from "./components/Dosageestimationscreen";
import ReportSummaryScreen from "./components/Reportsummaryscreen";
import ProfileScreen from "./components/profilescreen";       // ✅ Changed ProfileScreen → profilescreen
import AdminPanel from "./components/adminpanel";
import AssessmentHistory from "./components/AssessmentHistory";
import PatientDetailsView from "./components/PatientDetailsView";
import EditAssessment from "./components/EditAssessment";

/*
  SCREEN KEYS:
  'login' | 'signup' | 'dashboard' | 'patientInput' |
  'riskAssessment' | 'dosageEstimation' | 'report' | 'profile' | 'admin' |
  'history' | 'patientDetails' | 'editAssessment'
*/

const App = () => {
  const [screen, setScreen] = useState('login');
  const [params, setParams] = useState({});
  
  const go = (s, p = {}) => {
    setScreen(s);
    setParams(p);
  };

  return (
    <>
      {screen === 'login'            && <LoginScreen            onLoginSuccess={() => go('dashboard')}           onSwitchToSignup={() => go('signup')} />}
      {screen === 'signup'           && <SignupScreen           onSwitchToLogin={() => go('login')} />}
      {screen === 'dashboard'        && <StudentDashboard       onLogout={() => go('login')}                     onNavigate={go} />}
      {screen === 'patientInput'     && <PatientDataInput       onSaveAndContinue={() => go('riskAssessment')}   onNavigate={go} />}
      {screen === 'riskAssessment'   && <RiskAssessmentScreen   onBack={() => go('patientInput')}                onContinue={() => go('dosageEstimation')} onNavigate={go} />}
      {screen === 'dosageEstimation' && <DosageEstimationScreen onBack={() => go('riskAssessment')}              onGenerateReport={() => go('report')}     onNavigate={go} />}
      {screen === 'report'           && <ReportSummaryScreen    onBackToDashboard={() => go('dashboard')}        onNavigate={go} />}
      {screen === 'profile'          && <ProfileScreen          onNavigate={go} />}
      {screen === 'admin'            && <AdminPanel             onNavigate={go} />}
      {screen === 'history'          && <AssessmentHistory      onNavigate={go} />}
      {screen === 'patientDetails'   && <PatientDetailsView     onNavigate={go} patientId={params.id} />}
      {screen === 'editAssessment'   && <EditAssessment         onNavigate={go} assessmentId={params.id} />}
    </>
  );
};

export default App;