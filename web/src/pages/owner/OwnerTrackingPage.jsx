import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, LocateFixed, MapPinned, Route } from 'lucide-react';
import { trackingApi, vehicleApi } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, pickArray } from '../../utils/formatters';

export default function OwnerTrackingPage() {
  const { userId } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [movement, setMovement] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVehicles = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const response = await vehicleApi.getOwnerVehicles(userId);
        const list = pickArray(response.data);
        setVehicles(list);
        if (list.length) setSelectedVehicleId(list[0]._id);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, [userId]);

  useEffect(() => {
    const loadTracking = async () => {
      if (!selectedVehicleId) return;
      try {
        const [latestRes, historyRes, movementRes] = await Promise.allSettled([
          trackingApi.latest(selectedVehicleId),
          trackingApi.history(selectedVehicleId, {
            start_date: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
            end_date: new Date().toISOString()
          }),
          trackingApi.movementHistory(selectedVehicleId, {
            start_date: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
            end_date: new Date().toISOString()
          })
        ]);

        setLatest(latestRes.status === 'fulfilled' ? latestRes.value.data : null);
        setHistory(historyRes.status === 'fulfilled' ? pickArray(historyRes.value.data) : []);
        setMovement(movementRes.status === 'fulfilled' ? pickArray(movementRes.value.data) : []);
      } catch {
        setLatest(null);
      }
    };

    loadTracking();
  }, [selectedVehicleId]);

  const boundaryStatus = useMemo(() => {
    const value = String(latest?.boundary_status || latest?.status || '').toUpperCase();
    if (value.includes('OUT')) return 'OUT_OF_BOUNDARY';
    return latest ? 'IN_BOUNDARY' : 'PENDING';
  }, [latest]);

  if (loading) {
    return <LoadingSkeleton rows={4} />;
  }

  if (!vehicles.length) {
    return (
      <EmptyState
        icon={MapPinned}
        title="No vehicles for tracking"
        description="Tracking dashboard sẽ hiển thị sau khi bạn có xe đang hoạt động trên nền tảng."
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Vehicle Tracking"
        subtitle="Giám sát vị trí realtime, lịch sử di chuyển và cảnh báo vượt phạm vi an toàn."
      />

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <label className="text-xs uppercase tracking-[0.18em] text-slate-300">Select vehicle</label>
        <select
          value={selectedVehicleId}
          onChange={(event) => setSelectedVehicleId(event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
        >
          {vehicles.map((item) => (
            <option key={item._id} value={item._id}>
              {item.brand} {item.model} ({item.license_plate})
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Mock map view</h3>
            <StatusBadge status={boundaryStatus} />
          </div>
          <div className="relative mt-4 h-80 overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950">
            <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_1px_1px,rgba(56,189,248,0.4)_1px,transparent_0)] [background-size:30px_30px]" />
            <div className="absolute left-1/3 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-500/15 px-3 py-1 text-xs text-cyan-100">
              <LocateFixed className="h-3.5 w-3.5" />
              Current location pin
            </div>
            <div className="absolute right-6 top-6 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-xs text-slate-200">
              Last updated: {formatDateTime(latest?.timestamp || latest?.updated_at)}
            </div>
          </div>
        </article>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Current location</h3>
            <p className="mt-2 text-sm text-slate-200">{latest?.address || 'No live location data yet.'}</p>
            <p className="mt-1 text-xs text-slate-400">
              Lat: {latest?.latitude || '--'} | Lng: {latest?.longitude || '--'}
            </p>
            <p className="mt-2 text-xs text-slate-300">Allowed region: {latest?.allowed_region || 'Configured by owner'}</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Boundary alerts</h3>
            {boundaryStatus === 'OUT_OF_BOUNDARY' ? (
              <p className="mt-2 inline-flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                <AlertTriangle className="h-3.5 w-3.5" /> Vehicle detected outside allowed boundary.
              </p>
            ) : (
              <p className="mt-2 text-xs text-emerald-200">No boundary violations detected.</p>
            )}
          </article>

          <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Movement history</h3>
            <div className="mt-2 space-y-2">
              {(movement.length ? movement : history).slice(0, 4).map((item, idx) => (
                <div key={idx} className="rounded-lg border border-white/10 bg-slate-950/40 px-2 py-2 text-xs text-slate-200">
                  <p className="flex items-center gap-1"><Route className="h-3.5 w-3.5 text-cyan-300" /> {item.start_location || item.address || 'Location point'}</p>
                  <p className="mt-1 text-slate-400">{formatDateTime(item.created_at || item.timestamp)}</p>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}
