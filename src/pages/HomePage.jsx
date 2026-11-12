import AppText from '../components/AppText';

export default function HomePage() {
  return (
    <div style={styles.page}>
      <AppText style={styles.title}>TOEIC Test</AppText>
      <AppText style={styles.subtitle}>Train. Test. Recover. Level up.</AppText>
      <AppText style={styles.hint}>Pick a mode below</AppText>
    </div>
  );
}

const styles = {
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 8,
  },
  hint: {
    color: '#888',
    marginTop: 40,
  },
};
