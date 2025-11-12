<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 105 52">
    <!-- 背景 -->
    <rect width="105" height="52" fill="#eeeeee" />
    <!-- 点阵 -->
    <rect x="7" y="7" width="2" height="2" fill="#202020" />
    <rect x="23" y="7" width="2" height="2" fill="#202020" />
    <rect x="7" y="23" width="2" height="2" fill="#202020" />
    <rect x="23" y="23" width="2" height="2" fill="#202020" />
    <!-- 右侧背景正方形 -->
    <rect x="58" y="5" width="42" height="42" fill="#202021" />
    <!-- 箭头 -->
    <rect x="64" y="33" width="30" height="8" fill="#ffffff" />
    <rect x="86" y="11" width="8" height="30" fill="#ffffff" />
    <!-- 斜着的矩形，坐标为 (
      (64 + 4 * sqrt(2), 11),
      (64, 11 + 4 * sqrt(2)),
      (94 - 4 * sqrt(2), 41),
      (94, 41 - 4 * sqrt(2)),
    ) -->
    <polygon
      points="
          69.95685425, 11
          64, 16.65685425
          88.34314575, 41
          94, 35.34314575
        "
      fill="white"
    />
  </svg>
</template>
