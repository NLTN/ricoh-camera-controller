import { useRef, useState } from 'react';
import {
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Alert,
  TextInput,
  SafeAreaView,
  View,
} from 'react-native';
import { useCameraController } from '../CameraControllerContext';
import { CameraEvents, type ICaptureSettings } from 'ricoh-camera-controller';
import { useEventListener } from '../hooks/useEventListener';
import { GR_COMMANDS } from 'ricoh-camera-controller';
import type { Difference } from '../../../src/utils';

export const CameraScreen = () => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('Connection Status');
  const [textLog, setTextLog] = useState('Log');
  const [textCaptureSettings, setTextCaptureSettings] = useState('Log');
  const [textInputValue, setTextInputValue] = useState('');
  const textInputRef = useRef<TextInput>(null);
  const camera = useCameraController();
  camera.startPolling();

  // #region Camera Event Handlers
  const handleCameraConnected = (data: { model: string; datetime: string }) => {
    setText(`Connected`);
    setTextLog(`Model: ${data.model} Datetime: ${data.datetime}`);
  };

  const handleCameraDisconnected = () => {
    setText('Disconnected');
  };

  const handleCaptureSettingsChanged = (
    data: ICaptureSettings,
    differences: Record<string, Difference>
  ) => {
    if (data) {
      const text = `f ${data.av}, ${performance.now()}`;
      setTextCaptureSettings(text);
      setTextLog(JSON.stringify(differences, null, 2));
    }
  };
  // #endregion

  useEventListener(camera, CameraEvents.Connected, handleCameraConnected);
  useEventListener(camera, CameraEvents.Disconnected, handleCameraDisconnected);
  useEventListener(
    camera,
    CameraEvents.CaptureSettingsChanged,
    handleCaptureSettingsChanged
  );

  return (
    <SafeAreaView>
      <ScrollView style={styles.container}>
        <Text style={styles.text}>{text}</Text>
        <Text style={styles.text}>Count: {count}</Text>
        <Text style={styles.text}>{textLog}</Text>

        <View style={{ flexDirection: 'row' }}>
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
          <Button
            title="/v1/props"
            onPress={() => {
              setTextInputValue('loading...');
              camera
                .getAllProperties()
                .then((data) => {
                  setTextInputValue(JSON.stringify(data, null, 4));
                })
                .catch((error) => setTextInputValue(error));
            }}
          />

          <Button
            title="Current Capture Settings"
            onPress={() => {
              setTextInputValue('loading...');
              const startTime = performance.now();

              camera
                .getCaptureSettings()
                .then((data) => {
                  setTextInputValue(JSON.stringify(data, null, 4));
                })
                .catch((error) => setTextInputValue(error));

              const endTime = performance.now();
              setText(`${endTime - startTime}ms`);
            }}
          />
        </View>

        <View style={{ flexDirection: 'row' }}>
          <Button
            title="Current Capture from Cache"
            onPress={() => {
              setTextInputValue('loading...');
              const startTime = performance.now();

              setTextInputValue(
                JSON.stringify(camera.captureSettings, null, 4)
              );

              const endTime = performance.now();
              setText(`${endTime - startTime}ms`);
            }}
          />

          <Button
            title="focus: 20,20"
            onPress={() => {
              camera.lockFocus(20, 20);
            }}
          />
          <Button
            title="Z-IN"
            onPress={() => {
              camera.sendCommand(GR_COMMANDS.BUTTON_ZOOM_IN);
            }}
          />
        </View>
        <Text style={styles.text}>{textCaptureSettings}</Text>
        <TextInput
          ref={textInputRef}
          style={[styles.textArea]} // Apply provided style and default style
          editable={false}
          multiline={true}
          numberOfLines={20}
          // placeholder={placeholder}
          value={textInputValue}
          onChangeText={setTextInputValue}
          textAlignVertical="top" // Ensure text starts from the top
        />
        <Button
          title="Copy to Clipboard"
          onPress={() =>
            textInputRef.current?.setSelection(0, textInputValue.length - 1)
          }
        />
        <View style={{ flexDirection: 'row' }}>
          <Button
            title="xv=+0.3"
            onPress={() => {
              camera.setCaptureSettings({ xv: '+0.3', sv: '400' });
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: 'black' },
  text: {
    color: 'white',
  },
  textArea: {
    color: 'white',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    width: '100%', // Take up full width of parent
    height: 300,
    textAlignVertical: 'top', // Important for multiline
  },
});
