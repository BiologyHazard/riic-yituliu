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

interface FontOption {
  label: string;
  value: string;
  family: string;
  source:
    | { type: 'use-chinese' }
    | { type: 'keyword' }
    | { type: 'local' }
    | { type: 'link'; links: { id: string; rel: string; href: string }[] };
}

const englishFontOptions: FontOption[] = [
  { label: '（使用中文字体）', value: 'use-chinese', family: '', source: { type: 'use-chinese' } },
  {
    label: 'Public Sans',
    value: 'public-sans',
    family: 'Public Sans',
    source: {
      type: 'link',
      links: [
        {
          id: `font-public-sans`,
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,100..900;1,100..900&display=swap',
        },
      ],
    },
  },
  {
    label: 'DM Sans',
    value: 'dm-sans',
    family: 'DM Sans',
    source: {
      type: 'link',
      links: [
        {
          id: `font-dm-sans`,
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,100..900;1,100..900&display=swap',
        },
      ],
    },
  },
  {
    label: 'Geist',
    value: 'geist',
    family: 'Geist',
    source: {
      type: 'link',
      links: [
        {
          id: `font-geist`,
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Geist:ital,wght@0,100..900;1,100..900&display=swap',
        },
      ],
    },
  },
  {
    label: 'Inter',
    value: 'inter',
    family: 'Inter',
    source: {
      type: 'link',
      links: [
        {
          id: `font-inter`,
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
        },
      ],
    },
  },
  {
    label: 'Poppins',
    value: 'poppins',
    family: 'Poppins',
    source: {
      type: 'link',
      links: [
        {
          id: `font-poppins`,
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
        },
      ],
    },
  },
  {
    label: 'Outfit',
    value: 'outfit',
    family: 'Outfit',
    source: {
      type: 'link',
      links: [
        {
          id: `font-outfit`,
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap',
        },
      ],
    },
  },
  {
    label: 'Raleway',
    value: 'raleway',
    family: 'Raleway',
    source: {
      type: 'link',
      links: [
        {
          id: `font-raleway`,
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap',
        },
      ],
    },
  },
  {
    label: 'Google Sans Flex',
    value: 'google-sans-flex',
    family: 'Google Sans Flex',
    source: {
      type: 'link',
      links: [
        {
          id: `font-google-sans-flex`,
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,slnt,wdth,wght,GRAD,ROND@6..144,-10..0,25..151,1..1000,0..100,0..100&display=swap',
        },
      ],
    },
  },
  {
    label: 'Space Grotesk',
    value: 'space-grotesk',
    family: 'Space Grotesk',
    source: {
      type: 'link',
      links: [
        {
          id: `font-space-grotesk`,
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap',
        },
      ],
    },
  },
  {
    label: 'Open Sans',
    value: 'open-sans',
    family: 'Open Sans',
    source: {
      type: 'link',
      links: [
        {
          id: `font-open-sans`,
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wdth,wght@0,75..100,300..800;1,75..100,300..800&display=swap',
        },
      ],
    },
  },
  {
    label: 'CMU Serif',
    value: 'cmu-serif',
    family: 'CMU Serif',
    source: {
      type: 'link',
      links: [
        {
          id: `font-cmu-serif`,
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/computer-modern@0.1.3/index.min.css',
        },
      ],
    },
  },
  {
    label: 'CMU Bright',
    value: 'cmu-bright',
    family: 'CMU Bright',
    source: {
      type: 'link',
      links: [
        {
          id: `font-cmu-bright`,
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/computer-modern@0.1.3/index.min.css',
        },
      ],
    },
  },
  {
    label: 'CMU Sans Serif',
    value: 'cmu-sans-serif',
    family: 'CMU Sans Serif',
    source: {
      type: 'link',
      links: [
        {
          id: `font-cmu-sans-serif`,
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/computer-modern@0.1.3/index.min.css',
        },
      ],
    },
  },
  {
    label: 'Latin Modern Roman',
    value: 'latin-modern-roman',
    family: 'TypoPRO Latin Modern Roman',
    source: {
      type: 'link',
      links: [
        {
          id: `font-latin-modern-roman`,
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/@typopro/web-latin-modern@3.7.5/TypoPRO-LatinModern.min.css',
        },
      ],
    },
  },
  {
    label: 'Latin Modern Sans',
    value: 'latin-modern-sans',
    family: 'TypoPRO Latin Modern Sans',
    source: {
      type: 'link',
      links: [
        {
          id: `font-latin-modern-sans`,
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/@typopro/web-latin-modern@3.7.5/TypoPRO-LatinModern.min.css',
        },
      ],
    },
  },
  { label: '（系统默认）', value: 'system-ui', family: 'system-ui', source: { type: 'keyword' } },
  {
    label: '（浏览器默认）',
    value: 'sans-serif',
    family: 'sans-serif',
    source: { type: 'keyword' },
  },
];

