import { useState } from 'react';
import { Text, StyleSheet, Button, ScrollView } from 'react-native';
import { useCameraController } from '../CameraControllerContext';
import { CameraEvents } from '../../../src/CameraEvents';
import type { CaptureSettings } from 'ricoh-camera-controller';

export const CameraScreen = () => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('Hello, World!');
  const [textLog, setTextLog] = useState('Log');
  const [textCaptureSettings, setTextCaptureSettings] = useState('Log');
  const camera = useCameraController();
  camera?.on(CameraEvents.Connected, (data) => {
    setText(`Connected`);
    setTextLog(`Model: ${data.model} Datetime: ${data.datetime}`);
  });

  camera?.on(CameraEvents.Disconnected, (_) => {
    setText('Disconnected');
  });

  camera?.on(CameraEvents.CaptureSettingsChanged, (data: CaptureSettings) => {
    if (data) setTextCaptureSettings(data.av);
  });

  return (
    <ScrollView style={styles.container}>
      <Text>
        {text} - {count}
      </Text>
      <Text>{textLog}</Text>
      <Button
        title="Button 1"
        onPress={() => {
          setCount((prev) => ++prev);
          setText('Button Pressed');
          camera
            ?.getAllProperties()
            .then((data) => {
              setTextLog(
                `Model: ${data.model} Datetime: ${data.datetime} firmware: ${data.firmwareVersion}`
              );
            })
            .catch((_) => {
              setTextLog('error>>>>');
            });
        }}
      />
      <Text>{textCaptureSettings}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: 'gray', paddingTop: 60 },
});
