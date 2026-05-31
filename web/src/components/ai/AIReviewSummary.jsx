import React, { useState, useEffect, useCallback } from 'react';
import { aiApi } from '../../api/modules/aiApi';

/**
 * AIReviewSummary - displays AI-generated review summary on vehicle detail page.
 * Shows pros, cons, and recommendation with a clean robot-themed UI.
 */
export default function AIReviewSummary({ vehicleId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const fetchSummary = useCallback(async () => {
    if (!vehicleId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await aiApi.getReviewSummary(vehicleId);
      setSummary(data);
    } catch (err) {
      setError('Không thể tải tóm tắt AI. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading) {
    return (
      <div className="ai-summary-card ai-summary-loading">
        <div className="ai-summary-header">
          <span className="ai-robot-icon">🤖</span>
          <span>AI đang phân tích đánh giá...</span>
        </div>
        <div className="ai-summary-skeleton">
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
          <div className="skeleton-line" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-summary-card ai-summary-error">
        <span className="ai-robot-icon">🤖</span>
        <span>{error}</span>
        <button onClick={fetchSummary} className="ai-retry-btn">Thử lại</button>
      </div>
    );
  }

  if (!summary) return null;

  const { summary: s, averageRating, reviewCount } = summary;

  return (
    <div className="ai-summary-card">
      <button
        className="ai-summary-header"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <div className="ai-summary-title-row">
          <span className="ai-robot-icon">🤖</span>
          <span className="ai-summary-title">AI Review Summary</span>
          {reviewCount > 0 && (
            <span className="ai-summary-badge">{reviewCount} đánh giá</span>
          )}
          {averageRating && (
            <span className="ai-rating-badge">⭐ {averageRating}</span>
          )}
        </div>
        <span className="ai-summary-chevron">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="ai-summary-body">
          {/* Pros */}
          {s.pros && s.pros.length > 0 && (
            <div className="ai-summary-section">
              <h4 className="ai-section-title ai-pros-title">
                <span>✅</span> Ưu điểm
              </h4>
              <ul className="ai-summary-list">
                {s.pros.map((pro, i) => (
                  <li key={i} className="ai-list-item ai-pros-item">{pro}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Cons */}
          {s.cons && s.cons.length > 0 && (
            <div className="ai-summary-section">
              <h4 className="ai-section-title ai-cons-title">
                <span>⚠️</span> Nhược điểm
              </h4>
              <ul className="ai-summary-list">
                {s.cons.map((con, i) => (
                  <li key={i} className="ai-list-item ai-cons-item">{con}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendation */}
          {s.recommendation && (
            <div className="ai-recommendation">
              <span className="ai-rec-icon">💡</span>
              <p className="ai-rec-text">{s.recommendation}</p>
            </div>
          )}

          <p className="ai-summary-footer">
            Tóm tắt được tạo bởi AI • Không phải đánh giá chính thức
          </p>
        </div>
      )}
    </div>
  );
}
