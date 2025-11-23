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
      fill="white"
    />
  </svg>
</template>
