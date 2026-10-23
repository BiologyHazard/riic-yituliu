import type { BlueprintBox, BlueprintColor, BlueprintNode } from './blueprintRenderer';
import { blueprintBox } from './blueprintRenderer';

export function visitGameUi(root: BlueprintNode, visit: (node: BlueprintNode) => void) {
  visit(root);
  root.children.forEach((child) => visitGameUi(child, visit));
}

export function findGameUi(root: BlueprintNode, name: string): BlueprintNode {
  if (root.name === name) return root;
  for (const child of root.children) {
    const result = findOptional(child, name);
    if (result) return result;
  }
  throw new Error(`Missing game UI node: ${name}`);
}

function findOptional(root: BlueprintNode, name: string): BlueprintNode | undefined {
  if (root.name === name) return root;
  for (const child of root.children) {
    const result = findOptional(child, name);
    if (result) return result;
  }
}

export function screenRoot(root: BlueprintNode) {
  Object.assign(root.rect, {
    AnchorMin: { x: 0, y: 0 },
    AnchorMax: { x: 1, y: 1 },
    Pivot: { x: 0.5, y: 0.5 },
    LocalScale: { x: 1, y: 1 },
    AnchoredPosition: { x: 0, y: 0 },
    SizeDelta: { x: 0, y: 0 },
  });
}

/** `CommonTopMenu._ResetDetailContentRect` 将屏幕边缘转换到菜单父级坐标。 */
export function prepareTopMenu(root: BlueprintNode, width: number, height: number, open: boolean) {
  function visit(node: BlueprintNode, parent: BlueprintBox) {
    if (node.name === 'panel_content') {
      node.active = open;
      node.rect.AnchoredPosition.x = -parent.x / parent.scaleX;
      node.rect.AnchoredPosition.y = parent.y / parent.scaleY;
      node.rect.SizeDelta.x = width / parent.scaleX;
      node.rect.SizeDelta.y = height / parent.scaleY;
    }
    if (node.name === 'panel_backonly') node.active = false;
    if (node.name === 'panel_light') node.active = open;
    const box = blueprintBox(node, parent);
    node.children.forEach((child) => visit(child, box));
  }
  visit(root, { x: 0, y: 0, width, height, scaleX: 1, scaleY: 1 });
}

interface ObjectReference {
  m_PathID: string;
}
interface ButtonColorState {
  m_Transition: number;
  m_TargetGraphic: ObjectReference;
  m_Colors: { m_PressedColor: BlueprintColor; m_ColorMultiplier: number };
}

/** 按对象引用分发 `ColorTint`，包括 `UIColorGraphic` 指向的兄弟图形。 */
export function applyPressedColor(root: BlueprintNode, pressedName: string | null) {
  if (!pressedName) return;
  function pathTo(node: BlueprintNode): BlueprintNode[] | undefined {
    if (node.name === pressedName) return [node];
    for (const child of node.children) {
      const path = pathTo(child);
      if (path) return [node, ...path];
    }
  }
  const path = pathTo(root);
  const pressed = path?.at(-1);
  const button = (pressed?.scripts.UIButton ?? pressed?.scripts.Button) as unknown as
    | ButtonColorState
    | undefined;
  if (!button || button.m_Transition !== 1) return;
  // 同一 Prefab 的多个实例共享资源编号，引用只在当前实例的祖先范围中解析。
  const nodes = new Map<string, BlueprintNode>();
  for (const scope of path!.toReversed()) {
    nodes.clear();
    visitGameUi(scope, (node) => node.componentIds.forEach((id) => nodes.set(id, node)));
    const target = nodes.get(button.m_TargetGraphic.m_PathID);
    if (!target) continue;
    const elements = target.scripts.UIColorGraphic?._colorElements as ObjectReference[] | undefined;
    if (!elements || elements.every((ref) => nodes.has(ref.m_PathID))) break;
  }
  const visited = new Set<BlueprintNode>();
  function tint(reference: ObjectReference) {
    const node = nodes.get(reference.m_PathID);
    if (!node || visited.has(node)) return;
    visited.add(node);
    const group = node.scripts.UIColorGraphic?._colorElements as ObjectReference[] | undefined;
    if (group) group.forEach(tint);
    for (const graphic of [node.image, node.text]) {
      if (!graphic) continue;
      const pressed = button!.m_Colors.m_PressedColor;
      const multiplier = button!.m_Colors.m_ColorMultiplier;
      graphic.color = {
        r: graphic.color.r * pressed.r * multiplier,
        g: graphic.color.g * pressed.g * multiplier,
        b: graphic.color.b * pressed.b * multiplier,
        a: graphic.color.a * pressed.a,
      };
    }
  }
  tint(button.m_TargetGraphic);
}
