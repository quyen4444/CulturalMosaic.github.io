
// Arrays for images, texts, and audio files
const images = [
  "photos/BenThanhmarket.png",
  "images/image2.png",
  "images/image2.png",
  "images/image2.png",
  "images/image2.png",
  "images/image6.jpg",
  "images/image7.jpg",
  "images/image8.jpg",
  "images/image9.jpg",
  "images/image10.jpg"
];

const texts = [
  "Welcome to Ben Thanh market! Let's learn some new words which are useful when you go to the market!",
  "Hello",
  "Văn bản 3",
  "Văn bản 4",
  "Văn bản 5",
  "Văn bản 6",
  "Văn bản 7",
  "Văn bản 8",
  "Văn bản 9",
  "Văn bản 10"
];

const audios = [
  "audio/page3_audio_1.mp3",
  "audio/page3_audio_2.mp3",
  "audio/page3_audio_3.mp3",
  "audio/page3_audio_4.mp3",
  "audio/page3_audio_5.mp3",
  "audio/page3_audio_6.mp3",
  "audio/page3_audio_7.mp3",
  "audio/page3_audio_8.mp3",
  "audio/page3_audio_9.mp3",
  "audio/page3_audio_10.mp3"
];

let currentIndex = 0;

function next() {
  currentIndex = (currentIndex + 1) % images.length;
  updateContent();
}

function updateContent() {
  document.getElementById("image").src = images[currentIndex];
  document.getElementById("text").textContent = texts[currentIndex];
  const audio = document.getElementById("audio");
  audio.src = audios[currentIndex];
  audio.load(); 
  audio.play(); 

}