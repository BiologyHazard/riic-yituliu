import type { ResolvableLink, ResolvableStyle } from '@unhead/vue';
import colors from 'tailwindcss/colors';
import { computed, ref } from 'vue';

const themeIcons: Record<string, Record<string, string>> = {
  lucide: {
    arrowDown: 'i-lucide-arrow-down',
    arrowLeft: 'i-lucide-arrow-left',
    arrowRight: 'i-lucide-arrow-right',
    arrowUp: 'i-lucide-arrow-up',
    caution: 'i-lucide-circle-alert',
    check: 'i-lucide-check',
    chevronDoubleLeft: 'i-lucide-chevrons-left',
    chevronDoubleRight: 'i-lucide-chevrons-right',
    chevronDown: 'i-lucide-chevron-down',
    chevronLeft: 'i-lucide-chevron-left',
    chevronRight: 'i-lucide-chevron-right',
    chevronUp: 'i-lucide-chevron-up',
    close: 'i-lucide-x',
    copy: 'i-lucide-copy',
    copyCheck: 'i-lucide-copy-check',
    dark: 'i-lucide-moon',
    drag: 'i-lucide-grip-vertical',
    ellipsis: 'i-lucide-ellipsis',
    error: 'i-lucide-circle-x',
    external: 'i-lucide-arrow-up-right',
    eye: 'i-lucide-eye',
    eyeOff: 'i-lucide-eye-off',
    file: 'i-lucide-file',
    folder: 'i-lucide-folder',
    folderOpen: 'i-lucide-folder-open',
    hash: 'i-lucide-hash',
    info: 'i-lucide-info',
    light: 'i-lucide-sun',
    loading: 'i-lucide-loader-circle',
    menu: 'i-lucide-menu',
    minus: 'i-lucide-minus',
    panelClose: 'i-lucide-panel-left-close',
    panelOpen: 'i-lucide-panel-left-open',
    plus: 'i-lucide-plus',
    reload: 'i-lucide-rotate-ccw',
    search: 'i-lucide-search',
    stop: 'i-lucide-square',
    success: 'i-lucide-circle-check',
    system: 'i-lucide-monitor',
    tip: 'i-lucide-lightbulb',
    upload: 'i-lucide-upload',
    warning: 'i-lucide-triangle-alert',
  },
  phosphor: {
    arrowDown: 'i-ph-arrow-down',
    arrowLeft: 'i-ph-arrow-left',
    arrowRight: 'i-ph-arrow-right',
    arrowUp: 'i-ph-arrow-up',
    caution: 'i-ph-warning-circle',
    check: 'i-ph-check',
    chevronDoubleLeft: 'i-ph-caret-double-left',
    chevronDoubleRight: 'i-ph-caret-double-right',
    chevronDown: 'i-ph-caret-down',
    chevronLeft: 'i-ph-caret-left',
    chevronRight: 'i-ph-caret-right',
    chevronUp: 'i-ph-caret-up',
    close: 'i-ph-x',
    copy: 'i-ph-copy',
    copyCheck: 'i-ph-check-circle',
    dark: 'i-ph-moon',
    drag: 'i-ph-dots-six-vertical',
    ellipsis: 'i-ph-dots-three',
    error: 'i-ph-x-circle',
    external: 'i-ph-arrow-up-right',
    eye: 'i-ph-eye',
    eyeOff: 'i-ph-eye-slash',
    file: 'i-ph-file',
    folder: 'i-ph-folder',
    folderOpen: 'i-ph-folder-open',
    hash: 'i-ph-hash',
    info: 'i-ph-info',
    light: 'i-ph-sun',
    loading: 'i-ph-circle-notch',
    menu: 'i-ph-list',
    minus: 'i-ph-minus',
    panelClose: 'i-ph-caret-left',
    panelOpen: 'i-ph-caret-right',
    plus: 'i-ph-plus',
    reload: 'i-ph-arrow-counter-clockwise',
    search: 'i-ph-magnifying-glass',
    stop: 'i-ph-square',
    success: 'i-ph-check-circle',
    system: 'i-ph-monitor',
    tip: 'i-ph-lightbulb',
    upload: 'i-ph-upload',
    warning: 'i-ph-warning',
  },
  tabler: {
    arrowDown: 'i-tabler-arrow-down',
    arrowLeft: 'i-tabler-arrow-left',
    arrowRight: 'i-tabler-arrow-right',
    arrowUp: 'i-tabler-arrow-up',
    caution: 'i-tabler-alert-square-rounded',
    check: 'i-tabler-check',
    chevronDoubleLeft: 'i-tabler-chevrons-left',
    chevronDoubleRight: 'i-tabler-chevrons-right',
    chevronDown: 'i-tabler-chevron-down',
    chevronLeft: 'i-tabler-chevron-left',
    chevronRight: 'i-tabler-chevron-right',
    chevronUp: 'i-tabler-chevron-up',
    close: 'i-tabler-x',
    copy: 'i-tabler-copy',
    copyCheck: 'i-tabler-copy-check',
    dark: 'i-tabler-moon',
    drag: 'i-tabler-grip-vertical',
    ellipsis: 'i-tabler-dots',
    error: 'i-tabler-square-rounded-x',
    external: 'i-tabler-external-link',
    eye: 'i-tabler-eye',
    eyeOff: 'i-tabler-eye-off',
    file: 'i-tabler-file',
    folder: 'i-tabler-folder',
    folderOpen: 'i-tabler-folder-open',
    hash: 'i-tabler-hash',
    info: 'i-tabler-info-square-rounded',
    light: 'i-tabler-sun',
    loading: 'i-tabler-loader-2',
    menu: 'i-tabler-menu',
    minus: 'i-tabler-minus',
    panelClose: 'i-tabler-layout-sidebar-left-collapse',
    panelOpen: 'i-tabler-layout-sidebar-left-expand',
    plus: 'i-tabler-plus',
    reload: 'i-tabler-reload',
    search: 'i-tabler-search',
    stop: 'i-tabler-player-stop',
    success: 'i-tabler-square-rounded-check',
    system: 'i-tabler-device-desktop',
    tip: 'i-tabler-bulb',
    upload: 'i-tabler-upload',
    warning: 'i-tabler-alert-triangle',
  },
};

