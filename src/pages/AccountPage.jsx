import { useState } from 'react';
import AppText from '../components/AppText';
import AnswerButton from '../components/AnswerButton';
import BackButton from '../components/BackButton';
import MainButton from '../components/MainButton';
import ScrollView from '../components/ScrollView';
import { useTheme } from '../themes';
import { createAccount, logIn, forgotPassword, errorMessage } from '../logic/cloud';

// What each mode shows.
const MODES = {
  welcome: {
    title: 'Welcome !',
    text: 'With an account, your progress is saved online: never lost, and on all your phones. You stay logged in.',
  },
  login: {
    title: 'Log in',
    text: 'Log in to get your progress back. You stay logged in. (If your account already has a save, it replaces the progress of this phone.)',
  },
  subscribe: {
    title: 'Subscribe',
    text: 'Your current progress is saved in your new account: never lost, and on all your phones. You stay logged in.',
  },
};

// The email + password form. (Logged in once = logged in automatically the next times.)
// mode: 'login' | 'subscribe' (from the parameters), or 'welcome' (first launch: both, + "Continue without account").
// onDone: logged in (or "Continue without account"). onBack: the "<" (from the parameters).
export default function AccountPage({ mode, onDone, onBack }) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); // waiting for Firebase: the buttons are off
  const [message, setMessage] = useState(null); // { text, good } under the inputs
  const canSend = email.trim() !== '' && password !== '' && !busy;
  const texts = MODES[mode];

  // Runs a Firebase action. Success: onDone. Error: a sentence under the inputs.
  async function run(action) {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      onDone();
    } catch (error) {
      setMessage({ text: errorMessage(error), good: false });
      setBusy(false);
    }
  }

  function pressLogIn() {
    run(() => logIn(email, password));
  }

  // The new account gets the progress of this phone (see cloud.js: an account without a save gets the phone's).
  function pressSubscribe() {
    run(() => createAccount(email, password));
  }

  async function pressForgot() {
    if (email.trim() === '') {
      setMessage({ text: 'Type your email first, then click here again.', good: false });
      return;
    }
    try {
      await forgotPassword(email);
      setMessage({ text: 'An email to change your password was sent to ' + email.trim() + '.', good: true });
    } catch (error) {
      setMessage({ text: errorMessage(error), good: false });
    }
  }

  const inputStyle = { ...styles.input, color: theme.text, borderColor: theme.border, backgroundColor: theme.card };

  return (
    <div style={styles.screen}>
      <ScrollView contentStyle={styles.page}>
        <AppText style={styles.title}>{texts.title}</AppText>
        <AppText style={styles.text}>{texts.text}</AppText>

        <AppText style={styles.label}>Email</AppText>
        <input
          style={inputStyle}
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@mail.com"
        />
        <AppText style={styles.label}>Password</AppText>
        <input
          style={inputStyle}
          type="password"
          autoComplete={mode === 'subscribe' ? 'new-password' : 'current-password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="6 characters minimum"
        />

        {message && <AppText style={message.good ? styles.info : styles.error}>{message.text}</AppText>}

        {mode !== 'subscribe' && <MainButton label="Log in" onPress={pressLogIn} disabled={!canSend} />}
        {mode === 'subscribe' && <MainButton label="Subscribe" onPress={pressSubscribe} disabled={!canSend} />}
        {mode === 'welcome' && (
          <AnswerButton label="Subscribe" look="normal" onPress={pressSubscribe} disabled={!canSend} />
        )}

        {mode !== 'subscribe' && (
          <button onClick={pressForgot} style={styles.linkButton}>
            <AppText style={styles.link}>Forgot your password ?</AppText>
          </button>
        )}
        {mode === 'welcome' && (
          <button onClick={onDone} style={styles.linkButton}>
            <AppText style={styles.link}>Continue without account</AppText>
          </button>
        )}
      </ScrollView>

      {onBack && <BackButton onPress={onBack} />}
    </div>
  );
}

const styles = {
  screen: {
    flex: 1,
    minHeight: 0,
  },
  page: {
    padding: 20,
    paddingBottom: 90, // room for the "<" button
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  error: {
    color: '#d63031',
    marginTop: 8,
  },
  info: {
    color: '#007FFF',
    marginTop: 8,
  },
  linkButton: {
    alignSelf: 'center',
    marginTop: 14,
    padding: 4,
  },
  link: {
    textDecoration: 'underline',
  },
};
