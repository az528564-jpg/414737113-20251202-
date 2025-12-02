let sprites = {};
let currentKey = 'stance';
let frameW = 0, frameH = 0;
let currentFrame = 0;
let lastChange = 0;
const FRAME_INTERVAL = 100; // ms 每幀間隔

// 移動相關變數
let charX = 0; // 角色中心 X 位置
let charY = 0; // 角色中心 Y 位置
let velocityX = 0; // X 方向速度
let velocityY = 0; // Y 方向速度
const WALK_SPEED = 3; // 移動速度（像素/幀）
let isWalking = false; // 是否正在行走
let facingRight = true; // 角色朝向（true=右, false=左）

// 用來暫存切換前的 key，以便放開滑鼠還原
let prevKey = null;

function preload() {
  // 主要站立精靈（10 幀）
  sprites['stance'] = {
    img: loadImage('1/stance/all.png'),
    frames: 10
  };

  // 右鍵按下時要切換的精靈（6 幀）
  sprites['walk'] = {
    img: loadImage('1/walk/all.png'),
    frames: 6
  };

  // slash 精靈（5 幀），來源檔案 1/slash/all.png，總寬 755 總高 140
  // 每格寬度 = 755 / 5 = 151
  sprites['slash'] = {
    img: loadImage('1/slash/all.png'),
    frames: 5,
    frameW: 755 / 5,
    frameH: 140
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noSmooth();
  updateFrameSize();
  lastChange = millis();
  charX = width / 2; // 初始位置：螢幕中央
  charY = height / 2;
}

function updateFrameSize() {
  const s = sprites[currentKey];
  if (s && s.img) {
    // 若 sprite 指定了固定寬高就用它，否則從圖檔計算
    if (typeof s.frameW !== 'undefined' && typeof s.frameH !== 'undefined') {
      frameW = s.frameW;
      frameH = s.frameH;
    } else {
      frameW = s.img.width / s.frames;
      frameH = s.img.height;
    }
  } else {
    frameW = frameH = 0;
  }
}

function draw() {
  background('#e6ccb2');

  const s = sprites[currentKey];
  if (!s || !s.img) return;

  // 更新動畫幀
  if (millis() - lastChange >= FRAME_INTERVAL) {
    currentFrame = (currentFrame + 1) % s.frames;
    lastChange = millis();
  }

  // 更新位置
  charX += velocityX;
  charY += velocityY;

  // 邊界限制：角色不能超出畫布左右/上下邊界
  const halfFrameW = frameW / 2;
  const halfFrameH = frameH / 2;
  if (charX - halfFrameW < 0) {
    charX = halfFrameW;
  }
  if (charX + halfFrameW > width) {
    charX = width - halfFrameW;
  }
  if (charY - halfFrameH < 0) {
    charY = halfFrameH;
  }
  if (charY + halfFrameH > height) {
    charY = height - halfFrameH;
  }

  const sx = currentFrame * frameW;

  // 繪製精靈
  const dx = charX - frameW / 2; // 左上角 X
  const dy = charY - frameH / 2; // 左上角 Y

  // 根據朝向繪製精靈
  push();
  // 使用 translate 以便翻轉時以角色中心為基準
  translate(charX, charY);
  if (!facingRight) {
    scale(-1, 1); // 翻轉向左
  }
  image(s.img, -frameW / 2, -frameH / 2, frameW, frameH, sx, 0, frameW, frameH);
  pop();
}


function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    if (currentKey !== 'walk') {
      currentKey = 'walk';
      currentFrame = 0;
      updateFrameSize();
      lastChange = millis();
    }
    isWalking = true;
    facingRight = true;
    velocityX = WALK_SPEED; // 向右移動
  } else if (keyCode === LEFT_ARROW) {
    if (currentKey !== 'walk') {
      currentKey = 'walk';
      currentFrame = 0;
      updateFrameSize();
      lastChange = millis();
    }
    isWalking = true;
    facingRight = false;
    velocityX = -WALK_SPEED; // 向左移動
  } else if (keyCode === UP_ARROW) {
    if (currentKey !== 'walk') {
      currentKey = 'walk';
      currentFrame = 0;
      updateFrameSize();
      lastChange = millis();
    }
    isWalking = true;
    velocityY = -WALK_SPEED; // 向上移動
  } else if (keyCode === DOWN_ARROW) {
    if (currentKey !== 'walk') {
      currentKey = 'walk';
      currentFrame = 0;
      updateFrameSize();
      lastChange = millis();
    }
    isWalking = true;
    velocityY = WALK_SPEED; // 向下移動
  }
}

function keyReleased() {
  // 放開任何方向鍵時恢復站立精靈並停止相對方向的移動
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {
    velocityX = 0;
  }
  if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
    velocityY = 0;
  }

  // 若沒有任何方向鍵按著，回到站立精靈
  if (!keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW) && !keyIsDown(UP_ARROW) && !keyIsDown(DOWN_ARROW)) {
    if (currentKey !== 'stance') {
      currentKey = 'stance';
      currentFrame = 0;
      updateFrameSize();
      lastChange = millis();
    }
    isWalking = false;
  }
}

// 當滑鼠按下時切換到 slash（僅處理左鍵）
function mousePressed() {
  if (mouseButton === LEFT) {
    // 暫存當前 key，之後放開還原
    prevKey = currentKey;
    currentKey = 'slash';
    currentFrame = 0;
    updateFrameSize();
    lastChange = millis();
  }
}

// 放開滑鼠左鍵還原到先前的精靈（若無暫存則回到 stance）
function mouseReleased() {
  if (mouseButton === LEFT) {
    const restore = prevKey || 'stance';
    // 若玩家同時按方向鍵則優先回到 walk
    if (keyIsDown(LEFT_ARROW) || keyIsDown(RIGHT_ARROW) || keyIsDown(UP_ARROW) || keyIsDown(DOWN_ARROW)) {
      currentKey = 'walk';
    } else {
      currentKey = restore;
    }
    currentFrame = 0;
    updateFrameSize();
    lastChange = millis();
    prevKey = null;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
