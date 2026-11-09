import React from "react";
import { X } from "lucide-react";

interface ChartLightboxProps {
  isOpen: boolean;
  imagePath: string | null;
  onClose: () => void;
}

export const ChartLightbox: React.FC<ChartLightboxProps> = ({
  isOpen,
  imagePath,
  onClose,
}) => {
  if (!isOpen || !imagePath) return null;

  // Convert absolute path to custom protocol URL format: trade-img://absolute/path/to/image.png
  const imageUrl = `trade-img://${encodeURIComponent(imagePath)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] bg-[#151921] border border-[#2A303F] rounded-xl p-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 bg-black/60 hover:bg-black text-white p-1.5 rounded-full cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>
        <img
          src={imageUrl}
          alt="Trade Chart Setup"
          className="max-h-[85vh] max-w-full object-contain rounded-lg"
        />
      </div>
    </div>
  );
};
