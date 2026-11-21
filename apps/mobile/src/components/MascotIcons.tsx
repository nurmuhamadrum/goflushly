import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface MascotProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

const MR_PLOP_IMG = require('../../assets/images/mascots/mr-plop.png');
const LIL_DRIP_IMG = require('../../assets/images/mascots/lil-drip.png');
const SIR_FLUSH_IMG = require('../../assets/images/mascots/sir-flush.png');

export const MrPlopIcon: React.FC<MascotProps> = ({ size = 48, style }) => (
  <Image
    source={MR_PLOP_IMG}
    style={[{ width: size, height: size }, style]}
    resizeMode="contain"
  />
);

export const LilDripIcon: React.FC<MascotProps> = ({ size = 48, style }) => (
  <Image
    source={LIL_DRIP_IMG}
    style={[{ width: size, height: size }, style]}
    resizeMode="contain"
  />
);

export const SirFlushIcon: React.FC<MascotProps> = ({ size = 48, style }) => (
  <Image
    source={SIR_FLUSH_IMG}
    style={[{ width: size, height: size }, style]}
    resizeMode="contain"
  />
);
