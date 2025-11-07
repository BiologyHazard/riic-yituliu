import Color, { type ColorInstance } from "color"


export const bgColorMap: Map<string, ColorInstance> = new Map(Object.entries({
    'cc.vup': '#0098DC',
    'cc.vdown': '#FF6237',
    'cc.rem': '#F49800',
    'cc.kw': '#00B0FF',
    '控制中枢': '#005752',
    '发电站': '#8fc31f',
    '制造站': '#ffd800',
    '贸易站': '#0075a9',
    '加工站': '#e3eb00',
    '训练室': '#7d0022',
    '宿舍': '#21cdcb',
    '办公室': '#565656',
    '会客室': '#dd653f',
}).map(([k, v]) => [k, Color(v)]));

export const fontColorMap: Map<string, ColorInstance> = new Map(Object.entries({
    '控制中枢': '#ffffff',
    '发电站': '#ffffff',
    '制造站': '#333333',
    '贸易站': '#ffffff',
    '加工站': '#333333',
    '训练室': '#ffffff',
    '宿舍': '#ffffff',
    '办公室': '#ffffff',
    '会客室': '#ffffff',
}).map(([k, v]) => [k, Color(v)]));