const chineseFontOptions: FontOption[] = [
  {
    label: '鸿蒙黑体',
    value: 'harmonyos-sans-sc',
    family: 'HarmonyOS Sans SC',
    source: { type: 'local' },
  },
  {
    label: '阿里巴巴普惠体',
    value: 'alibaba-puhuiti',
    family: 'Alibaba PuHuiTi 3.0',
    source: { type: 'local' },
  },
  {
    label: '思源黑体',
    value: 'noto-sans-sc',
    family: 'Noto Sans SC',
    source: {
      type: 'link',
      links: [
        {
          id: `font-noto-sans-sc`,
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100..900&display=swap',
        },
      ],
    },
  },
  {
    label: '思源宋体',
    value: 'noto-serif-sc',
    family: 'Noto Serif SC',
    source: {
      type: 'link',
      links: [
        {
          id: `font-noto-serif-sc`,
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200..900&display=swap',
        },
      ],
    },
  },
  {
    label: '霞鹜文楷',
    value: 'lxgw-wenkai',
    family: 'LXGW WenKai',
    source: {
      type: 'link',
      links: [
        {
          id: `font-lxgw-wenkai`,
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.min.css',
          // href: 'https://cn-font.claude-code-best.win/packages/lxgwwenkai/dist/LXGWWenKai-Regular/result.css',
          // href: 'https://cn-font.claude-code-best.win/packages/lxgwwenkai/dist/LXGWWenKai-Light/result.css',
          // href: 'https://cn-font.claude-code-best.win/packages/lxgwwenkai/dist/LXGWWenKai-Bold/result.css',
        },
      ],
    },
  },
  {
    label: '霞鹜文楷屏幕阅读版',
    value: 'lxgw-wenkai-screen',
    family: 'LXGW WenKai Screen',
    source: {
      type: 'link',
      links: [
        {
          id: `font-lxgw-wenkai-screen`,
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont@1.7.0/style.min.css',
          // href: 'https://cn-font.claude-code-best.win/packages/lywkpmydb/dist/LXGWWenKaiScreen/result.css',
        },
      ],
    },
  },
  { label: '（系统默认）', value: 'system-ui', family: 'system-ui', source: { type: 'keyword' } },
  {
    label: '（浏览器默认）',
    value: 'sans-serif',
    family: 'sans-serif',
    source: { type: 'keyword' },
  },
];

