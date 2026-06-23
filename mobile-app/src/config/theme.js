// PO.PU brand colours — mirrors the web app
export const COLORS = {
  primary:        '#1B5E20',  // deep green
  primaryLight:   '#2E7D32',
  primaryDark:    '#145214',
  secondary:      '#F4B400',  // amber
  secondaryLight: '#FFD54F',
  secondaryDark:  '#F9A825',
  accent:         '#FFF8E1',
  background:     '#FAFAF7',
  surface:        '#FFFFFF',
  text:           '#212121',
  textSecondary:  '#757575',
  textLight:      '#9E9E9E',
  muted:          '#9E9E9E',
  error:          '#D32F2F',
  errorLight:     '#FFEBEE',
  success:        '#388E3C',
  successLight:   '#E8F5E9',
  warning:        '#F57C00',
  warningLight:   '#FFF3E0',
  info:           '#1565C0',
  infoLight:      '#E3F2FD',
  border:         '#E0E0E0',
  divider:        '#EEEEEE',
  overlay:        'rgba(0,0,0,0.5)',
  white:          '#FFFFFF',
  black:          '#000000',
  transparent:    'transparent',

  // Status colours
  statusPending:    '#FF9800',
  statusAccepted:   '#2196F3',
  statusPreparing:  '#9C27B0',
  statusDelivering: '#00BCD4',
  statusDelivered:  '#4CAF50',
  statusCancelled:  '#F44336',
};

export const FONTS = {
  regular:  'System',
  medium:   'System',
  bold:     'System',
  light:    'System',
};

export const SIZES = {
  // Base
  xs:  4,
  sm:  8,
  md:  12,
  base: 16,
  lg:  20,
  xl:  24,
  xxl: 32,
  xxxl: 48,

  // Font sizes
  fontXs:   10,
  fontSm:   12,
  fontBase: 14,
  fontMd:   16,
  fontLg:   18,
  fontXl:   20,
  fontXxl:  24,
  fontH3:   28,
  fontH2:   32,
  fontH1:   36,

  // Radius
  radiusSm:  4,
  radius:    8,
  radiusMd:  12,
  radiusLg:  16,
  radiusXl:  24,
  radiusFull: 9999,

  // Icon
  iconSm:  16,
  icon:    24,
  iconMd:  28,
  iconLg:  32,
  iconXl:  48,
};

export const SHADOWS = {
  small: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius:  2,
    elevation:     2,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
  },
};
