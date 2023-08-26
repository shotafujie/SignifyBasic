const video = document.getElementById('input');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');
const resultElement = document.getElementById('result');
const textArea = document.getElementById('textArea');
let lastRecognizedCharacter = '';

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 1280,
  height: 720
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

let model;
tf.loadLayersModel("./model.json").then(loadedModel => {
  model = loadedModel;
});

hands.onResults(async results => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (results.multiHandLandmarks) {
    for (let landmarks of results.multiHandLandmarks) {
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
      drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1 });
      ctx.font = '16px serif';
      landmarks.forEach((e, i) => {
        ctx.fillText(i, e.x * canvas.width, e.y * canvas.height);
      });

      let landmarksArray = [];
      landmarks.forEach((e, i) => {
        landmarksArray.push(e.x, e.y);
      });

      const inputData = tf.tensor2d([landmarksArray]);
      const prediction = model.predict(inputData);
      const classId = prediction.argMax(-1).dataSync()[0];
      switch (classId) {
        case 0:
          lastRecognizedCharacter = 'お';
          break;
        case 1:
          lastRecognizedCharacter = 'は';
          break;
        case 2:
          lastRecognizedCharacter = 'よ';
          break;
        case 3:
          lastRecognizedCharacter = 'う';
          break;
        default:
          lastRecognizedCharacter = 'unknown';
      }
      resultElement.textContent = `Classification Result: ${lastRecognizedCharacter}`;
    }
  }
});

document.getElementById('start').addEventListener('click', () => camera.start());
document.getElementById('stop').addEventListener('click', () => camera.stop());

camera.start();

document.addEventListener('keydown', (event) => {
  if (event.key === "Enter") {
    textArea.value += lastRecognizedCharacter;
  }
});

