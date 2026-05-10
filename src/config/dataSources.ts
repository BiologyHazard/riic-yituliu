export interface DataSource {
  label: string;
  id: string;
  baseUrl: string;
  isGithub: boolean;
}

export interface GithubMirror {
  label: string;
  id: string;
  prefix: string;
}

export const gameDataSources: DataSource[] = [
  {
    id: 'torappu',
    label: 'Torappu',
    baseUrl: 'https://torappu.prts.wiki/gamedata/latest/excel',
    isGithub: false,
  },
  {
    id: 'Kengxxiao/ArknightsGameData',
    label: 'Kengxxiao/ArknightsGameData',
    baseUrl:
      'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/refs/heads/master/zh_CN/gamedata/excel',
    isGithub: true,
  },
  {
    id: 'ArknightsAssets/ArknightsGamedata',
    label: 'ArknightsAssets/ArknightsGamedata',
    baseUrl:
      'https://raw.githubusercontent.com/ArknightsAssets/ArknightsGamedata/refs/heads/master/cn/gamedata/excel',
    isGithub: true,
  },
  {
    id: 'yuanyan3060/ArknightsGameResource',
    label: 'yuanyan3060/ArknightsGameResource',
    baseUrl:
      'https://raw.githubusercontent.com/yuanyan3060/ArknightsGameResource/refs/heads/main/gamedata/excel',
    isGithub: true,
  },
  {
    id: 'fexli/ArknightsResource',
    label: 'fexli/ArknightsResource',
    baseUrl:
      'https://raw.githubusercontent.com/fexli/ArknightsResource/refs/heads/main/gamedata/excel',
    isGithub: true,
  },
  {
    id: 'closure-studio/ArknightsGamedataPure',
    label: 'closure-studio/ArknightsGamedataPure',
    baseUrl:
      'https://raw.githubusercontent.com/closure-studio/ArknightsGamedataPure/refs/heads/main/excel',
    isGithub: true,
  },
];

export const avatarSources: DataSource[] = [
  {
    id: 'torappu',
    label: 'Torappu',
    baseUrl: 'https://torappu.prts.wiki/assets/char_avatar',
    isGithub: false,
  },
  {
    id: 'yuanyan3060/ArknightsGameResource',
    label: 'yuanyan3060/ArknightsGameResource',
    baseUrl:
      'https://raw.githubusercontent.com/yuanyan3060/ArknightsGameResource/refs/heads/main/avatar',
    isGithub: true,
  },
];

export const baseSkillIconSources: DataSource[] = [
  {
    id: 'torappu',
    label: 'Torappu',
    baseUrl: 'https://torappu.prts.wiki/assets/build_skill_icon',
    isGithub: false,
  },
  {
    id: 'yuanyan3060/ArknightsGameResource',
    label: 'yuanyan3060/ArknightsGameResource',
    baseUrl:
      'https://raw.githubusercontent.com/yuanyan3060/ArknightsGameResource/refs/heads/main/building_skill',
    isGithub: true,
  },
];

export const githubMirrors: GithubMirror[] = [
  {
    id: 'none',
    label: '（不使用镜像）',
    prefix: '',
  },
  {
    id: 'gh-proxy.com',
    label: 'gh-proxy.com',
    prefix: 'https://gh-proxy.com/',
  },
  {
    id: 'ghproxy.net',
    label: 'ghproxy.net',
    prefix: 'https://ghproxy.net/',
  },
  {
    id: 'githubproxy.cc',
    label: 'githubproxy.cc',
    prefix: 'https://githubproxy.cc/',
  },
  {
    id: 'ghfast.top',
    label: 'ghfast.top',
    prefix: 'https://ghfast.top/',
  },
];

export const defaultGameDataSourceId = 'torappu';
export const defaultAvatarSourceId = 'torappu';
export const defaultBaseSkillIconSourceId = 'torappu';
export const defaultGithubMirrorId = 'none';
