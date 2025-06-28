import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './OKRForm.css';

const CreateOKR = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    objective: '',
    keyResults: [{ description: '', target: '', progress: 0 }],
    assignedTo: {
      type: 'user',
      user: '',
      team: ''
    },
    priority: 'medium',
    dueDate: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsersAndTeams();
  }, []);

  const fetchUsersAndTeams = async () => {
    try {
      const [usersResponse, teamsResponse] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/teams')
      ]);
      setUsers(usersResponse.data);
      setTeams(teamsResponse.data);
    } catch (error) {
      console.error('Error fetching users and teams:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAssignedToChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      assignedTo: {
        ...prev.assignedTo,
        [name]: value
      }
    }));
  };

  const handleKeyResultChange = (index, field, value) => {
    const updatedKeyResults = [...formData.keyResults];
    updatedKeyResults[index] = {
      ...updatedKeyResults[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      keyResults: updatedKeyResults
    }));
  };

  const addKeyResult = () => {
    setFormData(prev => ({
      ...prev,
      keyResults: [...prev.keyResults, { description: '', target: '', progress: 0 }]
    }));
  };

  const removeKeyResult = (index) => {
    if (formData.keyResults.length > 1) {
      const updatedKeyResults = formData.keyResults.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        keyResults: updatedKeyResults
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.objective.trim()) {
      newErrors.objective = 'Objective is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else if (new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }

    // Validate key results
    const keyResultErrors = [];
    formData.keyResults.forEach((kr, index) => {
      if (!kr.description.trim()) {
        keyResultErrors[index] = { description: 'Description is required' };
      }
    });

    if (keyResultErrors.length > 0) {
      newErrors.keyResults = keyResultErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const okrData = {
        ...formData,
        keyResults: formData.keyResults.map(kr => ({
          ...kr,
          progress: parseInt(kr.progress) || 0
        }))
      };

      await axios.post('http://localhost:5050/api/okrs', okrData);

      navigate('/okrs');
    } catch (error) {
      console.error('Error creating OKR:', error);
      const message = error.response?.data?.message || 'Error creating OKR';
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="okr-form-page">
      <div className="page-header">
        <h1>Create New OKR</h1>
      </div>

      {errors.submit && (
        <div className="alert alert-danger">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="okr-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              OKR Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`form-control ${errors.title ? 'error' : ''}`}
              placeholder="Enter OKR title"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="objective" className="form-label">
              Objective *
            </label>
            <textarea
              id="objective"
              name="objective"
              value={formData.objective}
              onChange={handleChange}
              className={`form-control ${errors.objective ? 'error' : ''}`}
              placeholder="Describe the objective"
              rows="3"
            />
            {errors.objective && <span className="error-message">{errors.objective}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority" className="form-label">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-control"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate" className="form-label">
                Due Date *
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`form-control ${errors.dueDate ? 'error' : ''}`}
              />
              {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Assignment</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="assignedToType" className="form-label">
                Assign To
              </label>
              <select
                id="assignedToType"
                name="type"
                value={formData.assignedTo.type}
                onChange={handleAssignedToChange}
                className="form-control"
              >
                <option value="user">Individual User</option>
                <option value="team">Team</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="assignedToValue" className="form-label">
                {formData.assignedTo.type === 'user' ? 'Select User' : 'Select Team'}
              </label>
              <select
                id="assignedToValue"
                name={formData.assignedTo.type}
                value={formData.assignedTo[formData.assignedTo.type]}
                onChange={handleAssignedToChange}
                className="form-control"
              >
                <option value="">Select {formData.assignedTo.type === 'user' ? 'User' : 'Team'}</option>
                {formData.assignedTo.type === 'user' 
                  ? users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))
                  : teams.map(team => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))
                }
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2>Key Results</h2>
            <button
              type="button"
              onClick={addKeyResult}
              className="btn btn-secondary btn-sm"
            >
              Add Key Result
            </button>
          </div>

          {formData.keyResults.map((kr, index) => (
            <div key={index} className="key-result-item">
              <div className="key-result-header">
                <h3>Key Result {index + 1}</h3>
                {formData.keyResults.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeKeyResult(index)}
                    className="btn btn-danger btn-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <input
                  type="text"
                  value={kr.description}
                  onChange={(e) => handleKeyResultChange(index, 'description', e.target.value)}
                  className={`form-control ${errors.keyResults?.[index]?.description ? 'error' : ''}`}
                  placeholder="Describe the key result"
                />
                {errors.keyResults?.[index]?.description && (
                  <span className="error-message">{errors.keyResults[index].description}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Target</label>
                  <input
                    type="text"
                    value={kr.target}
                    onChange={(e) => handleKeyResultChange(index, 'target', e.target.value)}
                    className="form-control"
                    placeholder="Target value"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={kr.progress}
                    onChange={(e) => handleKeyResultChange(index, 'progress', e.target.value)}
                    className="form-control"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/okrs')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create OKR'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOKR; 