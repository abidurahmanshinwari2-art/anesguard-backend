import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Search, Eye, Edit, Trash2, Download, Printer } from 'lucide-react';

const AssessmentHistory = ({ onNavigate }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');

  useEffect(() => {
    const fetchAssessments = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('https://anesguard-backend.onrender.com/api/assessments', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setAssessments(data.assessments || []);
        }
      } catch (error) {
        console.error('Error fetching assessments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const getRiskColor = (risk) => {
    const colors = { Low: '#16a34a', Moderate: '#d97706', High: '#dc2626' };
    return colors[risk] || '#64748b';
  };

  const getRiskBg = (risk) => {
    const colors = { Low: '#f0fdf4', Moderate: '#fffbeb', High: '#fef2f2' };
    return colors[risk] || '#f8fafc';
  };

  const filteredData = assessments.filter(a => {
    const matchSearch = a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchRisk = filterRisk === 'all' || a.riskLevel === filterRisk;
    return matchSearch && matchRisk;
  });

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
      <Sidebar activeLabel="History" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>Assessment History</h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>View and manage all patient assessments</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
              <Download size={16} /> Export CSV
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', border: '1px solid #e5e7eb', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient..."
              style={{ width: '100%', padding: '8px 12px 8px 38px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}
            style={{ padding: '8px 14px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '13px', backgroundColor: '#fff' }}>
            <option value="all">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Moderate">Moderate Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: '#64748b' }}>Loading assessments...</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Patient Name</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Age</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Risk Level</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Date</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                          No assessments found. Start a new assessment!
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((assessment, index) => (
                        <tr key={assessment.id || index} style={{ borderBottom: index < filteredData.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                          <td style={{ padding: '10px 14px', fontWeight: '600', color: '#1e293b' }}>{assessment.patientName || 'Unknown'}</td>
                          <td style={{ padding: '10px 14px', color: '#374151' }}>{assessment.age || '-'}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: '20px', backgroundColor: getRiskBg(assessment.riskLevel), color: getRiskColor(assessment.riskLevel), fontSize: '11px', fontWeight: '700' }}>
                              {assessment.riskLevel || 'Unknown'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: '13px', color: '#475569' }}>
                            {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : '-'}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
                                <Eye size={14} color="#2563eb" />
                              </button>
                              <button style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
                                <Edit size={14} color="#d97706" />
                              </button>
                              <button style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #ef4444', background: '#fef2f2', cursor: 'pointer' }}>
                                <Trash2 size={14} color="#dc2626" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Showing {filteredData.length} assessments</span>
              </div>
            </>
          )}
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </main>
    </div>
  );
};

export default AssessmentHistory;