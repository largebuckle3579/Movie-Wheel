const movieForm = document.getElementById("movie-form");
const movieInput = document.getElementById("movie-input");
const movieList = document.getElementById("movie-list");
const spinBtn = document.getElementById("spin-btn");
const resetBtn = document.getElementById("reset-btn");
const resultText = document.getElementById("result");
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const wheelCap = document.getElementById("wheel-cap");
const pickReveal = document.getElementById("pick-reveal");
const pickImg = document.getElementById("pick-img");
const pickMovie = document.getElementById("pick-movie");

const REWARD_IMAGES = [
  "images/rewards/nailong-1.png",
  "images/rewards/nailong-2.png",
  "images/rewards/nailong-3.png",
  "images/rewards/nailong-4.png",
  "images/rewards/nailong-5.png",
  "images/rewards/nailong-6.png",
];

const colors = [
  "#FFD200",
  "#FFE566",
  "#FFF9E3",
  "#FF8FAB",
  "#A5D6A7",
  "#81D4FA",
  "#E1BEE7",
  "#FFCC80",
];

const movies = [];
let rotation = 0;
let isSpinning = false;

function setWheelCapVisible(visible) {
  wheelCap.classList.toggle("is-hidden", !visible);
}

function hidePick() {
  pickReveal.classList.add("hidden");
  pickImg.removeAttribute("src");
  pickImg.alt = "";
  pickMovie.textContent = "";
  resultText.classList.remove("result--hidden");
}

function showPick(winner) {
  const src = REWARD_IMAGES[Math.floor(Math.random() * REWARD_IMAGES.length)];
  pickImg.src = src;
  pickImg.alt = "";
  pickMovie.textContent = winner;
  pickReveal.classList.remove("hidden");
  resultText.textContent = "";
  resultText.classList.add("result--hidden");
}

function drawWheel() {
  const size = canvas.width;
  const center = size / 2;
  const radius = center - 14;

  ctx.clearRect(0, 0, size, size);

  if (movies.length === 0) {
    setWheelCapVisible(false);
    ctx.fillStyle = "#FFF9E3";
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFD200";
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.fillStyle = "#5D4037";
    ctx.font = "600 22px Nunito, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No movies yet", center, center + 6);
    return;
  }

  setWheelCapVisible(true);

  const anglePerSlice = (Math.PI * 2) / movies.length;

  movies.forEach((movie, index) => {
    const startAngle = index * anglePerSlice + rotation;
    const endAngle = startAngle + anglePerSlice;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(startAngle + anglePerSlice / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#3E2723";
    ctx.font = "bold 16px Nunito, system-ui, sans-serif";
    const trimmed = movie.length > 22 ? `${movie.slice(0, 19)}…` : movie;
    ctx.fillText(trimmed, radius - 18, 6);
    ctx.restore();
  });
}

function renderMovieList() {
  movieList.innerHTML = "";

  movies.forEach((movie, index) => {
    const li = document.createElement("li");
    li.textContent = movie;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.className = "remove-btn";
    removeBtn.addEventListener("click", () => {
      if (isSpinning) return;
      movies.splice(index, 1);
      resultText.textContent =
        movies.length >= 2 ? "Ready to spin!" : "Add at least 2 movies to spin.";
      hidePick();
      drawWheel();
      renderMovieList();
    });

    li.appendChild(removeBtn);
    movieList.appendChild(li);
  });
}

function addMovie(title) {
  const cleanTitle = title.trim();
  if (!cleanTitle) return;
  if (movies.includes(cleanTitle)) {
    resultText.classList.remove("result--hidden");
    resultText.textContent = "That movie is already on the wheel.";
    return;
  }

  movies.push(cleanTitle);
  resultText.classList.remove("result--hidden");
  resultText.textContent =
    movies.length >= 2 ? "Ready to spin!" : "Add at least 2 movies to spin.";
  hidePick();
  drawWheel();
  renderMovieList();
}

function pickWinner() {
  const anglePerSlice = (Math.PI * 2) / movies.length;
  let normalized = (Math.PI * 1.5 - rotation) % (Math.PI * 2);
  if (normalized < 0) normalized += Math.PI * 2;
  const winnerIndex = Math.floor(normalized / anglePerSlice) % movies.length;
  return movies[winnerIndex];
}

function spinWheel() {
  if (isSpinning || movies.length < 2) {
    if (movies.length < 2) {
      resultText.classList.remove("result--hidden");
      resultText.textContent = "Add at least 2 movies to spin.";
    }
    return;
  }

  isSpinning = true;
  spinBtn.disabled = true;
  hidePick();
  resultText.classList.remove("result--hidden");
  resultText.textContent = "Spinning…";

  const extraRotation = Math.PI * (10 + Math.random() * 8);
  const startRotation = rotation;
  const endRotation = rotation + extraRotation;
  const duration = 3600;
  const startTime = performance.now();

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    rotation = startRotation + (endRotation - startRotation) * eased;
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      rotation %= Math.PI * 2;
      drawWheel();
      const winner = pickWinner();
      showPick(winner);
      isSpinning = false;
      spinBtn.disabled = false;
    }
  }

  requestAnimationFrame(animate);
}

movieForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addMovie(movieInput.value);
  movieInput.value = "";
  movieInput.focus();
});

spinBtn.addEventListener("click", spinWheel);

resetBtn.addEventListener("click", () => {
  if (isSpinning) return;
  movies.length = 0;
  rotation = 0;
  resultText.classList.remove("result--hidden");
  resultText.textContent = "Add at least 2 movies to spin.";
  hidePick();
  drawWheel();
  renderMovieList();
});

drawWheel();
