import RicohCameraController from 'ricoh-camera-controller';
import { Text, View, StyleSheet } from 'react-native';
import { CameraEvents } from '../../src/CameraEvents';

export default function App() {
  const camera = new RicohCameraController();

  camera.on(CameraEvents.CaptureSettingsChanged, () => {
    console.log('Hello world!');
  });

  return (
    <View style={styles.container}>
      <Text>Result:</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
