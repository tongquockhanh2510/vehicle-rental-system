import React from 'react';
import IconResolver from '../navigation/IconResolver';
import {
  getVehicleTypeLabel,
  getVehicleTypeMeta,
  normalizeVehicleTypeValue,
} from '../../constants/vehicle';

export default function VehicleTypeBadge({ type, className = '' }) {
  const key = normalizeVehicleTypeValue(type);
  const found = getVehicleTypeMeta(key);

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-100 ${className}`}>
      <IconResolver name={found?.icon || 'CarFront'} className="h-3.5 w-3.5" />
      {getVehicleTypeLabel(key)}
    </span>
  );
}
