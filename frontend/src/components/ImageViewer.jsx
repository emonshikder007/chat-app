import { X, Download } from "lucide-react";
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

  const handleDownload = async () => {
    try {
      const response = await fetch(image);

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `chatmee-${Date.now()}.jpg`;

      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute top-5 right-5 flex gap-2">

        <button
          className="btn btn-circle btn-sm btn-primary"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
        >
          <Download size={18} />
        </button>

        <button
          className="btn btn-circle btn-sm"
          onClick={onClose}
        >
          <X />
        </button>

      </div>
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