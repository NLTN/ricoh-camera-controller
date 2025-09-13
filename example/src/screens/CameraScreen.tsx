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
  Dimensions,
} from 'react-native';
import { useCameraController } from '../CameraControllerContext';
import { CameraEvents, type IDeviceInfo } from 'ricoh-camera-controller';
import { useEventListener } from '../hooks/useEventListener';
import { GR_COMMANDS } from 'ricoh-camera-controller';
import type { Difference } from '../../../src/utils';
import { CameraDisplay } from '../components/CameraDisplay';

export const CameraScreen = () => {
  const [text, setText] = useState('Connection Status');
  const [textCaptureSettings, setTextCaptureSettings] = useState('Log');
  const [textInputValue, setTextInputValue] = useState('');
  // #region 🔍 Refs
  const cameraDisplayRef = useRef<CameraDisplay>(null);
  const textInputRef = useRef<TextInput>(null);
  // #endregion

  // #region Layout
  const [width] = useState(Dimensions.get('window').width);
  const displayWidth = width;
  const displayHeight = (width * 3) / 4;
  // #endregion

  const camera = useCameraController();
  camera.startCameraDetectionAndPairing();

  // #region 🛠️ Handlers
  const handleCameraDisplayTouch = (x: number, y: number) => {
    camera.lockFocus(x, y).then(() => {
      if (camera.captureSettings?.AFMode !== 'spot') {
        camera.setFocusMode('spot').then(() => camera.refreshDisplay());
      }
    });
    camera.setPollIntervalTemporarily(800, 2);
  };
  // #endregion

  // #region Camera Event Handlers
  const handleCameraConnected = (data: { model: string; datetime: string }) => {
    setText(`Connected` + `Model: ${data.model} Datetime: ${data.datetime}`);
    camera.startListeningToEvents();

    setTimeout(() => {
      cameraDisplayRef.current?.setURL(camera.getLiveViewURL());
    }, 500);
  };

  const handleCameraDisconnected = () => {
    setText('Disconnected');
    camera.startCameraDetectionAndPairing();
  };

  const handleCaptureSettingsChanged = (
    data: IDeviceInfo,
    differences: Record<string, Difference>
  ) => {
    if (data) {
      setTextCaptureSettings(`f ${data.av}, ${performance.now()}`);
      setTextInputValue(JSON.stringify(differences, null, 2));
    }
  };

  const handleFocusChanged = (
    data: IDeviceInfo,
    differences: Record<string, Difference>
  ) => {
    if (data) {
      setTextCaptureSettings(`f ${data.av}, ${performance.now()}`);
      setTextInputValue(JSON.stringify(differences, null, 2));
    }
  };

  const handleCameraOrientationChanged = (
    data: IDeviceInfo,
    differences: Record<string, Difference>
  ) => {
    if (data) {
      setTextCaptureSettings(`f ${data.av}, ${performance.now()}`);
      setTextInputValue(JSON.stringify(differences, null, 2));
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
  useEventListener(camera, CameraEvents.FocusChanged, handleFocusChanged);

  useEventListener(
    camera,
    CameraEvents.OrientationChanged,
    handleCameraOrientationChanged
  );

  function handleError(error: unknown, title = 'Error') {
    if (error instanceof Error) {
      Alert.alert(title, error.message);
    } else if (typeof error === 'string') {
      Alert.alert(title, error);
    } else {
      Alert.alert(title, 'Something went wrong');
    }
  }
  return (
    <SafeAreaView>
      <ScrollView style={styles.container}>
        <Text style={styles.text}>{text}</Text>

        <CameraDisplay
          ref={cameraDisplayRef}
          url={''}
          reloadKey={0}
          width={displayWidth}
          height={displayHeight}
          style={[styles.display]}
          onTouch={handleCameraDisplayTouch}
        />
        <View style={{ flexDirection: 'row' }}>
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
            title="Capture Settings"
            onPress={() => {
              setTextInputValue('loading...');
              const startTime = performance.now();

              camera
                .getCaptureSettings()
                .then((data) => {
                  setTextInputValue(JSON.stringify(data, null, 4));
                })
                .catch(handleError);

              const endTime = performance.now();
              setText(`${endTime - startTime}ms`);
            }}
          />
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Button
            title="Capture photo"
            onPress={() => {
              camera.capturePhoto().catch(handleError);
            }}
          />
          <Button
            title="lens_focus: 20,20"
            onPress={() => {
              camera.lockFocus(20, 20).catch(handleError);
            }}
          />
          <Button
            title="ISO 400"
            onPress={() => {
              camera.setCaptureSettings({ sv: 400 }).catch(handleError);
            }}
          />
          <Button
            title="ISO auto"
            onPress={() => {
              camera.setCaptureSettings({ sv: 'auto' }).catch(handleError);
            }}
          />
          <Button
            title="Shutter Speed: 1/80"
            onPress={() => {
              camera.setCaptureSettings({ tv: '1.80' }).catch(handleError);
            }}
          />
          <Button
            title="Shutter Speed: 5s"
            onPress={() => {
              camera.setCaptureSettings({ tv: '5.1' }).catch(handleError);
            }}
          />
          <Button
            title="Z-IN"
            onPress={() => {
              camera.sendCommand(GR_COMMANDS.BUTTON_ZOOM_IN).catch(handleError);
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
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Button
            title="xv=+0.3"
            onPress={() => {
              camera
                .setCaptureSettings({ xv: '+0.3', sv: '400' })
                .catch(handleError);
            }}
          />
          <Button
            title="FocusModeList"
            onPress={() => {
              try {
                Alert.alert(
                  'List of Focus Modes',
                  camera.getFocusModeList().toString()
                );
              } catch (error) {
                handleError(error);
              }
            }}
          />
          <Button
            title="setFocusMode('multiauto')"
            onPress={() => {
              camera
                .setFocusMode('multiauto')
                .then(() => Alert.alert('success'))
                .catch((error) => Alert.alert('ERROR', error.message));
            }}
          />
          <Button
            title="setFocusMode('snap')"
            onPress={() => {
              camera
                .setFocusMode('snap')
                .then(() => Alert.alert('success'))
                .catch(handleError);
            }}
          />
          <Button
            title="setFocusMode('MF')"
            onPress={() => {
              camera
                .setFocusMode('MF')
                .then(() => Alert.alert('success'))
                .catch(handleError);
            }}
          />

          <Button
            title="getDriveModeList()"
            onPress={() => {
              try {
                const result = camera.getDriveModeList();
                Alert.alert('Self-timer option', result.toString());
              } catch (err) {
                handleError(err);
              }
            }}
          />

          <Button
            title="getDriveMode()"
            onPress={() => {
              try {
                const result = camera.getDriveMode();
                Alert.alert('Drive Mode', result);
              } catch (err) {
                handleError(err);
              }
            }}
          />

          <Button
            title="getSelfTimerOptionList()"
            onPress={() => {
              try {
                const result = camera.getSelfTimerOptionList();
                Alert.alert('Self-timer option', result.toString());
              } catch (err) {
                handleError(err);
              }
            }}
          />

          <Button
            title="getSelfTimerOption()"
            onPress={() => {
              try {
                const result = camera.getSelfTimerOption();
                Alert.alert('Self-timer option', result);
              } catch (err) {
                handleError(err);
              }
            }}
          />

          <Button
            title="setShootMode: self2s"
            onPress={() => {
              camera
                .setShootMode('continuous', 'off')
                .then(() => Alert.alert('success'))
                .catch(handleError);
            }}
          />
          <Button
            title="getFocusSetting()"
            onPress={() => {
              try {
                Alert.alert(camera.getFocusSetting());
              } catch (err) {
                handleError(err);
              }
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: 'black' },
  display: {
    alignSelf: 'center',
    borderColor: '#b60006',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden', // Ensure the WebView content respects the border radius
  },
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
