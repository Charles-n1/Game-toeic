// A window of the game: dark blue, a light frame, and its title written on the top edge.
// gold: a golden frame (the important windows). onClose: shows a ✕ in the corner.
export default function Window({ title, gold, onClose, style, children }) {
  return (
    <div className={'window slide-up' + (gold ? ' window-gold' : '')} style={{ ...(title ? styles.withTitle : null), ...style }}>
      {title && (
        <div className="window-title">
          <span>{title}</span>
        </div>
      )}
      {onClose && (
        <button className="close" onClick={onClose} aria-label="close">
          ✕
        </button>
      )}
      {children}
    </div>
  );
}

const styles = {
  withTitle: {
    marginTop: 24, // room for the title on the edge
  },
};
