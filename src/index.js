let currentStep = 1;
const totalSteps = 5;
const quizData = {};
let isSubmitting = false;

function checkStep1() {
  const country = document.getElementById("userCountry").value.trim();
  document.getElementById("btn1").disabled = !country;
}

function checkStep2() {
  const selectedRegion = document.querySelector(
    '.quiz-step[data-step="2"] .quiz-option.selected',
  );
  document.getElementById("btn2").disabled = !selectedRegion;
}

function selectOption(element, step) {
  const stepEl = document.querySelector(`.quiz-step[data-step="${step}"]`);
  stepEl
    .querySelectorAll(".quiz-option")
    .forEach((opt) => opt.classList.remove("selected"));
  element.classList.add("selected");
  quizData["step" + step] = element.dataset.value;

  if (step === 2) {
    checkStep2();
  } else if (step === 3) {
    document.getElementById("btn3").disabled = false;
  } else if (step === 4) {
    document.getElementById("btn4").disabled = false;
  }
}

function formatPhone(input) {
  let value = input.value.replace(/\D/g, "");
  if (value.startsWith("7") || value.startsWith("8"))
    value = value.substring(1);
  let formatted = "+7";
  if (value.length > 0) formatted += " (" + value.substring(0, 3);
  if (value.length >= 3) formatted += ") " + value.substring(3, 6);
  if (value.length >= 6) formatted += "-" + value.substring(6, 8);
  if (value.length >= 8) formatted += "-" + value.substring(8, 10);
  input.value = formatted;
}

function checkForm() {
  const nameInput = document.getElementById("userName");
  const phoneInput = document.getElementById("userPhone");
  const name = nameInput.value.trim();
  const phone = phoneInput.value.replace(/\D/g, "");
  document.getElementById("btn5").disabled = !(name && phone.length >= 11);
  
  // Убираем ошибку при заполнении
  if (name) {
    nameInput.classList.remove("quiz-input--error");
  }
  if (phone.length >= 11) {
    phoneInput.classList.remove("quiz-input--error");
  }
}

function updateProgress() {
  const progress = (currentStep / totalSteps) * 100;
  document.getElementById("progressBar").style.width = progress + "%";
}

function nextStep() {
  if (currentStep === 2) {
    const region = quizData["step2"];
    if (region === "Другой регион") {
      showErrorStep("error-step-location");
      return;
    }
  }

  if (currentStep === 4) {
    const service = quizData["step4"];
    if (service === "Временная регистрация") {
      showErrorStep("error-step-registration");
      return;
    }
  }

  if (currentStep < totalSteps) {
    document
      .querySelector(`.quiz-step[data-step="${currentStep}"]`)
      .classList.remove("active");
    currentStep++;
    document
      .querySelector(`.quiz-step[data-step="${currentStep}"]`)
      .classList.add("active");
    updateProgress();
  }
}

function showErrorStep(stepName) {
  document
    .querySelector(`.quiz-step[data-step="${currentStep}"]`)
    .classList.remove("active");
  document
    .querySelector(`.quiz-step[data-step="${stepName}"]`)
    .classList.add("active");
  document.getElementById("progressBar").style.width = "100%";
}

function restartQuiz() {
  document
    .querySelectorAll(".quiz-step")
    .forEach((step) => step.classList.remove("active"));

  currentStep = 1;
  Object.keys(quizData).forEach((key) => delete quizData[key]);

  document
    .querySelectorAll(".quiz-option.selected")
    .forEach((opt) => opt.classList.remove("selected"));

  document.getElementById("userCountry").value = "";
  document.getElementById("userName").value = "";
  document.getElementById("userPhone").value = "";

  document.getElementById("btn1").disabled = true;
  document.getElementById("btn2").disabled = true;
  document.getElementById("btn3").disabled = true;
  document.getElementById("btn4").disabled = true;
  document.getElementById("btn5").disabled = true;

  document.querySelector('.quiz-step[data-step="1"]').classList.add("active");
  updateProgress();
}

