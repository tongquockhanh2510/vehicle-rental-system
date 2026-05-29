import React from 'react';
import Modal from './Modal';

export default function ConfirmDialog({
  open,
  title = 'Vui lòng xác nhận',
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  danger = false,
  onConfirm,
  onCancel
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      width="max-w-lg"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] ${
              danger ? 'bg-rose-600 hover:bg-rose-500' : 'bg-cyan-500 hover:bg-cyan-400'
            }`}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <p className="text-sm text-slate-300">{description}</p>
    </Modal>
  );
}

