import React from 'react';

export default function UserList({ users, onDelete }) {
  return (
    <div style={{
      background: 'white',
      padding: '20px',
      marginBottom: '30px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '20px' }}>
        User Management ({users.length} users)
      </h2>
      {users.map(user => (
        <div key={user.user_id} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          padding: '10px',
          background: '#f5f5f5',
          borderRadius: '4px'
        }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>{user.email}</div>
            <div style={{ color: '#666', fontSize: '14px' }}>
              {user.is_admin ? 'Administrator' : 'Regular User'}
            </div>
          </div>
          <button
            style={{
              background: user.is_admin ? '#ccc' : '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: user.is_admin ? 'not-allowed' : 'pointer',
              opacity: user.is_admin ? 0.6 : 1
            }}
            onClick={() => !user.is_admin && onDelete(user.user_id)}
            disabled={user.is_admin}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
