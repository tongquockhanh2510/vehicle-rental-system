import React from 'react';
import { AlertTriangle, Info, XCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import SectionHeader from '../../components/common/SectionHeader';
import { formatDateTime } from '../../utils/formatters';
import { mockSystemLogs } from '../../utils/mockData';

const iconByLevel = {
  INFO: <Info className="h-4 w-4 text-cyan-300" />,
  WARN: <AlertTriangle className="h-4 w-4 text-amber-300" />,
  ERROR: <XCircle className="h-4 w-4 text-rose-300" />
};

export default function AdminSystemLogsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Admin • System Logs"
        subtitle="Theo dõi sự kiện cảnh báo, lỗi dịch vụ và hành vi bất thường để phản ứng vận hành nhanh hơn."
      />

      <DataTable
        rows={mockSystemLogs}
        columns={[
          { key: 'id', title: 'Log ID' },
          { key: 'level', title: 'Level', render: (row) => <span className="inline-flex items-center gap-2">{iconByLevel[row.level]} {row.level}</span> },
          { key: 'message', title: 'Message' },
          { key: 'timestamp', title: 'Timestamp', render: (row) => formatDateTime(row.timestamp) }
        ]}
      />
    </div>
  );
}
