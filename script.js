// 変数の定義
const video = document.getElementById('input');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');
const resultElement = document.getElementById('result');

// 手形状認識関連ライブラリの読み込み
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

// PCカメラのビデオストリームを取得
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({image: video});
  },
  width: 1280,
  height: 720
});

// 手形状認識のオプションの設定
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

// 学習モデルの読み込み
let model;
tf.loadLayersModel("./model.json").then(loadedModel => {
  model = loadedModel;
});

// 認識結果の取得と描画
hands.onResults(async results => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (results.multiHandLandmarks) {
    for (let landmarks of results.multiHandLandmarks) {
      // 緑色の線でスケルトンを可視化
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5});

      // 赤色でLandmarksを可視化
      drawLandmarks(ctx, landmarks, {color: '#FF0000', lineWidth: 1});

      // Landmarksのインデックスを描画
      ctx.font = '16px serif';
      landmarks.forEach((e, i) => {
        ctx.fillText(i, e.x * canvas.width, e.y * canvas.height);
      });

      // landmarksの座標を識別用の配列に変換
      let landmarksArray = [];
      landmarks.forEach((e, i) => {
        landmarksArray.push(e.x, e.y);  // Z座標は含まない
      });

      // tenserflow用の入力データに変換
      const inputData = tf.tensor2d([landmarksArray]);

      // 識別の実行と結果の表示
      const prediction = model.predict(inputData);
      const classId = prediction.argMax(-1).dataSync()[0];
      let japaneseCharacter = '';
      switch (classId) {
        case 0:
          japaneseCharacter = 'お';
          break;
        case 1:
          japaneseCharacter = 'は';
          break;
        case 2:
          japaneseCharacter = 'よ';
          break;
        case 3:
          japaneseCharacter = 'う';
          break;
        default:
          japaneseCharacter = 'unknown';
      }
      resultElement.textContent = `Classification Result: ${japaneseCharacter}`;

    }
  }
});

// カメラデータ取得開始
document.getElementById('start')
  .addEventListener('click', () => camera.start());
// カメラデータ取得停止
document.getElementById('stop')
  .addEventListener('click', () => camera.stop());

// カメラ自動スタート
camera.start();

// 1秒ごとに認識するため、1秒毎に`recognizing`を`true`にする
setInterval(() => {recognizing = true;}, 1000);

