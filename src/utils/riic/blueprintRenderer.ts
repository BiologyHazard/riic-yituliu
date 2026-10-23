import prefabData from '@/assets/images/riic/blueprint/blueprint-prefabs.json';
import type { BlueprintRoomState } from './roomState';
import { getRoomCapacity, roomStateText } from './roomState';

export interface Vector {
  x: number;
  y: number;
}
export interface BlueprintColor {
  r: number;
  g: number;
  b: number;
  a: number;
}
interface Reference {
  m_PathID: string;
}
interface Padding {
  m_Left: number;
  m_Right: number;
  m_Top: number;
  m_Bottom: number;
}
type Script = Record<string, unknown>;
export interface BlueprintNode {
  name: string;
  id: string;
  active: boolean;
  componentIds: string[];
  scripts: Record<string, Script>;
  rect: {
    AnchorMin: Vector;
    AnchorMax: Vector;
    AnchoredPosition: Vector;
    SizeDelta: Vector;
    Pivot: Vector;
    LocalScale: Vector;
  };
  image?: {
    sprite: string;
    source?: string;
    type: number;
    preserveAspect: boolean;
    color: BlueprintColor;
    ppuMultiplier: number;
    fillCenter: boolean;
    atlasSlice?: { x: number; y: number; z: number; w: number } | null;
  };
  text?: { value: string; color: BlueprintColor; size: number; alignment: number };
  font?: string;
  canvasGroup?: { m_Alpha: number; m_IgnoreParentGroups: boolean };
  children: BlueprintNode[];
}
export interface BlueprintSprite {
  width: number;
  height: number;
  textureRect?: { x: number; y: number; width: number; height: number };
  border: { x: number; y: number; z: number; w: number };
  ppu: number;
}
export interface BlueprintBox {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
}

export const blueprintData = prefabData as unknown as {
  sprites: Record<string, BlueprintSprite>;
  prefabs: Record<string, BlueprintNode>;
};

