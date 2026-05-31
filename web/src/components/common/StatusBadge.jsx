import React from 'react';
import { getStatusLabel, getStatusStyle } from '../../constants/status';

export default function StatusBadge({ status, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(status)} ${className}`}>
      {getStatusLabel(status)}
    </span>
  );
}
