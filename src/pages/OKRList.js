import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './OKRList.css';

const OKRList = () => {
  const [okrs, setOkrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: ''
  });

  useEffect(() => {
    fetchOKRs();
  }, [filters]);

  const fetchOKRs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);

      const response = await axios.get(`/api/okrs?${params}`);
      setOkrs(response.data);
    } catch (error) {
      console.error('Error fetching OKRs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      assignedTo: ''
    });
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

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      low: { class: 'badge-secondary', text: 'Low' },
      medium: { class: 'badge-warning', text: 'Medium' },
      high: { class: 'badge-danger', text: 'High' },
      critical: { class: 'badge-danger', text: 'Critical' }
    };
    
    const priorityInfo = priorityMap[priority] || priorityMap.medium;
    return <span className={`badge ${priorityInfo.class}`}>{priorityInfo.text}</span>;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="okr-list">
      <div className="page-header">
        <h1>OKRs</h1>
        <Link to="/okrs/create" className="btn btn-primary">
          Create New OKR
        </Link>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="form-group">
            <label htmlFor="status" className="form-label">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority" className="form-label">Priority</label>
            <select
              id="priority"
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="assignedTo" className="form-label">Assigned To</label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={filters.assignedTo}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Assignments</option>
              <option value="me">Assigned to Me</option>
              <option value="team">Assigned to My Team</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* OKRs List */}
      {okrs.length === 0 ? (
        <div className="empty-state">
          <p>No OKRs found matching your filters.</p>
          <button onClick={clearFilters} className="btn btn-primary">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="okrs-table-container">
          <table className="okrs-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Objective</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {okrs.map(okr => (
                <tr key={okr._id}>
                  <td>
                    <div className="okr-title">
                      <strong>{okr.title}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="okr-objective">
                      {okr.objective.length > 50 
                        ? `${okr.objective.substring(0, 50)}...` 
                        : okr.objective
                      }
                    </div>
                  </td>
                  <td>
                    <div className="progress-container">
                      <div className="progress">
                        <div 
                          className="progress-bar" 
                          style={{ 
                            width: `${okr.overallProgress || 0}%`,
                            backgroundColor: getProgressColor(okr.overallProgress || 0)
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">{okr.overallProgress || 0}%</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(okr.status)}</td>
                  <td>{getPriorityBadge(okr.priority)}</td>
                  <td>
                    <span className={`due-date ${new Date(okr.dueDate) < new Date() && okr.status === 'active' ? 'overdue' : ''}`}>
                      {formatDate(okr.dueDate)}
                    </span>
                  </td>
                  <td>
                    <div className="assigned-to">
                      {okr.assignedTo.type === 'user' && okr.assignedTo.user ? (
                        <span>{okr.assignedTo.user.firstName} {okr.assignedTo.user.lastName}</span>
                      ) : okr.assignedTo.type === 'team' && okr.assignedTo.team ? (
                        <span>{okr.assignedTo.team.name}</span>
                      ) : (
                        <span>Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="actions">
                      <Link to={`/okrs/${okr._id}`} className="btn btn-sm btn-primary">
                        View
                      </Link>
                      <Link to={`/okrs/${okr._id}/edit`} className="btn btn-sm btn-secondary">
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OKRList; 