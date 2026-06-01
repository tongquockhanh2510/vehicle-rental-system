import React, { useMemo } from 'react';
import {
  CalendarRange,
  Copy,
  CreditCard,
  MapPin,
  QrCode,
  ShieldCheck,
  User
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import {
  buildPayoutDisplay,
  buildVietQrUrl,
  describeBillPeriod,
  formatBankAccount,
  getPricingRows,
  getTransferAccountNumber,
  validateQrPayload
} from '../../utils/rentalBill';
import { getFallbackCarImage, resolveImage } from '../../utils/image';

export default function RentalBillView({
  bill,
  showRenter = false,
  showTerms = false,
  termsState = {},
  onToggleTerm = () => {}
}) {
  if (!bill) return null;

  const vehicleImage = resolveImage(bill?.vehicle?.image) || getFallbackCarImage();
  const payoutInfo = bill?.owner?.payout_info || {};
  const pricingRows = getPricingRows(bill?.pricing || {});
  const accountNumber = getTransferAccountNumber(payoutInfo);

  const transferContent = useMemo(() => {
    const rentalCode = String(bill?.rental_id || '').slice(-8).toUpperCase() || 'RENTCAR';
    return `RENTCAR ${rentalCode}`;
  }, [bill?.rental_id]);

  const qrUrl = useMemo(
    () => buildVietQrUrl(payoutInfo, Number(bill?.pricing?.total_amount || 0), transferContent),
    [payoutInfo, bill?.pricing?.total_amount, transferContent]
  );
  const qrValidation = useMemo(
    () => validateQrPayload(payoutInfo, Number(bill?.pricing?.total_amount || 0), transferContent),
    [payoutInfo, bill?.pricing?.total_amount, transferContent]
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Thông tin xe</p>
        <div className="mt-3 flex flex-wrap items-start gap-3">
          <img
            src={vehicleImage}
            alt={`${bill?.vehicle?.brand || 'Xe'} ${bill?.vehicle?.model || ''}`.trim()}
            className="h-24 w-36 rounded-xl border border-white/10 object-cover"
            onError={(event) => {
              event.currentTarget.src = getFallbackCarImage();
            }}
          />
          <div className="space-y-1 text-sm text-slate-200">
            <p className="text-base font-semibold text-white">
              {(bill?.vehicle?.brand || 'Xe') + ' ' + (bill?.vehicle?.model || '')}
            </p>
            <p>
              Biển số:{' '}
              <span className="font-medium text-white">
                {bill?.vehicle?.license_plate || 'Chưa cập nhật'}
              </span>
            </p>
            <p>
              Loại xe:{' '}
              <span className="font-medium text-white">
                {bill?.vehicle?.vehicle_type || 'Chưa cập nhật'}
              </span>
            </p>
            <p>
              Nhiên liệu/Hộp số:{' '}
              <span className="font-medium text-white">
                {bill?.vehicle?.fuel_type || '---'} • {bill?.vehicle?.transmission || '---'}
              </span>
            </p>
            <p>
              Số ghế: <span className="font-medium text-white">{bill?.vehicle?.seats || '--'}</span>
            </p>
          </div>
        </div>
        <div className="mt-3 grid gap-2 text-xs text-slate-300 md:grid-cols-2">
          <p className="inline-flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 text-cyan-300" /> Nhận xe tại:{' '}
            <span className="font-semibold text-white">
              {bill?.vehicle?.pickup_location || 'Chưa cập nhật'}
            </span>
          </p>
          <p className="inline-flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 text-cyan-300" /> Trả xe tại:{' '}
            <span className="font-semibold text-white">
              {bill?.vehicle?.return_location || 'Chưa cập nhật'}
            </span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Thông tin chủ xe</p>
          <div className="mt-3 space-y-1">
            <p className="font-semibold text-white">{bill?.owner?.name || 'Chủ xe đã xác thực'}</p>
            <p>
              Email: <span className="text-white">{bill?.owner?.email || 'Chưa cập nhật'}</span>
            </p>
            <p>
              SĐT: <span className="text-white">{bill?.owner?.phone || 'Chưa cập nhật'}</span>
            </p>
            <p className="inline-flex items-center gap-2 text-emerald-200">
              <ShieldCheck className="h-4 w-4" /> Chủ xe đã xác thực
            </p>
            <p className="inline-flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-cyan-300" /> {buildPayoutDisplay(payoutInfo)}
            </p>
            <p>
              Chủ tài khoản:{' '}
              <span className="text-white">{payoutInfo?.bank_account_holder || 'Chưa cập nhật'}</span>
            </p>
          </div>

          <div className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">Thông tin chuyển khoản</p>
            <p className="mt-2 text-xs text-slate-300">
              Ngân hàng:{' '}
              <span className="font-semibold text-white">{payoutInfo?.bank_name || 'Chưa cập nhật'}</span>
            </p>
            <p className="mt-1 text-xs text-slate-300">
              Mã ngân hàng:{' '}
              <span className="font-semibold text-white">{payoutInfo?.bank_code || 'Chưa cập nhật'}</span>
            </p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-xs text-slate-300">
                Số tài khoản:{' '}
                <span className="font-semibold text-white">{formatBankAccount(accountNumber, 'full')}</span>
              </p>
              {accountNumber ? (
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(accountNumber)}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2 py-1 text-[11px] text-slate-200 transition hover:bg-white/10"
                >
                  <Copy className="h-3 w-3" /> Sao chép
                </button>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Nội dung CK: <span className="font-semibold text-white">{transferContent}</span>
            </p>
            <div className="mt-1 flex justify-end">
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(transferContent)}
                className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2 py-1 text-[11px] text-slate-200 transition hover:bg-white/10"
              >
                <Copy className="h-3 w-3" /> Sao chép nội dung CK
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/5 p-4 text-sm text-slate-200">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Chi tiết thuê</p>
          <p className="mt-3 inline-flex items-center gap-2 text-slate-100">
            <CalendarRange className="h-4 w-4 text-cyan-300" />
            {describeBillPeriod(bill?.rental_start_date, bill?.rental_end_date)}
          </p>
          <div className="mt-3 space-y-2">
            {pricingRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span>{row.label}</span>
                <span className="font-medium text-white">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-cyan-400/20 pt-3 text-base font-semibold text-white">
            <div className="flex items-center justify-between">
              <span>Tổng tạm tính</span>
              <span>{formatCurrency(bill?.pricing?.total_amount || 0)}</span>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/35 p-3">
            <p className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-300">
              <QrCode className="h-3.5 w-3.5 text-cyan-300" />
              QR chuyển khoản
            </p>
            {qrUrl ? (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={qrUrl}
                  alt="QR chuyển khoản"
                  className="h-44 w-44 rounded-xl border border-white/15 bg-white object-contain p-1"
                />
                <p className="text-center text-[11px] text-slate-300">
                  Quét QR để chuyển đúng số tiền và nội dung thanh toán.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-300">{qrValidation.reason}</p>
            )}
          </div>
        </div>
      </div>

      {showRenter ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Thông tin người thuê</p>
          <div className="mt-3 space-y-1">
            <p className="inline-flex items-center gap-2 font-semibold text-white">
              <User className="h-4 w-4 text-cyan-300" /> {bill?.renter?.name || 'Chưa cập nhật'}
            </p>
            <p>
              Email: <span className="text-white">{bill?.renter?.email || 'Chưa cập nhật'}</span>
            </p>
            <p>
              SĐT: <span className="text-white">{bill?.renter?.phone || 'Chưa cập nhật'}</span>
            </p>
            {bill?.note ? (
              <p>
                Ghi chú: <span className="text-white">{bill.note}</span>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {showTerms ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Điều khoản xác nhận</p>
          <div className="mt-3 space-y-2">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={Boolean(termsState?.acceptedRules)}
                onChange={(event) => onToggleTerm('acceptedRules', event.target.checked)}
                className="mt-1"
              />
              <span>Tôi xác nhận đã đọc điều kiện thuê xe.</span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={Boolean(termsState?.acceptedPayment)}
                onChange={(event) => onToggleTerm('acceptedPayment', event.target.checked)}
                className="mt-1"
              />
              <span>Tôi đồng ý thanh toán tiền cọc và phí thuê theo quy định.</span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={Boolean(termsState?.acceptedApproval)}
                onChange={(event) => onToggleTerm('acceptedApproval', event.target.checked)}
                className="mt-1"
              />
              <span>Tôi hiểu rằng chủ xe cần duyệt yêu cầu trước khi hợp đồng có hiệu lực.</span>
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}
