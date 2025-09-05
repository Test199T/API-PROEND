import React, { useState, useEffect } from 'react';
import './WaterLogComponent.css';

const WaterLogComponent = () => {
  const [waterLogs, setWaterLogs] = useState([]);
  const [todayProgress, setTodayProgress] = useState(null);
  const [dailyGoal, setDailyGoal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API Base URL
  const API_BASE_URL = 'http://localhost:8080';
  const token = localStorage.getItem('jwt_token');

  useEffect(() => {
    fetchTodayProgress();
    fetchDailyGoal();
    fetchRecentWaterLogs();
  }, []);

  const apiRequest = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const fetchTodayProgress = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/water-logs/progress/today');
      setTodayProgress(response.data);
    } catch (err) {
      console.error('Error fetching today progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyGoal = async () => {
    try {
      const response = await apiRequest('/water-logs/goals/daily');
      setDailyGoal(response.data);
    } catch (err) {
      console.error('Error fetching daily goal:', err);
    }
  };

  const fetchRecentWaterLogs = async () => {
    try {
      const response = await apiRequest('/water-logs?limit=10');
      setWaterLogs(response.data);
    } catch (err) {
      console.error('Error fetching water logs:', err);
    }
  };

  const addWaterLog = async (amount, drinkType, notes = '') => {
    try {
      setLoading(true);
      await apiRequest('/water-logs', {
        method: 'POST',
        body: JSON.stringify({
          amount_ml: amount,
          drink_type: drinkType,
          notes: notes,
          consumed_at: new Date().toISOString()
        })
      });
      
      // Refresh data
      await Promise.all([
        fetchTodayProgress(),
        fetchRecentWaterLogs()
      ]);
    } catch (err) {
      console.error('Error adding water log:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateDailyGoal = async (goalMl) => {
    try {
      setLoading(true);
      await apiRequest('/water-logs/goals/daily', {
        method: 'POST',
        body: JSON.stringify({
          daily_goal_ml: goalMl,
          notes: 'Updated goal'
        })
      });
      
      await fetchDailyGoal();
      await fetchTodayProgress();
    } catch (err) {
      console.error('Error updating daily goal:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteWaterLog = async (logId) => {
    try {
      setLoading(true);
      await apiRequest(`/water-logs/${logId}`, {
        method: 'DELETE'
      });
      
      // Refresh data
      await Promise.all([
        fetchTodayProgress(),
        fetchRecentWaterLogs()
      ]);
    } catch (err) {
      console.error('Error deleting water log:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDrinkIcon = (drinkType) => {
    const icons = {
      water: '💧',
      tea: '🍵',
      coffee: '☕',
      juice: '🧃',
      sports_drink: '🥤',
      other: '🥤'
    };
    return icons[drinkType] || '🥤';
  };

  const getDrinkTypeText = (drinkType) => {
    const types = {
      water: 'น้ำเปล่า',
      tea: 'ชา',
      coffee: 'กาแฟ',
      juice: 'น้ำผลไม้',
      sports_drink: 'เครื่องดื่มเกลือแร่',
      other: 'อื่นๆ'
    };
    return types[drinkType] || 'อื่นๆ';
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#4CAF50'; // Green
    if (percentage >= 75) return '#8BC34A'; // Light Green
    if (percentage >= 50) return '#FFC107'; // Yellow
    if (percentage >= 25) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  if (loading && !todayProgress) {
    return (
      <div className="water-log-container">
        <div className="loading">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="water-log-container">
      <h2>💧 บันทึกการดื่มน้ำ</h2>
      
      {error && (
        <div className="error-message">
          <p>เกิดข้อผิดพลาด: {error}</p>
          <button onClick={() => setError(null)}>ปิด</button>
        </div>
      )}

      {/* Today's Progress */}
      {todayProgress && (
        <div className="progress-section">
          <div className="progress-header">
            <h3>ความคืบหน้าวันนี้</h3>
            <span className="date">{new Date().toLocaleDateString('th-TH')}</span>
          </div>
          
          <div className="progress-stats">
            <div className="progress-number">
              <span className="consumed">{todayProgress.consumed_ml}</span>
              <span className="separator">/</span>
              <span className="goal">{todayProgress.goal_ml}</span>
              <span className="unit">ml</span>
            </div>
            
            <div className="progress-percentage">
              {todayProgress.progress_percentage}%
            </div>
          </div>

          <div className="progress-bar-container">
            <div 
              className="progress-bar"
              style={{ 
                width: `${Math.min(todayProgress.progress_percentage, 100)}%`,
                backgroundColor: getProgressColor(todayProgress.progress_percentage)
              }}
            ></div>
          </div>

          {todayProgress.remaining_ml > 0 && (
            <p className="remaining">
              เหลืออีก {todayProgress.remaining_ml} ml
            </p>
          )}

          {todayProgress.recommendations && todayProgress.recommendations.length > 0 && (
            <div className="recommendations">
              <h4>คำแนะนำ:</h4>
              <ul>
                {todayProgress.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Daily Goal Setting */}
      <div className="goal-section">
        <h3>เป้าหมายรายวัน</h3>
        {dailyGoal ? (
          <div className="current-goal">
            <p>เป้าหมายปัจจุบัน: {dailyGoal.daily_goal_ml} ml</p>
            <div className="goal-buttons">
              <button onClick={() => updateDailyGoal(1500)}>1.5L</button>
              <button onClick={() => updateDailyGoal(2000)}>2.0L</button>
              <button onClick={() => updateDailyGoal(2500)}>2.5L</button>
            </div>
          </div>
        ) : (
          <div className="set-goal">
            <p>ยังไม่ได้ตั้งเป้าหมาย</p>
            <button onClick={() => updateDailyGoal(2000)}>
              ตั้งเป้าหมาย 2.0L
            </button>
          </div>
        )}
      </div>

      {/* Quick Add Buttons */}
      <div className="quick-add-section">
        <h3>เพิ่มการดื่มน้ำ</h3>
        <div className="quick-add-buttons">
          <button 
            onClick={() => addWaterLog(250, 'water', 'แก้วน้ำ')}
            disabled={loading}
            className="water-btn"
          >
            💧 +250ml
          </button>
          <button 
            onClick={() => addWaterLog(200, 'coffee', 'กาแฟ')}
            disabled={loading}
            className="coffee-btn"
          >
            ☕ +200ml
          </button>
          <button 
            onClick={() => addWaterLog(300, 'water', 'ขวดน้ำ')}
            disabled={loading}
            className="bottle-btn"
          >
            🍼 +300ml
          </button>
          <button 
            onClick={() => addWaterLog(500, 'water', 'ขวดใหญ่')}
            disabled={loading}
            className="large-btn"
          >
            🥤 +500ml
          </button>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="recent-entries">
        <h3>รายการล่าสุด</h3>
        {waterLogs.length > 0 ? (
          <div className="water-logs-list">
            {waterLogs.map(log => (
              <div key={log.id} className="water-log-item">
                <div className="log-icon">
                  {getDrinkIcon(log.drink_type)}
                </div>
                <div className="log-details">
                  <div className="log-amount">{log.amount_ml}ml</div>
                  <div className="log-type">{getDrinkTypeText(log.drink_type)}</div>
                  {log.notes && <div className="log-notes">{log.notes}</div>}
                </div>
                <div className="log-time">
                  {formatTime(log.consumed_at)}
                </div>
                <button 
                  onClick={() => deleteWaterLog(log.id)}
                  className="delete-btn"
                  disabled={loading}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-entries">ยังไม่มีรายการการดื่มน้ำ</p>
        )}
      </div>

      {/* Custom Add Form */}
      <div className="custom-add-section">
        <h3>เพิ่มแบบกำหนดเอง</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          addWaterLog(
            parseInt(formData.get('amount')),
            formData.get('drinkType'),
            formData.get('notes')
          );
          e.target.reset();
        }}>
          <div className="form-group">
            <label>ปริมาณ (ml):</label>
            <input 
              type="number" 
              name="amount" 
              min="1" 
              max="10000" 
              required 
              placeholder="250"
            />
          </div>
          
          <div className="form-group">
            <label>ประเภทเครื่องดื่ม:</label>
            <select name="drinkType" required>
              <option value="water">น้ำเปล่า</option>
              <option value="coffee">กาแฟ</option>
              <option value="tea">ชา</option>
              <option value="juice">น้ำผลไม้</option>
              <option value="sports_drink">เครื่องดื่มเกลือแร่</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>หมายเหตุ (ไม่บังคับ):</label>
            <input 
              type="text" 
              name="notes" 
              placeholder="เช่น ตอนเช้า, หลังออกกำลังกาย"
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'กำลังบันทึก...' : 'เพิ่มรายการ'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WaterLogComponent;
