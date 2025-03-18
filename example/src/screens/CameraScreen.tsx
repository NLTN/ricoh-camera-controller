import { useState } from 'react';
import { Text, StyleSheet, Button, ScrollView, Alert } from 'react-native';
import { useCameraController } from '../CameraControllerContext';
import { type CaptureSettings, CameraEvents } from 'ricoh-camera-controller';
import { useEventListener } from '../hooks/useEventListener';

export const CameraScreen = () => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('Hello, World!');
  const [textLog, setTextLog] = useState('Log');
  const [textCaptureSettings, setTextCaptureSettings] = useState('Log');

  const camera = useCameraController();

  // #region Camera Event Handlers
  const handleCameraConnected = (data: { model: string; datetime: string }) => {
    setText(`Connected`);
    setTextLog(`Model: ${data.model} Datetime: ${data.datetime}`);
  };

  const handleCameraDisconnected = () => {
    setText('Disconnected');
  };

  const handleCaptureSettingsChanged = (data: CaptureSettings) => {
    if (data) setTextCaptureSettings(data.av);
  };
  // #endregion

  console.log(CameraEvents.Connected);
  useEventListener(camera, CameraEvents.Connected, handleCameraConnected);
  useEventListener(camera, CameraEvents.Disconnected, handleCameraDisconnected);
  useEventListener(
    camera,
    CameraEvents.CaptureSettingsChanged,
    handleCaptureSettingsChanged
  );

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
      <Button
        title="Num of Listeners"
        onPress={() => {
          const numListeners = camera
            ?.eventNames()
            .reduce((count, eventName) => {
              return count + camera.listenerCount(eventName);
            }, 0);
          Alert.alert(`Num of listeners: ${numListeners}`);
        }}
      />
      <Text>{textCaptureSettings}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: 'gray', paddingTop: 60 },
});
