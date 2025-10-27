import React from 'react';
export default function Progress({ answered, total }) {
return (
<div className="progress">Answered {answered} / {total}</div>
);
}