// src/components/AssessmentHistory.jsx
import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Search, Filter, Download, Printer, Eye, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { getAssessments, deleteAssessment, bulkDeleteAssessments } from '../api/assessments';

const PAGE_SIZE = 10;

const AssessmentHistory = ({ onNavigate }) => {
  const [assessments, setAssessments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const [selectedAssessments, setSelectedAssessments] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState('');

  // Fetches the real list from the backend every time search/filter/sort/page
  // changes — the backend does the actual filtering and sorting, this screen
  // just displays whatever it returns.
  const loadAssessments = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const result = await getAssessments({
        search: searchTerm,
        riskLevel: filterRisk,
        sortBy,
        order: sortOrder,
        page,
        limit: PAGE_SIZE,
      });
      setAssessments(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to load assessments:', err);
      setLoadError('Could not load assessment history. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterRisk, sortBy, sortOrder, page]);

  const showToastMessage = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSearch = (e) => { setSearchTerm(e.target.value); setPage(1); };

  const handleFilterRisk = (e) => { setFilterRisk(e.target.value); setPage(1); };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAssessments(assessments.map(a => a._id));
    } else {
      setSelectedAssessments([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedAssessments.includes(id)) {
      setSelectedAssessments(selectedAssessments.filter(s => s !== id));
    } else {
      setSelectedAssessments([...selectedAssessments, id]);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteAssessment(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
      showToastMessage('Assessment deleted successfully');
      loadAssessments();
    } catch (err) {
      console.error('Failed to delete assessment:', err);
      showToastMessage('Failed to delete assessment');
      setShowDeleteModal(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAssessments.length === 0) return;
    try {
      await bulkDeleteAssessments(selectedAssessments);
      showToastMessage(`${selectedAssessments.length} assessments deleted`);
      setSelectedAssessments([]);
      loadAssessments();
    } catch (err) {
      console.error('Failed to bulk delete:', err);
      showToastMessage('Failed to delete selected assessments');
    }
  };

  const handleExportCSV = () => {
    showToastMessage('CSV export started');
  };

  const handlePrint = () => {
    window.print();
  };

  const getRiskColor = (risk) => {
    const colors = { Low: '#16a34a', Moderate: '#d97706', High: '#dc2626' };
    return colors[risk] || '#64748b';
  };

  const getRiskBg = (risk) => {
    const colors = { Low: '#f0fdf4', Moderate: '#fffbeb', High: '#fef2f2' };
    return colors[risk] || '#f8fafc';
  };

  const getStatusColor = (status) => (status === 'Completed' ? '#16a34a' : '#d97706');
  const getStatusBg = (status) => (status === 'Completed' ? '#f0fdf4' : '#fffbeb');

  const formatDate = (isoString) => {
    if (!isoString) return { date: '—', time: '' };
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f1f5f9' }}>
      <Sidebar activeLabel="History" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', right: '24px', zIndex: 9999,
          padding: '12px 24px', borderRadius: '10px',
          backgroundColor: '#1e293b', color: '#fff',
          fontSize: '14px', fontWeight: '600',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          animation: 'slideIn 0.3s ease'
        }}>
          ✅ {toast}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '14px', padding: '32px',
            width: '380px', maxWidth: '90%', boxShadow: '0 16px 48px rgba(0,0,0,0.18)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                backgroundColor: '#fef2f2', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <Trash2 size={24} color="#dc2626" />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Delete Assessment</h3>
              <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#64748b' }}>
                Are you sure you want to delete this assessment? This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)}
                style={{ padding: '8px 20px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={confirmDelete}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#dc2626,#b91c1c)', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>Assessment History</h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              View and manage all patient assessments ({total} records)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleExportCSV}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
              <Download size={16} /> Export CSV
            </button>
            <button onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
              <Printer size={16} /> Print
            </button>
            {selectedAssessments.length > 0 && (
              <button onClick={handleBulkDelete}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#dc2626,#b91c1c)', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer' }}>
                <Trash2 size={16} /> Delete Selected ({selectedAssessments.length})
              </button>
            )}
          </div>
        </div>

        {loadError && (
          <div style={{ padding: '12px 16px', marginBottom: '16px', backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>{loadError}</p>
          </div>
        )}

        {/* Filters */}
        <div style={{
          backgroundColor: '#fff', borderRadius: '12px', padding: '16px 20px',
          marginBottom: '20px', border: '1px solid #e5e7eb',
          display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by patient name..."
              style={{
                width: '100%', padding: '8px 12px 8px 38px',
                border: '1.5px solid #d1d5db', borderRadius: '8px',
                fontSize: '13px', outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <select value={filterRisk} onChange={handleFilterRisk}
            style={{ padding: '8px 14px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '13px', backgroundColor: '#fff' }}>
            <option value="all">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Moderate">Moderate Risk</option>
            <option value="High">High Risk</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '8px 14px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '13px', backgroundColor: '#fff' }}>
            <option value="date">Sort by Date</option>
            <option value="patientName">Sort by Patient</option>
            <option value="riskLevel">Sort by Risk</option>
          </select>
          <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            style={{ padding: '8px 12px', border: '1.5px solid #d1d5db', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* Table */}
        <div style={{
          backgroundColor: '#fff', borderRadius: '12px',
          border: '1px solid #e5e7eb', overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
        }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: '#64748b', fontSize: '14px' }}>Loading assessments...</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: '10px 14px', width: '40px' }}>
                        <input type="checkbox" onChange={handleSelectAll} style={{ accentColor: '#2563eb' }} />
                      </th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('patientName')}>
                        Patient Name {sortBy === 'patientName' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Age</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Gender</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('riskLevel')}>
                        Risk Level {sortBy === 'riskLevel' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('date')}>
                        Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                          No assessments found. Start a new assessment to see results here.
                        </td>
                      </tr>
                    ) : (
                      assessments.map((assessment, index) => {
                        const { date, time } = formatDate(assessment.createdAt);
                        return (
                          <tr key={assessment._id} style={{
                            borderBottom: index < assessments.length - 1 ? '1px solid #f8fafc' : 'none',
                            transition: 'background 0.1s'
                          }}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '10px 14px' }}>
                              <input
                                type="checkbox"
                                checked={selectedAssessments.includes(assessment._id)}
                                onChange={() => handleSelectOne(assessment._id)}
                                style={{ accentColor: '#2563eb' }}
                              />
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: '600', color: '#1e293b' }}>{assessment.patientName}</td>
                            <td style={{ padding: '10px 14px', color: '#374151' }}>{assessment.age}</td>
                            <td style={{ padding: '10px 14px', color: '#64748b' }}>{capitalize(assessment.gender)}</td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{
                                padding: '3px 10px', borderRadius: '20px',
                                backgroundColor: getRiskBg(assessment.riskLevel),
                                color: getRiskColor(assessment.riskLevel),
                                fontSize: '11px', fontWeight: '700'
                              }}>
                                {assessment.riskLevel} ({assessment.riskScore}/12)
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', fontSize: '13px', color: '#475569' }}>
                              {date} <span style={{ color: '#94a3b8', fontSize: '12px' }}>{time}</span>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{
                                padding: '3px 10px', borderRadius: '20px',
                                backgroundColor: getStatusBg(assessment.status),
                                color: getStatusColor(assessment.status),
                                fontSize: '11px', fontWeight: '600'
                              }}>
                                {assessment.status}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                <button
                                  onClick={() => onNavigate && onNavigate('patientDetails', { id: assessment._id })}
                                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '12px' }}
                                  title="View Details">
                                  <Eye size={14} color="#2563eb" />
                                </button>
                                <button
                                  onClick={() => onNavigate && onNavigate('editAssessment', { id: assessment._id })}
                                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '12px' }}
                                  title="Edit">
                                  <Edit size={14} color="#d97706" />
                                </button>
                                <button
                                  onClick={() => handleDelete(assessment._id)}
                                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #ef4444', background: '#fef2f2', cursor: 'pointer', fontSize: '12px' }}
                                  title="Delete">
                                  <Trash2 size={14} color="#dc2626" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Showing {assessments.length} of {total} assessments
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)} style={{
                      padding: '4px 12px', borderRadius: '6px',
                      border: p === page ? '1px solid #2563eb' : '1px solid #e5e7eb',
                      backgroundColor: p === page ? '#2563eb' : '#fff',
                      color: p === page ? '#fff' : '#374151',
                      fontSize: '12px', cursor: 'pointer'
                    }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          @media print {
            .no-print { display: none !important; }
          }
        `}</style>
      </main>
    </div>
  );
};

export default AssessmentHistory;