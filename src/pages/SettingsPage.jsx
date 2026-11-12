import { useState, useRef, useEffect } from 'react';
import AppText from '../components/AppText';
import AnswerButton from '../components/AnswerButton';
import CheckBox from '../components/CheckBox';
import MainButton from '../components/MainButton';
import PercentSlider from '../components/PercentSlider';
import ScrollView from '../components/ScrollView';
import { THEMES } from '../themes';
import { MUSICS, playMusic, playSound, setMusicVolume, setSoundVolume } from '../sounds';
import { photoToWallpaper } from '../logic/wallpaper';
import { CLOUD_READY, listenSyncStatus, logOut } from '../logic/cloud';

const THEMES_SHOWN = 4; // themes visible before "see more theme"

// What the cloud save is doing, for the player.
const SYNC_TEXTS = {
  off: '',
  saving: 'Saving...',
  saved: 'Saved online ✓',
  offline: 'Not saved online yet (no internet ?). It will be sent later.',
};

// onOpenGoal: opens the goal page. onOpenTutorial: plays the tutorial again.
// account: the email of the logged-in account (null = none). onOpenLogin / onOpenSubscribe: the account pages.
// focus: 'music' | 'theme' | 'wallpaper' -> the page scrolls to this section (for the tutorial). null = nothing.
export default function SettingsPage({
  settings,
  changeSetting,
  onOpenGoal,
  onOpenTutorial,
  account,
  onOpenLogin,
  onOpenSubscribe,
  focus,
}) {
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [syncStatus, setSyncStatus] = useState('off'); // what the cloud save is doing (see SYNC_TEXTS)
  const visibleThemes = showAllThemes ? THEMES : THEMES.slice(0, THEMES_SHOWN);
  const fileInput = useRef(null); // the hidden "choose a file" input
  const scroll = useRef(null); // the ScrollView, to scroll it from the code
  // The titles of the sections the tutorial shows.
  const sections = { music: useRef(null), theme: useRef(null), wallpaper: useRef(null) };

  // Each time the tutorial shows another section: scroll so it is at the top.
  useEffect(scrollToFocus, [focus]);

  function scrollToFocus() {
    const section = sections[focus];
    if (section) {
      scroll.current.scrollTo({ top: section.current.offsetTop - 10, behavior: 'smooth' });
    }
  }

  // [] = listen to the cloud save while the page is open.
  useEffect(listenStatus, []);

  function listenStatus() {
    return listenSyncStatus(setSyncStatus);
  }

  function toggleThemes() {
    setShowAllThemes(!showAllThemes);
  }

  function chooseMusic(music) {
    playMusic(music);
    changeSetting('music', music);
  }

  function changeMusicVolume(volume) {
    setMusicVolume(volume);
    changeSetting('musicVolume', volume);
  }

  function changeSoundVolume(volume) {
    setSoundVolume(volume);
    changeSetting('soundVolume', volume);
  }

  function previewSound() {
    playSound('success');
  }

  function changeFrendComes(checked) {
    changeSetting('frendComes', checked);
  }

  function changeNoWhy(checked) {
    changeSetting('noWhy', checked);
  }

  function changeWallpaperOpacity(opacity) {
    changeSetting('wallpaperOpacity', opacity);
  }

  // Opens the phone's photo gallery (the browser's file picker).
  function pickWallpaper() {
    fileInput.current.click();
  }

  async function wallpaperChosen(event) {
    const file = event.target.files[0];
    event.target.value = ''; // so the same photo can be chosen again later
    if (!file) return;
    try {
      changeSetting('wallpaper', await photoToWallpaper(file));
    } catch (error) {
      // Not a usable photo: we keep the old wallpaper.
    }
  }

  function removeWallpaper() {
    changeSetting('wallpaper', null);
  }

  return (
    <ScrollView ref={scroll} contentStyle={styles.page}>
      <AppText style={styles.title}>Parameters</AppText>

      {/* No Firebase project yet (firebaseConfig.js empty): no accounts */}
      {CLOUD_READY && (
        <>
          <AppText style={styles.section}>Account</AppText>
          {account ? (
            <>
              <AppText>Logged in as {account}</AppText>
              <AppText style={{ ...styles.sync, ...(syncStatus === 'saved' && styles.synced) }}>
                {SYNC_TEXTS[syncStatus]}
              </AppText>
              {/* The progress stays on the phone, it's just not saved online anymore */}
              <MainButton label="Log out" onPress={logOut} />
            </>
          ) : (
            <>
              <AppText style={styles.sync}>Save your progress online: never lost, and on all your phones.</AppText>
              <MainButton label="Log in" onPress={onOpenLogin} />
              <MainButton label="Subscribe" onPress={onOpenSubscribe} />
            </>
          )}
        </>
      )}

      <AppText style={styles.section}>Goal</AppText>
      <MainButton label="goal" onPress={onOpenGoal} />

      <AppText style={styles.section}>Tutorial</AppText>
      <MainButton label="tutorial" onPress={onOpenTutorial} />

      <AppText style={styles.section}>Justification</AppText>
      <CheckBox label='No justification (no "Why ?" to write)' checked={settings.noWhy} onChange={changeNoWhy} />

      <AppText style={styles.section}>Frend</AppText>
      <CheckBox label="Authorize Frend to come sometimes" checked={settings.frendComes} onChange={changeFrendComes} />

      <div ref={sections.music}>
        <AppText style={styles.section}>Music</AppText>
      </div>
      <PercentSlider label="Volume" value={settings.musicVolume} onChange={changeMusicVolume} />
      {MUSICS.map((item) => (
        <AnswerButton
          key={item.name}
          label={item.name}
          look={item === settings.music ? 'selected' : 'normal'}
          onPress={() => chooseMusic(item)}
        />
      ))}

      <AppText style={styles.section}>Sounds</AppText>
      {/* When the finger is lifted, play a sound to hear the new volume */}
      <PercentSlider
        label="Volume"
        value={settings.soundVolume}
        onChange={changeSoundVolume}
        onRelease={previewSound}
      />

      <div ref={sections.theme}>
        <AppText style={styles.section}>Theme: {settings.theme.name}</AppText>
      </div>
      {visibleThemes.map((item) => (
        <AnswerButton
          key={item.name}
          label={item.name}
          look={item === settings.theme ? 'selected' : 'normal'}
          onPress={() => changeSetting('theme', item)}
        />
      ))}
      <button onClick={toggleThemes}>
        <AppText style={styles.link}>{showAllThemes ? 'click to see less themes' : 'click to see more themes'}</AppText>
      </button>

      <div ref={sections.wallpaper}>
        <AppText style={styles.section}>Wallpaper</AppText>
      </div>
      {settings.wallpaper && (
        <PercentSlider label="Opacity" value={settings.wallpaperOpacity} onChange={changeWallpaperOpacity} />
      )}
      <MainButton label="Choose from my photos" onPress={pickWallpaper} />
      {settings.wallpaper && <MainButton label="Remove wallpaper" onPress={removeWallpaper} />}
      <input ref={fileInput} type="file" accept="image/*" onChange={wallpaperChosen} style={styles.hidden} />

      {/* Tutorial: extra room at the end, so even the last section can scroll up to the top */}
      {focus && <div style={styles.tutorialRoom} />}
    </ScrollView>
  );
}

const styles = {
  page: {
    padding: 20,
  },
  tutorialRoom: {
    height: 500,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  link: {
    textDecoration: 'underline',
    marginTop: 4,
  },
  section: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 10,
  },
  hidden: {
    display: 'none',
  },
  sync: {
    color: '#888',
    marginTop: 4,
  },
  synced: {
    color: '#2e9e4f',
  },
};