function resetStepFields(step) {
  // Сбрасываем выбор при переходе назад
  const stepEl = document.querySelector(`.quiz-step[data-step="${step}"]`);
  if (stepEl) {
    stepEl
      .querySelectorAll(".quiz-option.selected")
      .forEach((opt) => opt.classList.remove("selected"));
  }
  delete quizData["step" + step];

  // Сбрасываем кнопки
  if (step === 1) {
    document.getElementById("userCountry").value = "";
    document.getElementById("btn1").disabled = true;
  } else if (step === 2) {
    document.getElementById("btn2").disabled = true;
  } else if (step === 3) {
    document.getElementById("btn3").disabled = true;
  } else if (step === 4) {
    document.getElementById("btn4").disabled = true;
  }
}

function prevStep() {
  if (currentStep > 1) {
    document
      .querySelector(`.quiz-step[data-step="${currentStep}"]`)
      .classList.remove("active");
    currentStep--;
    document
      .querySelector(`.quiz-step[data-step="${currentStep}"]`)
      .classList.add("active");
    
    // Сбрасываем поля текущего шага (на который вернулись)
    resetStepFields(currentStep);
    
    // Также сбрасываем поля формы на шаге 5 если вернулись назад
    if (currentStep < 5) {
      document.getElementById("userName").value = "";
      document.getElementById("userPhone").value = "";
      document.getElementById("btn5").disabled = true;
    }
    
    updateProgress();
  }
}

function scrollToQuiz() {
  document.getElementById("quiz").scrollIntoView({ behavior: "smooth" });
}

async function submitQuiz() {
  // Защита: если кнопка отключена - выходим
  const btn5 = document.getElementById("btn5");
  if (btn5.disabled) return;
  
  // Защита от повторной отправки
  if (isSubmitting) return;
  
  const nameInput = document.getElementById("userName");
  const phoneInput = document.getElementById("userPhone");
  const name = nameInput.value.trim();
  const phone = phoneInput.value.replace(/\D/g, "");
  
  // Дополнительная проверка валидности
  if (!name || phone.length < 11) {
    return;
  }
  
  isSubmitting = true;
  btn5.disabled = true;
  btn5.textContent = "Отправка...";
  
  quizData.name = name;
  quizData.phone = phoneInput.value;
  quizData.country = document.getElementById("userCountry").value;

  const success = await sendToTelegram(quizData);
  
  isSubmitting = false;

  if (!success) {
    btn5.disabled = false;
    btn5.textContent = "Получить консультацию";
    alert(
      "Ошибка отправки! Пожалуйста, позвоните нам по телефону 8 (800) 123-45-67",
    );
    return;
  }

  document
    .querySelector(`.quiz-step[data-step="${currentStep}"]`)
    .classList.remove("active");
  document
    .querySelector('.quiz-step[data-step="final-step"]')
    .classList.add("active");
  document.getElementById("progressBar").style.width = "100%";

  if (typeof gtag !== "undefined") {
    gtag("event", "conversion", { send_to: "YOUR_CONVERSION_ID" });
  }
}

async function sendToTelegram(data) {
  const BOT_TOKEN = "YOUR_BOT_TOKEN";
  const CHAT_ID = "YOUR_CHAT_ID";
  const message = `🆕 <b>Новая заявка с сайта!</b>\n\n👤 <b>Имя:</b> ${data.name}\n📞 <b>Телефон:</b> ${data.phone}\n🌍 <b>Гражданство:</b> ${data.step1 || "-"}\n📍 <b>Регион:</b> ${data.step2 || "-"}\n👨‍👩‍👧 <b>Родственники:</b> ${data.step3 || "-"}\n📄 <b>Услуга:</b> ${data.step4 || "-"}\n\n⏱ Перезвонить в течение 30 минут!`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      },
    );

    const result = await response.json();

    if (!result.ok) {
      console.error("Telegram API error:", result);
      throw new Error(result.description || "Failed to send message");
    }

    return true;
  } catch (e) {
    console.error("Telegram error:", e);
    return false;
  }
}

window.addEventListener("scroll", () => {
  const floatingCta = document.getElementById("floatingCta");
  if (floatingCta) {
    if (window.scrollY > 500) {
      floatingCta.classList.add("visible");
    } else {
      floatingCta.classList.remove("visible");
    }
  }
});
