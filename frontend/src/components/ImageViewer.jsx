import { X } from "lucide-react";
import { useEffect } from "react";

const ImageViewer = ({ image, onClose }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-5 right-5 btn btn-circle btn-sm"
        onClick={onClose}
      >
        <X />
      </button>

      <img
        src={image}
        alt="Preview"
        onClick={(e) => e.stopPropagation()}
        className="
          max-w-[95vw]
          max-h-[90vh]
          rounded-xl
          object-contain
          shadow-2xl
          select-none
        "
      />
    </div>
  );
};

export default ImageViewer;