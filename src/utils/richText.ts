/**
 * 富文本描述解析工具
 *
 * 将明日方舟基建技能描述中的自定义标签（`<@styleKey>`, `<$termKey>`, `</>`）
 * 解析为结构化的片段数组，配合模板渲染替代 v-html，从根本上消除 XSS 风险。
 */

export interface RichTextSegment {
  /** 纯文本内容 */
  text: string;
  /** 文字颜色（CSS 颜色值，如 "#FF0000"） */
  color?: string;
  /** 是否斜体 */
  italic?: boolean;
  /** 是否带下划线（术语标记） */
  underline?: boolean;
}

interface TextStyleState {
  color?: string;
  italic?: boolean;
  underline?: boolean;
}

const TAG_REGEX = /<([^>]+)>/g;

/**
 * 从样式模板字符串中提取样式信息
 * @param styleTemplate 样式模板（如 "<color=#FF0000>" 或 "<i>"）
 */
function extractStyleFromTemplate(styleTemplate: string): TextStyleState {
  const state: TextStyleState = {};

  // 提取颜色值
  const colorMatch = styleTemplate.match(/<color=(#[0-9A-Fa-f]{6})>/);
  if (colorMatch) {
    state.color = colorMatch[1];
  }

  // 检测斜体
  if (styleTemplate.includes('<i>')) {
    state.italic = true;
  }

  return state;
}

/**
 * 合并样式栈，计算当前有效的样式
 */
function mergeStyleStack(stack: TextStyleState[]): TextStyleState {
  return stack.reduce<TextStyleState>((acc, s) => {
    if (s.color !== undefined) acc.color = s.color;
    if (s.italic !== undefined) acc.italic = s.italic;
    if (s.underline !== undefined) acc.underline = s.underline;
    return acc;
  }, {});
}

/**
 * 将基建技能富文本描述解析为结构化片段数组
 *
 * @param description 原始描述字符串，包含 `<@styleKey>`, `<$termKey>`, `</>` 标签
 * @param richTextStyles 样式表，键为样式 key，值为样式模板字符串
 * @returns 结构化片段数组，可直接在模板中安全渲染
 *
 * @example
 * parseRichTextSegments(
 *   '制造站制造<@ba.dt.manufacture>贵金属</>时',
 *   { 'ba.dt.manufacture': '<color=#FFB300>' }
 * )
 * // [
 * //   { text: '制造站制造' },
 * //   { text: '贵金属', color: '#FFB300' },
 * //   { text: '时' }
 * // ]
 */
export function parseRichTextSegments(
  description: string,
  richTextStyles: Record<string, string>,
): RichTextSegment[] {
  const segments: RichTextSegment[] = [];
  const styleStack: TextStyleState[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  TAG_REGEX.lastIndex = 0;
  while ((match = TAG_REGEX.exec(description)) !== null) {
    // 标签之前的纯文本
    if (match.index > lastIndex) {
      const text = description.slice(lastIndex, match.index);
      if (text) {
        segments.push({ text, ...mergeStyleStack(styleStack) });
      }
    }

    const tagContent = match[1]!;

    if (tagContent === '/') {
      // 结束标签：弹出栈顶样式
      styleStack.pop();
    } else if (tagContent.startsWith('@')) {
      // 样式标签
      const styleKey = tagContent.substring(1);
      const styleTemplate = richTextStyles[styleKey];
      if (styleTemplate) {
        styleStack.push(extractStyleFromTemplate(styleTemplate));
      } else {
        styleStack.push({});
      }
    } else if (tagContent.startsWith('$')) {
      // 术语标签：添加下划线
      styleStack.push({ underline: true });
    } else {
      // 未知标签：保留原始文本
      const rawTag = match[0];
      segments.push({ text: rawTag, ...mergeStyleStack(styleStack) });
    }

    lastIndex = TAG_REGEX.lastIndex;
  }

  // 最后一个标签之后的剩余文本
  if (lastIndex < description.length) {
    const text = description.slice(lastIndex);
    if (text) {
      segments.push({ text, ...mergeStyleStack(styleStack) });
    }
  }

  return segments;
}
