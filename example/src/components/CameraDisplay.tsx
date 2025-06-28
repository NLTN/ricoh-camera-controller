import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  TouchableOpacity,
  type GestureResponderEvent,
} from 'react-native';
import { WebView } from 'react-native-webview';

type Point = {
  x: number;
  y: number;
};

interface ICameraDisplayProps {
  url: string;
  reloadKey: number;
  onTouch: (x: number, y: number) => void;
  style?: StyleProp<ViewStyle>;
  width?: number | undefined;
  height?: number | undefined;
}
/**
 * 
 Why Use the key Prop?
  1.	Force a Full Re-Render – When the key changes, React unmounts and remounts the WebView.
  2.	Useful for URL Changes – Ensures the WebView reloads a new URL instead of just navigating within the same WebView instance.
  3.	Solves Some WebView Caching Issues – Helps in cases where .reload() does not fetch fresh content.
 */

// Ref interface
export interface CameraDisplay {
  setURL: React.Dispatch<React.SetStateAction<string>>;
  focusPoint: Point;
}

export const CameraDisplay = forwardRef(
  (props: ICameraDisplayProps, ref: React.Ref<CameraDisplay>) => {
    // Ref methods or properties exposed to parent components
    useImperativeHandle(ref, () => ({
      setURL,
      focusPoint,
    }));
    console.log('Rendering CameraDisplay');
    const {
      url,
      reloadKey,
      onTouch: handleTouch,
      style,
      width,
      height = 200,
    } = props;

    const [focusPoint, setFocusPoint] = useState<Point>({ x: 50, y: 50 });
    const [_URL, setURL] = useState<string>(url);
    // const handleMessage = (event: { nativeEvent: { data: string } }) => {
    //   // Get touch position from the WebView message
    //   const { x, y, width, height } = JSON.parse(event.nativeEvent.data);

    //   //The horizontal and vertical percentage (0 to 100) representing the focus point in the frame
    //   const percentageX = Math.round((x * 100) / width);
    //   const percentageY = Math.round((y * 100) / height);

    //   console.log(`${x},${y} w=${width} h=${height}`);
    //   handleTouch(percentageX, percentageY);
    // };

    const handleTouchableOpacityPress = (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;

      //The horizontal and vertical percentage (0 to 100) representing the focus point in the frame
      if (width !== undefined && height !== undefined) {
        const percentageX = Math.round((locationX * 100) / width);
        const percentageY = Math.round((locationY * 100) / height);
        setFocusPoint({ x: percentageX, y: percentageY });
        handleTouch(percentageX, percentageY);
        // console.log(`${locationX},${locationY} w=${width} h=${height}`);
      }
    };

    return (
      <View style={[styles.container, style, { width }, { height }]}>
        <TouchableOpacity
          onPressIn={handleTouchableOpacityPress}
          activeOpacity={1}
        >
          <View style={styles.webviewWrapper}>
            <WebView
              key={reloadKey}
              source={{ uri: _URL }}
              style={styles.webview}
              // onMessage={handleMessage}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {},
  webviewWrapper: {
    width: '100%',
    height: '100%',
    pointerEvents: 'none', // Disable zoom
  },
  webview: {
    backgroundColor: 'black',
  },
});
