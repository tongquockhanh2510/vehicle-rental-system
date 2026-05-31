import React from 'react';
import * as Icons from 'lucide-react';

export default function IconResolver({ name, className = 'h-4 w-4' }) {
  const IconComponent = Icons[name] || Icons.Circle;
  return <IconComponent className={className} />;
}
