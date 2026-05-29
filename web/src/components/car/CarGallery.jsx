import React, { useState } from 'react';
import { resolveImage } from '../../utils/image';

export default function CarGallery({ images = [], title = 'Ảnh xe' }) {
  const safeImages = images.length ? images : [resolveImage('', 0)];
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-3">
      <div className="h-80 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 md:h-[420px]">
        <img
          src={resolveImage(safeImages[activeIndex], activeIndex)}
          alt={title}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.src = resolveImage('', activeIndex + 1);
          }}
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {safeImages.slice(0, 8).map((item, idx) => (
          <button
            type="button"
            key={`${item}-${idx}`}
            onClick={() => setActiveIndex(idx)}
            className={`h-20 overflow-hidden rounded-xl border ${
              idx === activeIndex ? 'border-cyan-400' : 'border-white/10'
            }`}
          >
            <img
              src={resolveImage(item, idx)}
              alt={`${title}-${idx + 1}`}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = resolveImage('', idx + 10);
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
