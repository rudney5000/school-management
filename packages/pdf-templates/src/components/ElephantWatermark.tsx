import {
    Path,
    Ellipse,
    G
} from '@react-pdf/renderer';
import { theme } from '../theme';

export function ElephantWatermark() {
    return (
        <G opacity={0.05} transform="translate(300, 380) scale(1.8)">
            <Ellipse cx="0" cy="0" rx="70" ry="45" fill={theme.colors.watermark} />
            <Ellipse cx="-65" cy="-10" rx="30" ry="28" fill={theme.colors.watermark} />
            <Ellipse cx="-75" cy="-15" rx="22" ry="26" fill={theme.colors.watermark} />
            <Path
                d="M -85 5 Q -100 20 -95 45 Q -93 55 -85 55 Q -80 55 -80 48 Q -85 45 -87 35 Q -90 20 -78 10 Z"
                fill={theme.colors.watermark}
            />
            <Ellipse cx="-30" cy="40" rx="10" ry="20" fill={theme.colors.watermark} />
            <Ellipse cx="0" cy="42" rx="10" ry="20" fill={theme.colors.watermark} />
            <Ellipse cx="30" cy="40" rx="10" ry="20" fill={theme.colors.watermark} />
            <Ellipse cx="55" cy="35" rx="10" ry="18" fill={theme.colors.watermark} />
            <Path d="M 68 -5 Q 90 5 85 25" stroke={theme.colors.watermark} strokeWidth={4} fill="none" />
        </G>
    );
}