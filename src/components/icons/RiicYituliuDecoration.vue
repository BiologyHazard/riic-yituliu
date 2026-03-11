<template>
  <svg viewBox="0 0 105 52" xmlns="http://www.w3.org/2000/svg">
    <!-- 背景 -->
    <rect fill="#eeeeee" height="52" width="105" />
    <!-- 点阵 -->
    <rect fill="#202020" height="2" width="2" x="7" y="7" />
    <rect fill="#202020" height="2" width="2" x="23" y="7" />
    <rect fill="#202020" height="2" width="2" x="7" y="23" />
    <rect fill="#202020" height="2" width="2" x="23" y="23" />
    <!-- 右侧背景正方形 -->
    <rect fill="#202021" height="42" width="42" x="58" y="5" />
    <!-- 箭头，坐标为
      (64 + 4 * sqrt(2), 11),
      (64, 11 + 4 * sqrt(2)),
      (64 + 22 - 4 * sqrt(2), 33),
      (64, 33),
      (64, 41),
      (94, 41),
      (94, 11),
      (86, 11),
      (86, 11 + 22 - 4 * sqrt(2)),
    ) -->
    <polygon
      fill="white"
      points="
          69.65685425, 11
          64, 16.65685425
          80.34314575, 33
          64, 33
          64, 41
          94, 41
          94, 11
          86, 11
          86, 27.34314575
        "
    />
  </svg>
</template>
