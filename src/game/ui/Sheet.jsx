// A full-screen menu of the game, with its title and a button to close it.
export default function Sheet({ title, onClose, children }) {
  return (
    <div className="sheet">
      <div className="row between">
        <span className="title">{title}</span>
        <button className="close" onClick={onClose} aria-label="close">
          ✕
        </button>
      </div>
      {children}
    </div>
  );
}
