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
        case 'a':
            lastRecognizedCharacter = 'あ';
            break;
        case 'i':
            lastRecognizedCharacter = 'い';
            break;
        case 'u':
            lastRecognizedCharacter = 'う';
            break;
        case 'e':
            lastRecognizedCharacter = 'え';
            break;
        case 'o':
            lastRecognizedCharacter = 'お';
            break;
        case 'ka':
            lastRecognizedCharacter = 'か';
            break;
        case 'ki':
            lastRecognizedCharacter = 'き';
            break;
        case 'ku':
            lastRecognizedCharacter = 'く';
            break;
        case 'ke':
            lastRecognizedCharacter = 'け';
            break;
        case 'ko':
            lastRecognizedCharacter = 'こ';
            break;
        case 'sa':
            lastRecognizedCharacter = 'さ';
            break;
        case 'shi':
            lastRecognizedCharacter = 'し';
            break;
        case 'su':
            lastRecognizedCharacter = 'す';
            break;
        case 'se':
            lastRecognizedCharacter = 'せ';
            break;
        case 'so':
            lastRecognizedCharacter = 'そ';
            break;
        case 'ta':
            lastRecognizedCharacter = 'た';
            break;
        case 'chi':
            lastRecognizedCharacter = 'ち';
            break;
        case 'tsu':
            lastRecognizedCharacter = 'つ';
            break;
        case 'te':
            lastRecognizedCharacter = 'て';
            break;
        case 'to':
            lastRecognizedCharacter = 'と';
            break;
        case 'na':
            lastRecognizedCharacter = 'な';
            break;
        case 'ni':
            lastRecognizedCharacter = 'に';
            break;
        case 'nu':
            lastRecognizedCharacter = 'ぬ';
            break;
        case 'ne':
            lastRecognizedCharacter = 'ね';
            break;
        case 'no':
            lastRecognizedCharacter = 'の';
            break;
        case 'ha':
            lastRecognizedCharacter = 'は';
            break;
        case 'hi':
            lastRecognizedCharacter = 'ひ';
            break;
        case 'fu':
            lastRecognizedCharacter = 'ふ';
            break;
        case 'he':
            lastRecognizedCharacter = 'へ';
            break;
        case 'ho':
            lastRecognizedCharacter = 'ほ';
            break;
        case 'ma':
            lastRecognizedCharacter = 'ま';
            break;
        case 'mi':
            lastRecognizedCharacter = 'み';
            break;
        case 'mu':
            lastRecognizedCharacter = 'む';
            break;
        case 'me':
            lastRecognizedCharacter = 'め';
            break;
        case 'mo':
            lastRecognizedCharacter = 'も';
            break;
        case 'ya':
            lastRecognizedCharacter = 'や';
            break;
        case 'yu':
            lastRecognizedCharacter = 'ゆ';
            break;
        case 'yo':
            lastRecognizedCharacter = 'よ';
            break;
        case 'ra':
            lastRecognizedCharacter = 'ら';
            break;
        case 'ri':
            lastRecognizedCharacter = 'り';
            break;
        case 'ru':
            lastRecognizedCharacter = 'る';
            break;
        case 're':
            lastRecognizedCharacter = 'れ';
            break;
        case 'ro':
            lastRecognizedCharacter = 'ろ';
            break;
        case 'wa':
            lastRecognizedCharacter = 'わ';
            break;
        case 'wo':
            lastRecognizedCharacter = 'を';
            break;
        case 'n':
            lastRecognizedCharacter = 'ん';
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

document.getElementById("searchGoogle").addEventListener("click", function() {
    const query = document.getElementById("textArea").value; // textareaのID
    const googleSearchURL = "https://www.google.com/search?q=" + encodeURIComponent(query);

    window.open(googleSearchURL, "_blank"); // 新しいタブでGoogle検索を開く
});
