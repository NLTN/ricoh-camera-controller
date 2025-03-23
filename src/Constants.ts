export enum GR_COMMANDS {
  REFRESH_DISPLAY = 'cmd=mode refresh',
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
  METERING_MODE_MULTI = 'mpset=EXP_METERING METERING_MODE_MULTI',
  METERING_MODE_CENTER = 'mpset=EXP_METERING METERING_MODE_CENTER',
  METERING_MODE_SPOT = 'mpset=EXP_METERING METERING_MODE_SPOT',
}
