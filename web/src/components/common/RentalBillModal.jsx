import React from 'react';
import Modal from './Modal';
import PremiumButton from './PremiumButton';
import RentalBillView from './RentalBillView';

export default function RentalBillModal({
  open,
  onClose,
  title = 'Chi tiết bill thuê xe',
  bill,
  showRenter = false,
  showTerms = false,
  termsState = {},
  onToggleTerm = () => {},
  onConfirm,
  confirmLabel = 'Gửi yêu cầu thuê',
  confirmDisabled = false,
  loading = false
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width="max-w-5xl"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <PremiumButton variant="secondary" onClick={onClose}>
            Quay lại
          </PremiumButton>
          {onConfirm ? (
            <PremiumButton onClick={onConfirm} disabled={confirmDisabled || loading}>
              {loading ? 'Đang xử lý...' : confirmLabel}
            </PremiumButton>
          ) : null}
        </div>
      }
    >
      <RentalBillView
        bill={bill}
        showRenter={showRenter}
        showTerms={showTerms}
        termsState={termsState}
        onToggleTerm={onToggleTerm}
      />
    </Modal>
  );
}
