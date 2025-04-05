export enum GR_COMMANDS {
  REFRESH_DISPLAY = 'cmd=mode refresh',
  BUTTON_ADJ_LEFT = 'cmd=badjleft',
  BUTTON_ADJ_OK = 'cmd=badjok',
  BUTTON_ADJ_RIGHT = 'cmd=badjright',
  BUTTON_PLAY = 'cmd=bplay',
  BUTTON_ZOOM_IN = 'cmd=btele',
  BUTTON_ZOOM_OUT = 'cmd=bwide',
  BUTTON_UP = 'cmd=bup', // Button Macro
  BUTTON_DOWN = 'cmd=bdown', // Button White Balance
  BUTTON_LEFT = 'cmd=bleft', // Fn1
  BUTTON_RIGHT = 'cmd=bright', // Flash
  BUTTON_OK = 'cmd=bok',
  BUTTON_DISP = 'cmd=bdisp',
  BUTTON_FN2 = 'cmd=btrash',
  FOCUS_MODE_MULTI = 'mpset=FOCUS FOCUS_MODE_MULTI',
  FOCUS_MODE_SPOT = 'mpset=FOCUS FOCUS_MODE_SPOT',
  FOCUS_MODE_PINPOINT = 'mpset=FOCUS FOCUS_MODE_PINPOINT',
  FOCUS_MODE_TRACKING = 'mpset=FOCUS FOCUS_MODE_TRACKING',
  FOCUS_MODE_MANUAL = 'mpset=FOCUS FOCUS_MODE_MANUAL',
  FOCUS_MODE_SNAP = 'mpset=FOCUS FOCUS_MODE_SNAP',
  FOCUS_MODE_INFINITY = 'mpset=FOCUS FOCUS_MODE_INFINITY',
  METERING_MODE_MULTI = 'mpset=EXP_METERING METERING_MODE_MULTI',
  METERING_MODE_CENTER = 'mpset=EXP_METERING METERING_MODE_CENTER',
  METERING_MODE_SPOT = 'mpset=EXP_METERING METERING_MODE_SPOT',
  LENS_LOCK = 'pset=LENS_LOCK 1', // Retract and lock the lens
  LENS_UNLOCK = 'pset=LENS_LOCK 0', // Unlock the lens
  LCD_SLEEP_ON = 'cmd=lcd sleep on',
  LCD_SLEEP_OFF = 'cmd=lcd sleep off',
}

export const FOCUS_MODE_TO_COMMAND_MAP = {
  multiauto: GR_COMMANDS.FOCUS_MODE_MULTI,
  spot: GR_COMMANDS.FOCUS_MODE_SPOT,
  pinpoint: GR_COMMANDS.FOCUS_MODE_PINPOINT,
  tracking: GR_COMMANDS.FOCUS_MODE_TRACKING,
  snap: GR_COMMANDS.FOCUS_MODE_SNAP,
  MF: GR_COMMANDS.FOCUS_MODE_MANUAL,
  inf: GR_COMMANDS.FOCUS_MODE_INFINITY,
};
