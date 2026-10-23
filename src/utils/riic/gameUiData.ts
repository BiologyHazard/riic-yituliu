import hudData from '@/assets/images/riic/blueprint/hud.json';
import type { GameUiSprite } from './gameUiRenderer';

const textures = import.meta.glob<string>('/src/assets/images/riic/blueprint/hud/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** 图像由资源生成器本地生成，版本库只保存布局与资源身份。 */
export const gameUiSprites: Record<string, GameUiSprite> = Object.fromEntries(
  Object.entries(hudData.sprites).map(([key, sprite]) => {
    const source = textures[`/src/assets/images/riic/blueprint/${sprite.file}`];
    if (!source) throw new Error(`Missing game UI image: ${sprite.file}`);
    return [key, { ...sprite, source }];
  }),
);
