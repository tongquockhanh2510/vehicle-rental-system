import React, { useState, useEffect, useCallback } from 'react';
import { aiApi } from '../../api/modules/aiApi';

/**
 * AITrustScore - displays AI trust score badge for a vehicle/owner.
 * Can be used on vehicle cards, detail pages, and booking confirmation.
 */
export default function AITrustScore({ vehicleId, ownerId, compact = false }) {
  const [trustData, setTrustData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!vehicleId) return;
    setLoading(true);
    try {
      const data = await aiApi.getTrustScore(vehicleId, ownerId);
      setTrustData(data);
    } catch {
      // Silently fail - trust score is optional supplementary info
    } finally {
      setLoading(false);
    }
  }, [vehicleId, ownerId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading) {
    return <div className="trust-score-skeleton" />;
  }

  if (!trustData) return null;

  const { trustScore, level, explanation } = trustData;

  const levelColor = {
    'Excellent': '#22c55e',
    'Good': '#3b82f6',
    'Average': '#f59e0b',
    'Below Average': '#f97316',
    'Poor': '#ef4444',
  }[level] || '#94a3b8';

  if (compact) {
    return (
      <div className="trust-score-badge trust-score-compact" title={explanation}>
        <span className="trust-shield" style={{ color: levelColor }}>🛡️</span>
        <span className="trust-score-value" style={{ color: levelColor }}>
          {trustScore}
        </span>
        <span className="trust-score-label">{level}</span>
      </div>
    );
  }

  return (
    <div className="trust-score-card">
      <div className="trust-score-header">
        <span className="trust-shield-lg" style={{ color: levelColor }}>🛡️</span>
        <div className="trust-score-info">
          <div className="trust-score-row">
            <span className="trust-score-number" style={{ color: levelColor }}>
              {trustScore}
              <span className="trust-score-max">/100</span>
            </span>
            <span
              className="trust-level-badge"
              style={{ backgroundColor: levelColor + '22', color: levelColor, border: `1px solid ${levelColor}44` }}
            >
              {level}
            </span>
          </div>
          <div className="trust-score-bar-bg">
            <div
              className="trust-score-bar-fill"
              style={{ width: `${trustScore}%`, backgroundColor: levelColor }}
            />
          </div>
        </div>
      </div>
      {explanation && (
        <p className="trust-explanation">{explanation}</p>
      )}
    </div>
  );
}
