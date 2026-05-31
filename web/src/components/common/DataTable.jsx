import React from 'react';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';

export default function DataTable({ columns = [], rows = [], loading = false, emptyTitle, emptyDescription }) {
  if (loading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (!rows.length) {
    return <EmptyState title={emptyTitle || 'Không tìm thấy dữ liệu'} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60">
      <table className="min-w-full divide-y divide-white/10 text-left text-sm">
        <thead className="bg-slate-900/90">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-semibold tracking-wide text-slate-300">
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row, rowIndex) => (
            <tr key={row.id || row._id || rowIndex} className="transition hover:bg-white/5">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-slate-200 align-top">
                  {column.render ? column.render(row, rowIndex) : row[column.key] ?? '--'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