const appConfig = useAppConfig();

const colorsToOmit = ['inherit', 'current', 'transparent', 'black', 'white'];

interface ColorEntry {
  id: string;
  lightLabel: string;
  darkLabel: string;
  chipStyle: Record<string, string>;
}

function toColorEntry(colorName: string): ColorEntry {
  const name = colorName === 'neutral' ? 'old-neutral' : colorName;
  return {
    id: colorName,
    lightLabel: colorName,
    darkLabel: colorName,
    chipStyle: {
      '--color-light': `var(--color-${name}-500)`,
      '--color-dark': `var(--color-${name}-400)`,
    },
  };
}

const primaryColors: ColorEntry[] = [
  {
    id: 'grayscale',
    lightLabel: 'black',
    darkLabel: 'white',
    chipStyle: {
      '--color-light': 'black',
      '--color-dark': 'white',
    },
  },
  ...Object.keys(colors)
    .filter((colorName) => !colorsToOmit.includes(colorName))
    .map(toColorEntry),
];
const secondaryColors = [...primaryColors];
const neutralColorNames = [
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'taupe',
  'mauve',
  'mist',
  'olive',
];
const neutralColors = primaryColors.filter((color) => neutralColorNames.includes(color.id));

const radiuses = [0, 0.125, 0.25, 0.375, 0.5];

const fonts = ['Public Sans', 'DM Sans', 'Geist', 'Inter', 'Poppins', 'Outfit', 'Raleway'];

const iconSets = [
  {
    label: 'Lucide',
    icon: 'i-lucide-feather',
    value: 'lucide',
  },
  {
    label: 'Phosphor',
    icon: 'i-ph-phosphor-logo',
    value: 'phosphor',
  },
  {
    label: 'Tabler',
    icon: 'i-tabler-brand-tabler',
    value: 'tabler',
  },
];

const colorModes = computed<{ label: string; value: 'light' | 'dark' | 'auto'; icon: string }[]>(
  () => [
    { label: 'Light', value: 'light', icon: appConfig.ui.icons.light },
    { label: 'Dark', value: 'dark', icon: appConfig.ui.icons.dark },
    { label: 'System', value: 'auto', icon: appConfig.ui.icons.system },
  ],
);

const _primary = ref<string>(appConfig.ui.colors.primary);
const primary = computed<string>({
  get() {
    return _primary.value;
  },
  set(option) {
    _primary.value = option;
    if (option !== 'grayscale') {
      appConfig.ui.colors.primary = option;
    }
  },
});

const _secondary = ref<string>(appConfig.ui.colors.secondary);
const secondary = computed<string>({
  get() {
    return _secondary.value;
  },
  set(option) {
    _secondary.value = option;
    if (option !== 'grayscale') {
      appConfig.ui.colors.secondary = option;
    }
  },
});

const _neutral = ref<string>(appConfig.ui.colors.neutral);
const neutral = computed<string>({
  get() {
    return _neutral.value;
  },
  set(option) {
    _neutral.value = option;
    appConfig.ui.colors.neutral = option;
  },
});

const radius = ref<number>(0.25);

const font = ref<string>('Public Sans');

const _iconSet = ref<string>('lucide');
const iconSet = computed<string>({
  get() {
    return _iconSet.value;
  },
  set(option) {
    _iconSet.value = option;
    appConfig.ui.icons = { ...themeIcons[option] };
  },
});

const style = computed<ResolvableStyle[]>(() => [
  {
    innerHTML:
      primary.value === 'grayscale'
        ? `:root { --ui-primary: black; } .dark { --ui-primary: white; }`
        : ':root {}',
    id: 'nuxt-ui-primary-grayscale',
    tagPriority: -2,
  },
  {
    innerHTML:
      secondary.value === 'grayscale'
        ? `:root { --ui-secondary: black; } .dark { --ui-secondary: white; }`
        : ':root {}',
    id: 'nuxt-ui-secondary-grayscale',
    tagPriority: -2,
  },
  {
    innerHTML: `:root { --ui-radius: ${radius.value}rem; }`,
    id: 'nuxt-ui-radius',
    tagPriority: -2,
  },
  {
    innerHTML: `:root { --font-sans: '${font.value}', sans-serif; }`,
    id: 'nuxt-ui-font',
    tagPriority: -2,
  },
]);

const link = computed<ResolvableLink[]>(() => {
  const name = font.value;
  return [
    {
      rel: 'stylesheet',
      href: `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@400;500;600;700&display=swap`,
      id: `font-${name.toLowerCase().replace(/\s+/g, '-')}`,
    },
  ];
});

function resetTheme() {
  primary.value = 'green';
  secondary.value = 'blue';
  neutral.value = 'slate';
  radius.value = 0.25;
  font.value = 'Public Sans';
  iconSet.value = 'lucide';
}

export function useTheme() {
  return {
    primaryColors,
    secondaryColors,
    neutralColors,
    radiuses,
    fonts,
    iconSets,
    colorModes,
    primary,
    secondary,
    neutral,
    radius,
    font,
    iconSet,
    style,
    link,
    resetTheme,
  };
}
