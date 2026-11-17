let characterSprite, walkSprite, magicSprite, magicEffectSprite, bgImage;
let characterX; // 角色在遊戲世界中的位置
let cameraX = 0; // 鏡頭水平位移
let worldWidth = 0; // 背景在畫面上的實際寬度
let bgScale = 1; // 背景縮放比例
let isWalking = false;
let facingDirection = 1;
let isCasting = false;
let magicStartFrame = 0;
let magicDirection = 1;
let spaceIsDown = false;
let activeEffects = [];
const frameCountInSprite = 10;
const frameWidth = 1395 / 10;
const frameHeight = 196;
const walkFrameCount = 9;
const walkFrameWidth = 1246 / walkFrameCount;
const walkFrameHeight = 198;
const magicFrameCount = 10; // 依照這次上傳的十張施法影格
const magicFrameWidth = 140;
const magicFrameHeight = 198;
const effectFrameCount = 5;
const effectFrameWidth = 740 / effectFrameCount;
const effectFrameHeight = 19;
const framesPerStep = 8;

function preload() {
  bgImage = loadImage("background.jpg");
  characterSprite = loadImage("1/stop/stop.png");
  walkSprite = loadImage("1/walk/walk.png");
  magicSprite = loadImage("1/magic/magic.png");
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png");
}
function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  updateWorldSize();
  characterX = worldWidth / 2;
  frameRate(60);
}
function draw() {
  // 鏡頭跟隨角色；在背景兩端停止捲動，不露出空白。
  cameraX = constrain(characterX - width / 2, 0, worldWidth - width);
  imageMode(CORNER);
  image(bgImage, -cameraX, (height - bgImage.height * bgScale) / 2,
    worldWidth, bgImage.height * bgScale);
  imageMode(CENTER);

  const movingRight = keyIsDown(RIGHT_ARROW);
  const movingLeft = keyIsDown(LEFT_ARROW);
  isWalking = movingRight || movingLeft;
  const movementStep = constrain(width * 0.004, 2, 8);
  if (movingRight) {
    facingDirection = 1;
    characterX += movementStep;
  } else if (movingLeft) {
    facingDirection = -1;
    characterX -= movementStep;
  }
  const characterScale = min((height * 0.65) / frameHeight, ((width * 2) / 3) / frameWidth);
  const characterWidth = frameWidth * characterScale;
  const characterHeight = frameHeight * characterScale;
  characterX = constrain(characterX, characterWidth / 2, worldWidth - characterWidth / 2);
  cameraX = constrain(characterX - width / 2, 0, worldWidth - width);
  if (isCasting && frameCount - magicStartFrame >= magicFrameCount * framesPerStep) {
    isCasting = false;
    activeEffects.push({
      x: characterX + magicDirection * characterWidth / 2,
      y: height - characterHeight * 0.58,
      direction: magicDirection
    });
  }
  const activeSprite = isCasting ? magicSprite : isWalking ? walkSprite : characterSprite;
  const activeFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : frameCountInSprite;
  const activeFrameWidth = isCasting ? magicFrameWidth : isWalking ? walkFrameWidth : frameWidth;
  const activeFrameHeight = isCasting ? magicFrameHeight : isWalking ? walkFrameHeight : frameHeight;
  const elapsedMagicFrames = frameCount - magicStartFrame;
  const frameIndex = isCasting
    ? min(magicFrameCount - 1, floor(elapsedMagicFrames / framesPerStep))
    : floor(frameCount / framesPerStep) % activeFrameCount;
  const sourceX = frameIndex * activeFrameWidth;
  const activeWidth = activeFrameWidth * characterScale;
  const activeHeight = activeFrameHeight * characterScale;
  const characterY = height - activeHeight / 2;
  push();
  translate(characterX - cameraX, characterY);
  scale(isCasting ? magicDirection : facingDirection, 1);
  image(activeSprite, 0, 0, activeWidth, activeHeight,
    sourceX, 0, activeFrameWidth, activeFrameHeight);
  pop();

  const effectScale = characterScale;
  const effectWidth = effectFrameWidth * effectScale;
  const effectHeight = effectFrameHeight * effectScale;
  const effectSpeed = max(6, width * 0.008);
  for (let effectIndex = activeEffects.length - 1; effectIndex >= 0; effectIndex--) {
    const effect = activeEffects[effectIndex];
    effect.x += effect.direction * effectSpeed;
    if (effect.x > worldWidth || effect.x < 0) {
      activeEffects.splice(effectIndex, 1);
      continue;
    }
    const effectFrameIndex = floor(frameCount / framesPerStep) % effectFrameCount;
    push();
    translate(effect.x - cameraX, effect.y);
    scale(effect.direction, 1);
    image(magicEffectSprite, 0, 0, effectWidth, effectHeight,
      effectFrameIndex * effectFrameWidth, 0, effectFrameWidth, effectFrameHeight);
    pop();
  }
}
function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    isWalking = true;
    facingDirection = 1;
    return false;
  }
  if (keyCode === LEFT_ARROW) {
    isWalking = true;
    facingDirection = -1;
    return false;
  }
  if (keyCode === 32) {
    if (!spaceIsDown && !isCasting) {
      isCasting = true;
      magicStartFrame = frameCount;
      magicDirection = facingDirection;
    }
    spaceIsDown = true;
    return false;
  }
}
function keyReleased() {
  if (keyCode === 32) spaceIsDown = false;
}
function updateWorldSize() {
  // 放大原圖以提供左右捲動空間，並保持圖片比例。
  bgScale = max((width * 2.2) / bgImage.width, height / bgImage.height);
  worldWidth = bgImage.width * bgScale;
}
function windowResized() {
  const relativePosition = worldWidth > 0 ? characterX / worldWidth : 0.5;
  resizeCanvas(windowWidth, windowHeight);
  updateWorldSize();
  characterX = relativePosition * worldWidth;
  cameraX = constrain(characterX - width / 2, 0, worldWidth - width);
}
