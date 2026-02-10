import type { CameraEvents } from '../enums/CameraEvents';
import type { IDeviceInfo } from '../interfaces';

/**
 * Type for mapping CameraEvents to the relevant CameraSettingsKeys
 */
export type EventKeyMap = Partial<
  Record<keyof typeof CameraEvents, ReadonlySet<keyof IDeviceInfo>>
>;

/**
 * Maps CameraEvents to the set of relevant CameraSettingsKeys that trigger them.
 *
 * Only events listed here are tracked. Accessing a missing event should default to an empty set.
 * - FocusChanged: keys that affect focus state and may trigger a focus update event.
 * - SettingsChanged: keys that affect user or camera settings and may trigger a settings update event.
 */
export const EVENT_KEY_MAP: EventKeyMap = {
  FocusChanged: new Set([
    'focused',
    'focusLocked',
    'focusMode',
    'AFMode', // For GR II only
    'focusSetting', // For GR III, GR IV
  ]),
  OrientationChanged: new Set(['cameraOrientation']),
  CaptureSettingsChanged: new Set([
    'av',
    'tv',
    'sv',
    'xv',
    'flashxv',
    'shootMode',
    'WBMode',
    'exposureMode',
    'meteringMode',
    'effect',
    'stillSize',
    'movieSize',
    'focusMode',
    'AFMode', // For GR II only
    'focusSetting', // For GR III, GR IV
  ]),
  StorageChanged: new Set(['storages']),
} as const;
