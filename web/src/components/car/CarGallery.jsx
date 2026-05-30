import React, { useEffect, useMemo, useState } from "react";
import {
  buildVehicleFallbackImage,
  getVehicleImages,
} from "../../utils/image";

export default function CarGallery({ images = [], vehicle, title = "Ảnh xe" }) {
  const fallbackImage = useMemo(
    () => buildVehicleFallbackImage(vehicle),
    [vehicle],
  );

  const normalizedImages = useMemo(() => {
    const fromVehicle = getVehicleImages(vehicle);
    if (fromVehicle.length) return fromVehicle;
    const fromProp = getVehicleImages({ images });
    if (fromProp.length) return fromProp;
    return [fallbackImage];
  }, [images, vehicle, fallbackImage]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [mainImageError, setMainImageError] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setMainImageError(false);
  }, [normalizedImages]);

  const activeImage = normalizedImages[activeIndex] || fallbackImage;

  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-3">
        <div className="flex h-80 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 md:h-[420px]">
          <img
            src={mainImageError ? fallbackImage : activeImage}
            alt={title}
            className="h-full w-full object-contain"
            onError={() => setMainImageError(true)}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {normalizedImages.slice(0, 8).map((item, idx) => (
          <button
            type="button"
            key={`${item}-${idx}`}
            onClick={() => {
              setActiveIndex(idx);
              setMainImageError(false);
            }}
            className={`h-20 overflow-hidden rounded-xl border ${
              idx === activeIndex ? "border-cyan-400" : "border-white/10"
            }`}
          >
            <img
              src={item}
              alt={`${title}-${idx + 1}`}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = fallbackImage;
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
