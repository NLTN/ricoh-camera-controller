// -----------------------------------------------------------------------------
// Shoot Mode Lookup Table
// -----------------------------------------------------------------------------
// Maps drive modes (e.g., "single", "interval") and self-timer options
// (e.g., "off", "2s", "10s") to a specific shoot mode string.
//
// For example:
// - shootModeLookup['single']['2s'] → 'self2s'
// - shootModeLookup['interval']['10s'] → 'intervalSelf10s'
//
// This is the forward mapping used to determine the appropriate shoot mode
// based on a selected drive mode and self-timer option.
//
export const shootModeLookup = {
  single: { 'off': 'single', '2s': 'self2s', '10s': 'self10s' },
  continuous: { off: 'continuous' },
  interval: {
    'off': 'interval',
    '2s': 'intervalSelf2s',
    '10s': 'intervalSelf10s',
  },
  intervalComp: {
    'off': 'intervalComp',
    '2s': 'intervalCompSelf2s',
    '10s': 'intervalCompSelf10s',
  },
  multiExp: {
    'off': 'multiExp',
    '2s': 'multiExpSelf2s',
    '10s': 'multiExpSelf10s',
  },
  bracket: { 'off': 'bracket', '2s': 'bracketSelf2s', '10s': 'bracketSelf10s' },
} as const;

// -----------------------------------------------------------------------------
// Shoot Mode Reverse Map
// -----------------------------------------------------------------------------
// Automatically generated reverse lookup map.
// Maps each shoot mode string (e.g., 'self2s') back to its corresponding
// drive mode and self-timer option.
//
// For example:
// - shootModeReverseMap['self2s'] → { driveMode: 'single', selfTimer: '2s' }
// - shootModeReverseMap['intervalSelf10s'] → { driveMode: 'interval', selfTimer: '10s' }
//
// This enables fast reverse lookup of base configuration from a shoot mode key.
//
export const shootModeReverseMap: Record<
  string,
  { driveMode: string; selfTimer: string }
> = {};

// Populate the reverse map by iterating through shootModeLookup
for (const [driveMode, selfTimerMap] of Object.entries(shootModeLookup)) {
  for (const [selfTimer, shootMode] of Object.entries(selfTimerMap)) {
    shootModeReverseMap[shootMode] = { driveMode, selfTimer };
  }
}

// -----------------------------------------------------------------------------
// Type Definitions for Shoot Mode Lookup
// -----------------------------------------------------------------------------

// ShootModeLookup:
// Represents the shape of the shootModeLookup object.
// This is a map of drive modes to their supported self-timer options and
// resulting shoot mode keys.
export type ShootModeLookup = typeof shootModeLookup;

// DriveMode:
// Extracts the list of available drive modes (i.e., the top-level keys of shootModeLookup).
// Example: "single" | "continuous" | "interval" | ...
export type DriveMode = keyof ShootModeLookup;

// TimerOption:
// Given a specific DriveMode, this extracts the list of valid timer options for that mode.
// Example: TimerOption<'single'> → "off" | "2s" | "10s"
export type TimerOption<D extends DriveMode> = keyof ShootModeLookup[D];

// ShootModeKey:
// Given a DriveMode and a TimerOption for that mode,
// this type resolves to the corresponding shoot mode string.
// Example: ShootModeKey<'single', '2s'> → "self2s"
export type ShootModeKey<
  D extends DriveMode,
  T extends TimerOption<D>,
> = ShootModeLookup[D][T];
