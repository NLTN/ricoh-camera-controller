import GR3Adapter from '../gr3/GR3Adapter';

class GR4Adapter extends GR3Adapter {
  getDialModeList(): (string | null)[] {
    return ['U3', 'U2', 'U1', 'P', 'AV', 'TV', 'SFP', 'M', null];
  }
}

export default GR4Adapter;
