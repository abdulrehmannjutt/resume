const slides = document.querySelectorAll(".carousel-slide");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

let currentIndex = 0;

function showSlides(index) {
  slides.forEach((slide) => {
    slide.classList.remove("active");
    slide.style.display = "none";
  });

  slides[index].style.display = "block";
  slides[index].classList.add("active");

  if (index + 1 < slides.length) {
    slides[index + 1].style.display = "block";
    slides[index + 1].classList.add("active");
  }

  if (currentIndex === 0) {
    prevBtn.disabled = true;
    prevBtn.style.cursor = "default";
  } else {
    prevBtn.disabled = false;
    prevBtn.style.cursor = "pointer";
  }

  if (currentIndex + 2 >= slides.length) {
    nextBtn.disabled = true;
    nextBtn.style.cursor = "default";
  } else {
    nextBtn.disabled = false;
    nextBtn.style.cursor = "pointer";
  }
}

prevBtn.addEventListener("click", function () {
  if (currentIndex > 1) {
    currentIndex -= 2;
  }
  showSlides(currentIndex);
});

nextBtn.addEventListener("click", function () {
  if (currentIndex < slides.length - 2) {
    currentIndex += 2;
  }
  showSlides(currentIndex);
});

showSlides(currentIndex);
