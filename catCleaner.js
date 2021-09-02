'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imgNames = ['cat', 'dust', 'chair', 'plant'];

/* 画面上下分割用の設定 */
const y_level_num_max = 4;    // 画面の上下分割数
const par_high = canvas.height/(y_level_num_max);
const y_level = [canvas.height, canvas.height-par_high*1, canvas.height-par_high*2, canvas.height-par_high*3];

const body = document.getElementById('body');

/* グローバルなゲームオブジェクト */
const game = {
  counter: 0,
  items: [],          //画面に表示されているアイテム
  img: {},            //使用する画像の情報
  isGameOver: true,   //ゲームのプレイ状態
  score: 0,
  timer: null
};


/* 画像読み込み ------------------------------------------------------------------------------------*/
console.log('画像のロードを開始します');
let imgLoadCounter = 0;
for(const imgName of imgNames){
  const imagePath = `img/${imgName}.png`;
  game.img[imgName] = new Image();
  game.img[imgName].src = imagePath;
  game.img[imgName].onload = () => {
    imgLoadCounter++;                           //１つ画像が読み込み終わったら１カウントアップ
    if(imgLoadCounter === imgNames.length){     //全ての画像が読み込み終わったら実行
      console.log('画像のロードが完了しました');
 
      // スタート画面の作成
      ctx.fillStyle = 'lavenderblush';
      ctx.fillRect(0, 0, canvas.width, canvas.height); 
      ctx.fillStyle = 'black';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(`Enter を押して掃除スタート！`, 30, 200);
      ctx.drawImage(game.img.cat, canvas.width/3, canvas.height*2/3);
      ctx.drawImage(game.img.dust, canvas.width*2/3, canvas.height*2/3+game.img.dust.height);
    }
  }
}


/* ゲームパラメータの初期化 ------------------------------------------------------------------------------------*/
function init(){
  body.style.overflow = 'hidden';   // ゲーム中は画面スクロール停止

  game.counter = 0;
  game.items = [];
  game.isGameOver = false;
  game.score = 0;

  // プレイヤーキャラ(ねこ画像)読み出し
  createCat();

  // ゲームタイマーカウント開始
  game.timer = setInterval(ticker, 30);   //30msごとにticker関数を読み出す
}


/* 定期処理 ------------------------------------------------------------------------------------------------*/
function ticker(){
  // 画面クリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 背景の設定
  ctx.fillStyle = 'lavenderblush';
  ctx.fillRect(0, 0, canvas.width, canvas.height);  

  // 画面上のアイテム作成
  // 得点用アイテム(ちり紙)の作成
  if(Math.floor(Math.random() * 50) === 0){
    console.log('ゴミが現れた！');
    createDust();
  }
  // 敵アイテム(椅子)の作成
  if(Math.floor(Math.random() * (100-game.counter/100)) === 0){
    console.log('椅子が現れた！');
    createChair();
  }
  // 敵アイテム(植物)の作成
  if(Math.floor(Math.random() * (100-game.counter/100)) === 0){
    console.log('植木が現れた!');
    createPlant();
  }

  // 移動処理
  moveCat();
  moveItems();

  // 描画処理
  drawCat();
  drawItem();
  drawScore();

  // 当たり判定
  hitCheck();

  // カウンタ(経過時間)処理
  game.counter = (game.counter + 1) % 1000000;
}


/* オブジェクト作成 --------------------------------------------------------------------------------------------*/
// プレイヤーキャラ(猫)
function createCat(){
  game.cat = {
    y_level_num: 0,
    x: 50, 
    y: y_level[0]-game.img.cat.height,
    width: game.img.cat.width,
    height: game.img.cat.height,
    img: game.img.cat
  }
}

