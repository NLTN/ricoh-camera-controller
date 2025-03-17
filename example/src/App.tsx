import { CameraControllerProvider } from './CameraControllerContext';
import { CameraScreen } from './screens/CameraScreen';

export default function App() {
  return (
    <CameraControllerProvider>
      <CameraScreen />
    </CameraControllerProvider>
  );
}