const monospaceFontOptions: FontOption[] = [
  {
    label: 'JetBrains Mono',
    value: 'jetbrains-mono',
    family: 'JetBrains Mono',
    source: { type: 'local' },
  },
  {
    label: 'Google Sans Code',
    value: 'google-sans-code',
    family: 'Google Sans Code',
    source: {
      type: 'link',
      links: [
        {
          id: `font-google-sans-code`,
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght,MONO@0,300..800,0..1;1,300..800,0..1&display=swap',
        },
      ],
    },
  },
  {
    label: 'Fira Code',
    value: 'fira-code',
    family: 'Fira Code',
    source: {
      type: 'link',
      links: [
        {
          id: 'font-fira-code',
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&display=swap',
        },
      ],
    },
  },
  {
    label: 'Fira Mono',
    value: 'fira-mono',
    family: 'Fira Mono',
    source: {
      type: 'link',
      links: [
        {
          id: 'font-fira-mono',
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&display=swap',
        },
      ],
    },
  },
  {
    label: 'Source Code Pro',
    value: 'source-code-pro',
    family: 'Source Code Pro',
    source: {
      type: 'link',
      links: [
        {
          id: 'font-source-code-pro',
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap',
        },
      ],
    },
  },
  {
    label: 'Noto Sans Mono',
    value: 'noto-sans-mono',
    family: 'Noto Sans Mono',
    source: {
      type: 'link',
      links: [
        {
          id: 'font-noto-sans-mono',
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wdth,wght@62.5..100,100..900&display=swap',
        },
      ],
    },
  },
  {
    label: 'Space Mono',
    value: 'space-mono',
    family: 'Space Mono',
    source: {
      type: 'link',
      links: [
        {
          id: 'font-space-mono',
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap',
        },
      ],
    },
  },
  {
    label: 'Cascadia Code',
    value: 'cascadia-code',
    family: 'Cascadia Code',
    source: {
      type: 'link',
      links: [
        {
          id: 'font-cascadia-code',
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cascadia+Code:ital,wght@0,200..700;1,200..700&display=swap',
        },
      ],
    },
  },
  {
    label: 'Cascadia Mono',
    value: 'cascadia-mono',
    family: 'Cascadia Mono',
    source: {
      type: 'link',
      links: [
        {
          id: 'font-cascadia-mono',
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cascadia+Mono:ital,wght@0,200..700;1,200..700&display=swap',
        },
      ],
    },
  },
  {
    label: 'Geist Mono',
    value: 'geist-mono',
    family: 'Geist Mono',
    source: {
      type: 'link',
      links: [
        {
          id: 'font-geist-mono',
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Geist+Mono:ital,wght@0,100..900;1,100..900&display=swap',
        },
      ],
    },
  },
  {
    label: 'Ubuntu Mono',
    value: 'ubuntu-mono',
    family: 'Ubuntu Mono',
    source: {
      type: 'link',
      links: [
        {
          id: 'font-ubuntu-mono',
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Ubuntu+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap',
        },
      ],
    },
  },
  {
    label: 'Ubuntu Sans Mono',
    value: 'ubuntu-sans-mono',
    family: 'Ubuntu Sans Mono',
    source: {
      type: 'link',
      links: [
        {
          id: 'font-ubuntu-sans-mono',
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Ubuntu+Sans+Mono:ital,wght@0,400..700;1,400..700&display=swap',
        },
      ],
    },
  },
  { label: '（系统默认）', value: 'system-ui', family: 'system-ui', source: { type: 'keyword' } },
  {
    label: '（浏览器默认）',
    value: 'monospace',
    family: 'monospace',
    source: { type: 'keyword' },
  },
];

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

/** 圆角半径（单位：rem） */
const radius = ref<number>(0.25);

/** 选中的英文字体 ID */
const englishFont = ref<string>('use-chinese');
/** 选中的中文字体 ID */
const chineseFont = ref<string>('harmonyos-sans-sc');
/** 选中的等宽字体 ID */
const monospaceFont = ref<string>('jetbrains-mono');

/** 选中的英文字体配置 */
const englishFontOption = computed<FontOption | undefined>(() =>
  englishFontOptions.find((font) => font.value === englishFont.value),
);
/** 选中的中文字体配置 */
const chineseFontOption = computed<FontOption | undefined>(() =>
  chineseFontOptions.find((font) => font.value === chineseFont.value),
);
/** 选中的等宽字体配置 */
const monospaceFontOption = computed<FontOption | undefined>(() =>
  monospaceFontOptions.find((font) => font.value === monospaceFont.value),
);

const _iconSet = ref<string>('lucide');
/** 图标集 */
const iconSet = computed<string>({
  get() {
    return _iconSet.value;
  },
  set(option) {
    _iconSet.value = option;
    appConfig.ui.icons = { ...themeIcons[option] };
  },
});

/**
 * 将字体转换为 CSS 字体家族名称字符串
 * 如果字体为关键字类型，则直接返回字体名称，否则加上单引号
 * @example
 * toCssFontFamily({ family: 'Public Sans', source: { type: 'link', links: [...] } }) // => "'Public Sans'"
 * toCssFontFamily({ family: 'system-ui', source: { type: 'keyword' } }) // => "system-ui"
 */
function toCssFontFamily(font: FontOption): string {
  return font.source.type === 'keyword' ? font.family : `'${font.family}'`;
}

