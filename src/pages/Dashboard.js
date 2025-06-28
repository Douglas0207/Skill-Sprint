import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [okrs, setOkrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });


  useEffect(() => {
    fetchOKRs();
  }, []);

  const fetchOKRs = async () => {
    try {
      const response = await axios.get('/api/okrs', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      console.log("🔍 Response from backend:", response.data);
  
      const okrData = Array.isArray(response.data) ? response.data : [];
  
      setOkrs(okrData);
  
      // Safely calculate stats
      const total = okrData.length;
      const completed = okrData.filter(okr => okr.status === 'completed').length;
      const inProgress = okrData.filter(okr => okr.status === 'active').length;
      const overdue = okrData.filter(okr => {
        return okr.status === 'active' && new Date(okr.dueDate) < new Date();
      }).length;
  
      setStats({ total, completed, inProgress, overdue });
  
    } catch (error) {
      console.error("❌ Error fetching OKRs:", error?.response?.data || error.message);
    }
  };
  

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#28a745';
    if (progress >= 50) return '#ffc107';
    return '#dc3545';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      draft: { class: 'badge-secondary', text: 'Draft' },
      active: { class: 'badge-primary', text: 'Active' },
      completed: { class: 'badge-success', text: 'Completed' },
      cancelled: { class: 'badge-danger', text: 'Cancelled' }
    };
    
    const statusInfo = statusMap[status] || statusMap.draft;
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.firstName}!</h1>
        <p>Track your OKRs and monitor your progress</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total OKRs</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats.overdue}</h3>
            <p>Overdue</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/okrs/create" className="btn btn-primary">
            Create New OKR
          </Link>
          <Link to="/okrs" className="btn btn-secondary">
            View All OKRs
          </Link>
        </div>
      </div>

      {/* Recent OKRs */}
      <div className="recent-okrs">
        <div className="section-header">
          <h2>Recent OKRs</h2>
          <Link to="/okrs" className="view-all-link">View All</Link>
        </div>

        {okrs.length === 0 ? (
          <div className="empty-state">
            <p>No OKRs found. Create your first OKR to get started!</p>
            <Link to="/okrs/create" className="btn btn-primary">
              Create Your First OKR
            </Link>
          </div>
        ) : (
          <div className="okrs-grid">
              {Array.isArray(okrs) && okrs.slice(0, 6).map(okr => (
              <div key={okr._id} className="okr-card">
                <div className="okr-header">
                  <h3>{okr.title}</h3>
                  {getStatusBadge(okr.status)}
                </div>
                
                <p className="okr-objective">{okr.objective}</p>
                
                <div className="okr-progress">
                  <div className="progress-info">
                    <span>Progress</span>
                    <span>{okr.overallProgress || 0}%</span>
                  </div>
                  <div className="progress">
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${okr.overallProgress || 0}%`,
                        backgroundColor: getProgressColor(okr.overallProgress || 0)
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="okr-meta">
                  <div className="meta-item">
                    <span className="meta-label">Due:</span>
                    <span className="meta-value">{formatDate(okr.dueDate)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Priority:</span>
                    <span className={`badge badge-${okr.priority === 'high' ? 'danger' : okr.priority === 'medium' ? 'warning' : 'secondary'}`}>
                      {okr.priority}
                    </span>
                  </div>
                </div>
                
                <div className="okr-actions">
                  <Link to={`/okrs/${okr._id}`} className="btn btn-sm btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 