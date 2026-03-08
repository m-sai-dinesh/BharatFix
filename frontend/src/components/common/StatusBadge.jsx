export const StatusBadge = ({ status }) => {
  const map = {
    'Pending': 'badge-pending',
    'In Progress': 'badge-inprogress',
    'Resolved': 'badge-resolved',
    'Closed': 'badge-closed',
  };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{status}</span>;
};

export const UrgencyBadge = ({ urgency }) => {
  const map = {
    'Emergency': 'badge-emergency',
    'High': 'badge-high',
    'Medium': 'badge-medium',
    'Low': 'badge-low',
  };
  return <span className={`badge ${map[urgency] || 'badge-medium'}`}>{urgency}</span>;
};

export const StatusTracker = ({ currentStatus }) => {
  const steps = ['Pending', 'In Progress', 'Resolved', 'Closed'];
  const currentIdx = steps.indexOf(currentStatus);

  return (
    <div className="status-track">
      {steps.map((step, i) => (
        <div key={step} style={{ display: 'flex', flex: 1, alignItems: 'flex-start' }}>
          <div className="status-step" style={{ flex: 'none', width: 80 }}>
            <div
              className={`status-step-dot ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {i < currentIdx ? '✓' : i + 1}
            </div>
            <div className={`status-step-label ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}`}>
              {step}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`status-line ${i < currentIdx ? 'done' : ''}`}
              style={{ flex: 1, marginTop: 17 }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
