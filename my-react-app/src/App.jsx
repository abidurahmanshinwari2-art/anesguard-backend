import React, { useState } from 'react';
import LoginScreen            from './components/LoginScreen';
import SignupScreen            from './components/SignupScreen';
import StudentDashboard        from './components/Dashboard';
import PatientDataInput        from './components/Patientdatainput';
import RiskAssessmentScreen    from './components/Riskassessmentscreen';
import DosageEstimationScreen  from './components/Dosageestimationscreen';
import ReportSummaryScreen     from './components/Reportsummaryscreen';
import ProfileScreen           from './components/ProfileScreen';
import AdminPanel              from './components/adminpanel';
import AssessmentHistory       from './components/AssessmentHistory';
import PatientDetailsView      from './components/PatientDetailsView';
import EditAssessment          from './components/EditAssessment';

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

      {/* onSaveAndContinue now receives the real saved assessment (with its MongoDB _id)
          instead of nothing — we pass that id forward as a param so the next
          screens know which assessment they're working with. */}
      {screen === 'patientInput'     && <PatientDataInput       onSaveAndContinue={(assessment) => go('riskAssessment', { id: assessment._id })} onNavigate={go} />}

      {screen === 'riskAssessment'   && <RiskAssessmentScreen   onBack={() => go('patientInput')}                onContinue={() => go('dosageEstimation', { id: params.id })} onNavigate={go} assessmentId={params.id} />}
      {screen === 'dosageEstimation' && <DosageEstimationScreen onBack={() => go('riskAssessment', { id: params.id })} onGenerateReport={() => go('report', { id: params.id })}     onNavigate={go} assessmentId={params.id} />}
      {screen === 'report'           && <ReportSummaryScreen    onBackToDashboard={() => go('dashboard')}        onNavigate={go} assessmentId={params.id} />}
      {screen === 'Profile'          && <ProfileScreen          onNavigate={go} />}
      {screen === 'admin'            && <AdminPanel             onNavigate={go} />}
      {screen === 'history'          && <AssessmentHistory      onNavigate={go} />}
      {screen === 'patientDetails'   && <PatientDetailsView     onNavigate={go} patientId={params.id} />}
      {screen === 'editAssessment'   && <EditAssessment         onNavigate={go} assessmentId={params.id} />}
    </>
  );
};

export default App;