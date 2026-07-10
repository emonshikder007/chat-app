import { Pencil, Trash2 } from "lucide-react";

const MessageMenu = ({
  open,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-base-100 rounded-t-3xl sm:rounded-2xl w-full sm:w-72 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onEdit}
          className="btn btn-ghost justify-start w-full rounded-none"
        >
          <Pencil size={18} />
          Edit
        </button>

        <button
          onClick={onDelete}
          className="btn btn-ghost justify-start w-full text-error rounded-none"
        >
          <Trash2 size={18} />
          Delete
        </button>

        <button
          onClick={onClose}
          className="btn btn-ghost w-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default MessageMenu;