// 得点用アイテム(ちり紙) 
function createDust(){
  const y_level_num = Math.floor(Math.random() * (y_level_num_max));
  game.items.push({
    x: canvas.width-game.img.dust.width/2,
    y: y_level[y_level_num]-game.img.dust.height,
    width: game.img.dust.width,
    height: game.img.dust.height,
    moveX: -10,
    dust: true,
    img: game.img.dust
  });
}

// 敵アイテム(椅子)
function createChair(){
  const y_level_num = Math.floor(Math.random() * (y_level_num_max));
  game.items.push({
    x: canvas.width-game.img.chair.width/2,
    y: y_level[y_level_num]-game.img.chair.height,
    width: game.img.chair.width,
    height: game.img.chair.height,
    moveX: -10,
    dust: false,
    img: game.img.chair
  });
}

// 敵アイテム(植物)
function createPlant(){
  const y_level_num = Math.floor(Math.random() * (y_level_num_max));
  game.items.push({
    x: canvas.width-game.img.plant.width/2,
    y: y_level[y_level_num]-game.img.plant.height,
    width: game.img.plant.width,
    height: game.img.plant.height,
    moveX: -10,
    dust: false,
    img: game.img.plant
  });
}


/* オブジェクト移動 ----------------------------------------------------------------------------------------------*/
function moveCat(){
  game.cat.y = y_level[game.cat.y_level_num]-game.cat.height;
}

function moveItems(){
  for(const item of game.items){
    item.x += item.moveX;
  }
  // 画面の外に出たアイテムを配列から削除
  game.items = game.items.filter(item => item.x > - item.width);
}


/* オブジェクトの描画 --------------------------------------------------------------------------------------------*/
function drawCat(){
  ctx.drawImage(game.img.cat, game.cat.x, game.cat.y);
}

function drawItem(){
  for(const item of game.items){
    ctx.drawImage(item.img, item.x, item.y);
  }
}

function drawScore(){
  ctx.fillStyle = 'black';
  ctx.font = '24px sans-serif';
  ctx.fillText(`上下キーで移動`, 0, 30);
  ctx.fillText(`time: ${game.counter}　　score: ${game.score}`, canvas.width - 350, 30);
}


/* 接触確認処理 -------------------------------------------------------------------------------------------------*/
function hitCheck() {
  for (const item of game.items) {
    if (Math.abs(game.cat.x - item.x) < (game.cat.width*0.7) &&
      Math.abs(game.cat.y - item.y) < (game.cat.height/2)) {
      if(item.dust === true){
        game.score++;
        item.x = -item.width;
      }
      else{
        body.style.overflow = 'auto';      // ゲーム終了後は画面スクロール許可
        game.isGameOver = true;
        ctx.fillStyle = 'black';
        ctx.font = 'bold 100px sans-serif';
        ctx.fillText(`Game Over!`, 60, 200);
        ctx.font = 'bold 30px sans-serif';
        ctx.fillText(`Enter を押してもう一度チャレンジ`, 150, 300);
        clearInterval(game.timer);
      }
    }
  }
}


/* キー操作時の処理 -------------------------------------------------------------------------------------------*/
document.onkeydown = function(e){
  if(game.isGameOver === true){   // ゲームオーバー時
    // ゲームのスタート
    if (e.key === 'Enter') {
      init();
    }
  }
  else {    // ゲーム中
    // 猫の操作
    if (e.key === 'ArrowUp' && game.cat.y_level_num < y_level_num_max-1) {
      game.cat.y_level_num++;
      console.log('上キーが押されました : y_level_num = ' + game.cat.y_level_num);　//デバッグ用
      game.cat.y = y_level[game.cat.y_level_num] - game.img.cat.height;
    }
    else if (e.key === 'ArrowDown' && game.cat.y_level_num > 0) {
      game.cat.y_level_num--;
      console.log('下キーが押されました : y_level_num = ' + game.cat.y_level_num);　//デバッグ用
      game.cat.y = y_level[game.cat.y_level_num] - game.img.cat.height;
    }
  }
}