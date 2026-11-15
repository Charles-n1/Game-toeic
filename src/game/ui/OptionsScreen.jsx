import Landscape from './Landscape';
import Window from './Window';
import OptionsPanel from './OptionsPanel';

// The options, from the main menu.
export default function OptionsScreen({ onBack }) {
  return (
    <div className="screen">
      <Landscape />
      <div className="start">
        <Window title="Options" gold onClose={onBack}>
          <OptionsPanel />
        </Window>
      </div>
    </div>
  );
}