const style = computed<ResolvableStyle[]>(() => {
  const style: ResolvableStyle[] = [];

  // 主题色为 grayscale 时，设置 --ui-primary 和 --ui-secondary 变量为黑白色
  if (primary.value === 'grayscale') {
    style.push({
      innerHTML: `:root { --ui-primary: black; } .dark { --ui-primary: white; }`,
      id: 'nuxt-ui-primary-grayscale',
      tagPriority: -2,
    });
  }
  if (secondary.value === 'grayscale') {
    style.push({
      innerHTML: `:root { --ui-secondary: black; } .dark { --ui-secondary: white; }`,
      id: 'nuxt-ui-secondary-grayscale',
      tagPriority: -2,
    });
  }

  // 圆角大小
  style.push({
    innerHTML: `:root { --ui-radius: ${radius.value}rem; }`,
    id: 'nuxt-ui-radius',
    tagPriority: -2,
  });

  // 字体
  // 将字体选项转换为 CSS 字体家族名称字符串
  const englishFontCss = englishFontOption.value
    ? toCssFontFamily(englishFontOption.value)
    : `'${englishFont.value}'`;
  const chineseFontCss = chineseFontOption.value
    ? toCssFontFamily(chineseFontOption.value)
    : `'${chineseFont.value}'`;
  const monospaceFontCss = monospaceFontOption.value
    ? toCssFontFamily(monospaceFontOption.value)
    : `'${monospaceFont.value}'`;

  // 根据选中的字体生成 CSS 变量
  const fontSansInnerHtml =
    englishFontOption.value?.source.type === 'use-chinese'
      ? `:root { --font-sans: ${chineseFontCss}, sans-serif; }` // 如果英文字体为 “使用中文字体”，则只使用中文字体和 sans-serif
      : `:root { --font-sans: ${englishFontCss}, ${chineseFontCss}, sans-serif; }`;
  const fontMonoInnerHtml = `:root { --font-mono: ${monospaceFontCss}, ${chineseFontCss}, monospace; }`;

  // 将 CSS 变量添加到 style 中
  style.push({
    innerHTML: fontSansInnerHtml,
    id: 'nuxt-ui-sans-font',
    tagPriority: -2,
  });
  style.push({
    innerHTML: fontMonoInnerHtml,
    id: 'nuxt-ui-mono-font',
    tagPriority: -2,
  });

  return style;
});

const extraFontLinks = ref<ResolvableLink[]>([]);

const link = computed<ResolvableLink[]>(() => {
  // 当前已选字体（始终需要）
  const selectedFonts: FontOption[] = [];

  if (englishFontOption.value) selectedFonts.push(englishFontOption.value);
  if (chineseFontOption.value) selectedFonts.push(chineseFontOption.value);
  if (monospaceFontOption.value) selectedFonts.push(monospaceFontOption.value);

  const selectedLinks: ResolvableLink[] = selectedFonts.flatMap((font) =>
    font.source.type === 'link' ? font.source.links : [],
  );

  // 合并按需加载的预览字体，按 id 去重
  const seenIds = new Set(selectedLinks.map((l) => l.id));
  const allLinks: ResolvableLink[] = [...selectedLinks];
  for (const link of extraFontLinks.value) {
    if (!seenIds.has(link.id)) {
      seenIds.add(link.id);
      allLinks.push(link);
    }
  }
  return allLinks;
});

/** 按需加载字体 CSS（通过 extraFontLinks 响应式合并到 link），用于字体选择框预览 */
function loadFontCss(fontOptions: FontOption[]): void {
  const existingIds = new Set(extraFontLinks.value.map((l) => l.id));
  const newLinks: ResolvableLink[] = [];
  for (const font of fontOptions) {
    if (font.source.type !== 'link') {
      continue;
    }
    for (const linkDef of font.source.links) {
      if (!existingIds.has(linkDef.id)) {
        existingIds.add(linkDef.id);
        newLinks.push(linkDef);
      }
    }
  }
  if (newLinks.length > 0) {
    extraFontLinks.value = [...extraFontLinks.value, ...newLinks];
  }
}

function loadEnglishFontCss() {
  loadFontCss(englishFontOptions);
}

function loadChineseFontCss() {
  loadFontCss(chineseFontOptions);
}

function loadMonospaceFontCss() {
  loadFontCss(monospaceFontOptions);
}

function resetTheme() {
  primary.value = 'green';
  secondary.value = 'blue';
  neutral.value = 'slate';
  radius.value = 0.25;
  englishFont.value = 'use-chinese';
  chineseFont.value = 'harmonyos-sans-sc';
  monospaceFont.value = 'jetbrains-mono';
  iconSet.value = 'lucide';
}

export function useTheme() {
  return {
    primaryColors,
    secondaryColors,
    neutralColors,
    radiuses,
    englishFontOptions,
    chineseFontOptions,
    monospaceFontOptions,
    iconSets,
    colorModes,
    primary,
    secondary,
    neutral,
    radius,
    englishFont,
    chineseFont,
    monospaceFont,
    iconSet,
    style,
    link,
    resetTheme,
    loadEnglishFontCss,
    loadChineseFontCss,
    loadMonospaceFontCss,
  };
}