/** 序列化布局尚未初始化的 `null` 由布局组重算，不能传播到 SVG。 */
function numeric(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function blueprintBox(node: BlueprintNode, parent: BlueprintBox): BlueprintBox {
  const r = node.rect;
  const width = parent.width * (r.AnchorMax.x - r.AnchorMin.x) + numeric(r.SizeDelta.x);
  const height = parent.height * (r.AnchorMax.y - r.AnchorMin.y) + numeric(r.SizeDelta.y);
  const pivotX =
    parent.width * (r.AnchorMin.x + (r.AnchorMax.x - r.AnchorMin.x) * r.Pivot.x) +
    numeric(r.AnchoredPosition.x);
  const pivotY =
    parent.height * (r.AnchorMin.y + (r.AnchorMax.y - r.AnchorMin.y) * r.Pivot.y) +
    numeric(r.AnchoredPosition.y);
  return {
    x: parent.x + (pivotX - width * r.Pivot.x * r.LocalScale.x) * parent.scaleX,
    y:
      parent.y +
      (parent.height - pivotY - height * (1 - r.Pivot.y) * r.LocalScale.y) * parent.scaleY,
    width,
    height,
    scaleX: parent.scaleX * r.LocalScale.x,
    scaleY: parent.scaleY * r.LocalScale.y,
  };
}

/** 运行时引用既可能指向 GameObject，也可能指向其组件。 */
function nodeIndex(root: BlueprintNode): Map<string, BlueprintNode> {
  const nodes = new Map<string, BlueprintNode>();
  function visit(node: BlueprintNode) {
    nodes.set(node.id, node);
    for (const id of node.componentIds) nodes.set(id, node);
    for (const child of node.children) visit(child);
  }
  visit(root);
  return nodes;
}

function referenceNode(
  nodes: Map<string, BlueprintNode>,
  value: unknown,
): BlueprintNode | undefined {
  return value && typeof value === 'object' ? nodes.get((value as Reference).m_PathID) : undefined;
}

function applyColor(node: BlueprintNode, color: BlueprintColor, nodes: Map<string, BlueprintNode>) {
  if (node.image) node.image.color = { ...color };
  if (node.text) node.text.color = { ...color };
  const group = node.scripts.UIColorGraphic;
  if (!group) return;
  group._color = { ...color };
  for (const ref of (group._colorElements ?? []) as Reference[]) {
    const target = nodes.get(ref.m_PathID);
    if (target && target !== node) applyColor(target, color, nodes);
  }
}

function setReferenceActive(nodes: Map<string, BlueprintNode>, value: unknown, active: boolean) {
  const target = referenceNode(nodes, value);
  if (target) target.active = active;
}

/** 使用游戏对象绑定更新显示，不根据节点在截图中的位置设值。 */
export function prepareBlueprint(
  name: string,
  state?: BlueprintRoomState,
  roomName?: string,
  controlLevel?: number,
  construction = false,
): BlueprintNode | undefined {
  const source = blueprintData.prefabs[name];
  if (!source) return undefined;
  const root = structuredClone(source);
  const nodes = nodeIndex(root);
  const uniqueNodes = [...new Set(nodes.values())];
  const roomScript = Object.entries(root.scripts).find(([key]) => key.startsWith('B'))?.[1] ?? {};
  const stateText = state ? roomStateText(state) : '';
  const title = state?.name || roomName || '';
  const mainColorGroup = referenceNode(nodes, roomScript._mainColorComponents);
  if (mainColorGroup && roomScript._mainColor) {
    applyColor(mainColorGroup, roomScript._mainColor as BlueprintColor, nodes);
  }
  setReferenceActive(nodes, roomScript._panelFavorMax, state?.trust ?? false);
  const working = state
    ? ['working', 'boosting', 'clue', 'meeting', 'training'].includes(state.status)
    : false;
  for (const node of uniqueNodes) {
    if (node.text) {
      if (['text_name', 'text_room_name', 'label_name_zh'].includes(node.name))
        node.text.value = title || node.text.value;
      if (['text_state', 'text_room_state', 'working', 'stop'].includes(node.name))
        node.text.value = stateText || node.text.value;
      if (node.name.startsWith('text_level') && (state || controlLevel !== undefined))
        node.text.value = (state?.level ?? controlLevel!).toFixed(1);
      if (state && ['text_number', 'text_hilight_number', 'text_char_num'].includes(node.name))
        node.text.value = String(state.staff);
      if (state && ['text_limit', 'text_char_limit'].includes(node.name))
        node.text.value = `/${getRoomCapacity(state)}`;
    }
    if (node.name === 'panel_archi_only' || node.name === 'panel_architect_only')
      node.active = construction;
    if (node.name === 'panel_normal_only') node.active = !construction;
    if (node.name === 'levelup_icon') node.active = state?.canLevelUp ?? false;
    if (node.name === 'panel_favor_icon') node.active = state?.trust ?? false;
    if (node.name === 'panel_frame_light') node.active = state?.highlight ?? false;
    if (node.name === 'icon_product_ripple')
      node.active = (state?.product && state.highlight) ?? false;
    if (node.name === 'icon_product' || node.name === 'output_icon')
      node.active = state?.product ?? false;
    if (node.name === 'clue_icon') node.active = state?.clue ?? false;
    if (node.name === 'message_board_icon') node.active = state?.message ?? false;
    if (node.name === 'finish_icon') node.active = state?.status === 'finished';
    if (node.name === 'spec_icon')
      node.active = state?.status === 'training' || state?.status === 'finished';
    if (
      state?.roomId === 'TRAINING' &&
      node.image &&
      (node.name === 'start_icon' || node.name === 'end_icon')
    ) {
      node.active =
        node.name === 'start_icon'
          ? state.status === 'training'
          : state.status === 'training' || state.status === 'finished';
      node.image.sprite = `specialized_tiny_${node.name === 'start_icon' ? state.trainingLevel : state.trainingTargetLevel}`;
    }
    if (node.name === 'panel_working_effect')
      node.active = state?.roomId === 'RECYCLE' ? state.status === 'boosting' : working;
    if (node.name === 'working') node.active = state?.status === 'working';
    if (node.name === 'boosting') node.active = state?.status === 'boosting';
    if (node.name === 'stop') node.active = state?.status === 'stopped';
    if (node.name.startsWith('img_elevator_') && state) {
      const direction = node.name.slice(
        'img_elevator_'.length,
      ) as keyof BlueprintRoomState['directions'];
      node.active = state.directions[direction];
    }
    const station = node.scripts.BStationViewForProgressRoom;
    if (station) {
      const tired = state?.tired ?? false;
      setReferenceActive(nodes, station._textNumber, !tired);
      setReferenceActive(nodes, station._textHilightNumber, tired);
      setReferenceActive(
        nodes,
        station._iconCharNormal,
        !tired || !referenceNode(nodes, station._iconCharTired),
      );
      setReferenceActive(nodes, station._iconCharTired, tired);
    }
    const progress = node.scripts.PiecewiseProgressBar;
    if (progress) {
      const refs = progress._progressSlots as Reference[];
      let fraction =
        node.name === 'panel_working_effect'
          ? (state?.triangles ?? 0) / refs.length
          : (state?.progress ?? 0);
      if (state?.roomId === 'TRAINING' && node.name === 'panel_charge') {
        if (state.status === 'idle') fraction = 0;
        if (state.status === 'finished') fraction = 1;
      }
      // `PiecewiseProgressBar` 逐格激活，格数来自序列化数组。
      const visible = Math.floor(
        (Math.max(0, Math.min(1, fraction)) + 9.999999747378752e-6) * refs.length,
      );
      refs.forEach((ref, index) => setReferenceActive(nodes, ref, index < visible));
    }
    if (node.scripts.SimpleLayoutContent && node.name === 'panel_level') {
      node.children = Array.from({ length: state?.level ?? 0 }, (_, index) => {
        const child = structuredClone(blueprintData.prefabs.level_item!);
        child.id = `${node.id}-level-${index}`;
        child.name = `${child.name}-${index}`;
        const color = (roomScript._mainColor ?? roomScript._colorMain) as
          | BlueprintColor
          | undefined;
        if (child.image && color) child.image.color = { ...color };
        return child;
      });
    }
  }
  if (state) {
    const stateNode = referenceNode(nodes, roomScript._textRoomState);
    const color = (
      state.status === 'idle'
        ? roomScript._stateNormalColor
        : ['stopped', 'full'].includes(state.status)
          ? roomScript._stateHilightColor
          : roomScript._mainColor
    ) as BlueprintColor | undefined;
    if (stateNode?.text && color) stateNode.text.color = { ...color };
  }
  return root;
}

let measurementContext: CanvasRenderingContext2D | null = null;

function textSize(node: BlueprintNode): Vector {
  if (!node.text) return { x: 0, y: 0 };
  measurementContext ??=
    typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
  if (measurementContext)
    measurementContext.font = `${node.text.size}px "${node.font || 'NotoSansHans-Medium'}"`;
  const metrics = measurementContext?.measureText(node.text.value);
  return { x: metrics?.width ?? 0, y: node.text.size };
}

/** Unity 布局组先计算固有尺寸，再根据父矩形排列子节点。 */
function preferredSize(node: BlueprintNode, sprites: Record<string, BlueprintSprite>): Vector {
  const grid = node.scripts.GridLayoutGroup;
  const horizontal = node.scripts.HorizontalLayoutGroup;
  const children = node.children.filter((child) => child.active);
  if (grid) {
    const cell = grid.m_CellSize as Vector;
    const spacing = grid.m_Spacing as Vector;
    const padding = grid.m_Padding as Padding;
    const columns =
      numeric(grid.m_Constraint) === 1
        ? numeric(grid.m_ConstraintCount, 1)
        : Math.ceil(children.length / numeric(grid.m_ConstraintCount, 1));
    const rows =
      numeric(grid.m_Constraint) === 2
        ? numeric(grid.m_ConstraintCount, 1)
        : Math.ceil(children.length / Math.max(columns, 1));
    return {
      x: padding.m_Left + padding.m_Right + Math.max(0, columns * (cell.x + spacing.x) - spacing.x),
      y: padding.m_Top + padding.m_Bottom + Math.max(0, rows * (cell.y + spacing.y) - spacing.y),
    };
  }
  if (horizontal) {
    const padding = horizontal.m_Padding as Padding;
    const sizes = children.map((child) => preferredSize(child, sprites));
    return {
      x:
        padding.m_Left +
        padding.m_Right +
        sizes.reduce(
          (sum, size, index) =>
            sum +
            (horizontal.m_ChildControlWidth ? size.x : numeric(children[index]!.rect.SizeDelta.x)),
          0,
        ) +
        Math.max(0, children.length - 1) * numeric(horizontal.m_Spacing),
      y:
        padding.m_Top +
        padding.m_Bottom +
        Math.max(
          0,
          ...sizes.map((size, index) =>
            horizontal.m_ChildControlHeight ? size.y : numeric(children[index]!.rect.SizeDelta.y),
          ),
        ),
    };
  }
  if (node.text) return textSize(node);
  if (node.image?.sprite) {
    const sprite = sprites[node.image.sprite]!;
    return { x: (sprite.width * 100) / sprite.ppu, y: (sprite.height * 100) / sprite.ppu };
  }
  return { x: numeric(node.rect.SizeDelta.x), y: numeric(node.rect.SizeDelta.y) };
}

function setLayoutRect(node: BlueprintNode, x: number, y: number, width: number, height: number) {
  node.rect.AnchorMin = { x: 0, y: 1 };
  node.rect.AnchorMax = { x: 0, y: 1 };
  node.rect.SizeDelta = { x: width, y: height };
  node.rect.AnchoredPosition = {
    x: x + width * node.rect.Pivot.x,
    y: -y - height * (1 - node.rect.Pivot.y),
  };
}

export function layoutBlueprint(
  node: BlueprintNode,
  parent: BlueprintBox,
  sprites: Record<string, BlueprintSprite> = blueprintData.sprites,
) {
  const fitter = node.scripts.ContentSizeFitter;
  const preferred = preferredSize(node, sprites);
  if (fitter?.m_HorizontalFit === 2) node.rect.SizeDelta.x = preferred.x;
  if (fitter?.m_VerticalFit === 2) node.rect.SizeDelta.y = preferred.y;
  const box = blueprintBox(node, parent);
  const grid = node.scripts.GridLayoutGroup;
  const horizontal = node.scripts.HorizontalLayoutGroup;
  let children = node.children.filter((child) => child.active);
  if (grid) {
    const cell = grid.m_CellSize as Vector;
    const spacing = grid.m_Spacing as Vector;
    const padding = grid.m_Padding as Padding;
    const columns =
      numeric(grid.m_Constraint) === 1
        ? numeric(grid.m_ConstraintCount, 1)
        : Math.ceil(children.length / numeric(grid.m_ConstraintCount, 1));
    const align = numeric(grid.m_ChildAlignment);
    const startX = padding.m_Left + Math.max(0, box.width - preferred.x) * ((align % 3) / 2);
    const startY =
      padding.m_Top + Math.max(0, box.height - preferred.y) * (Math.floor(align / 3) / 2);
    children.forEach((child, index) =>
      setLayoutRect(
        child,
        startX + (index % columns) * (cell.x + spacing.x),
        startY + Math.floor(index / columns) * (cell.y + spacing.y),
        cell.x,
        cell.y,
      ),
    );
  } else if (horizontal) {
    if (horizontal.m_ReverseArrangement) children = [...children].reverse();
    const padding = horizontal.m_Padding as Padding;
    const align = numeric(horizontal.m_ChildAlignment);
    let x = padding.m_Left + Math.max(0, box.width - preferred.x) * ((align % 3) / 2);
    for (const child of children) {
      const size = preferredSize(child, sprites);
      const width = horizontal.m_ChildControlWidth ? size.x : numeric(child.rect.SizeDelta.x);
      const height = horizontal.m_ChildControlHeight ? size.y : numeric(child.rect.SizeDelta.y);
      const y =
        padding.m_Top +
        (box.height - padding.m_Top - padding.m_Bottom - height) * (Math.floor(align / 3) / 2);
      setLayoutRect(child, x, y, width, height);
      x += width + numeric(horizontal.m_Spacing);
    }
  }
  for (const child of children) layoutBlueprint(child, box, sprites);
}
