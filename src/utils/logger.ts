/**
 * System Logger Utility
 * Captures user actions for the Admin Dashboard Recent Activity
 */

export const logActivity = (action: string, module: string = 'General') => {
  try {
    const userEmail = localStorage.getItem('currentUser') || 'Anonymous';
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userEmail,
      action,
      module,
      timestamp: new Date().toISOString()
    };

    const currentLogs = JSON.parse(localStorage.getItem('system_activity_logs') || '[]');
    // Keep only last 500 logs for performance
    const updatedLogs = [newLog, ...currentLogs].slice(0, 500);
    
    localStorage.setItem('system_activity_logs', JSON.stringify(updatedLogs));
    
    // Dispatch custom event for real-time UI updates if dashboard is open
    window.dispatchEvent(new Event('activity_logged'));
  } catch (e) {
    console.error('Failed to log activity:', e);
  }
};
