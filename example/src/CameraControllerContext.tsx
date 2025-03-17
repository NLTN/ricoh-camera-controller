import React, { createContext, useContext, useRef } from 'react';
import type { ReactNode } from 'react';
import RicohCameraController from 'ricoh-camera-controller';

// Context
export const CameraControllerContext =
  createContext<RicohCameraController | null>(null);

// Provider Component
export const CameraControllerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const cameraRef = useRef(new RicohCameraController());

  return (
    <CameraControllerContext.Provider value={cameraRef.current}>
      {children}
    </CameraControllerContext.Provider>
  );
};

// Custom Hook for easy access
export const useCameraController = () => {
  return useContext(CameraControllerContext);
};
