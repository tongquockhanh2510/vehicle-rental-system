import React from 'react';
import { Users } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import SectionHeader from '../../components/common/SectionHeader';
import RoleBadge from '../../components/common/RoleBadge';
import { mockUserGrowth } from '../../utils/mockData';

const mockUsers = mockUserGrowth.map((item, idx) => ({
  id: `USR-${1000 + idx}`,
  email: `user${idx + 1}@rentcar.vn`,
  role: idx % 7 === 0 ? 'ADMIN' : idx % 3 === 0 ? 'OWNER' : 'USER',
  status: idx % 4 === 0 ? 'SUSPENDED' : 'ACTIVE',
  created_at: new Date(Date.now() - idx * 86400000).toISOString()
}));

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Admin • Users"
        subtitle="Quản trị người dùng đa vai trò. Dữ liệu có thể mở rộng sang endpoint user listing khi backend expose."
      />

      <DataTable
        columns={[
          { key: 'id', title: 'User ID' },
          { key: 'email', title: 'Email' },
          { key: 'role', title: 'Role', render: (row) => <RoleBadge role={row.role} /> },
          {
            key: 'status',
            title: 'Status',
            render: (row) => (
              <span className={`text-xs ${row.status === 'ACTIVE' ? 'text-emerald-300' : 'text-amber-300'}`}>
                {row.status}
              </span>
            )
          },
          { key: 'created_at', title: 'Created', render: (row) => new Date(row.created_at).toLocaleDateString('vi-VN') }
        ]}
        rows={mockUsers}
        emptyTitle="No users"
        emptyDescription="User directory is currently empty."
      />

      <p className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
        <Users className="h-3.5 w-3.5" />
        Backend hiện chưa mở endpoint admin list users. Trang này dùng dữ liệu mô phỏng để trình diễn luồng quản trị.
      </p>
    </div>
  );
}
