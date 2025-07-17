const backendURL = 'http://localhost:3000';
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

const popupOverlay = document.getElementById('popup-overlay');
const popup = document.getElementById('popup');
const popupIcon = document.getElementById('popup-icon');
const popupTitle = document.getElementById('popup-title');
const popupDescription = document.getElementById('popup-description');

const signInForm = document.querySelector("#sign-in-form");
const signUpForm = document.querySelector("#sign-up-form");

// Cambiar entre login y registro
sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});
sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

// Mostrar popup con ícono, título y descripción
function showPopup(type, title, description = '') {
  popupIcon.textContent = type === 'success' ? '✔️' : '❌';
  popupIcon.className = 'popup-icon ' + (type === 'success' ? 'popup-success' : 'popup-error');

  popupTitle.textContent = title;
  popupDescription.textContent = description;

  popupOverlay.classList.remove('hidden');
}

// Cerrar popup haciendo click en cualquier parte del overlay
popupOverlay.addEventListener('click', () => {
  popupOverlay.classList.add('hidden');
});

// Registro
signUpForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = signUpForm.username.value.trim();
  const email = signUpForm.email.value.trim();
  const password = signUpForm.password.value.trim();

  try {
    const res = await fetch(`${backendURL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (data.success) {
      showPopup('success', '¡Registro exitoso!', data.message);
      signUpForm.reset();
      container.classList.remove("sign-up-mode");
    } else {
      showPopup('error', 'Error de registro', data.message);
    }

  } catch (error) {
    console.error(error);
    showPopup('error', 'Error de conexión', 'No se pudo conectar con el servidor.');
  }
});

// Login
signInForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = signInForm.username.value.trim();
  const password = signInForm.password.value.trim();

  try {
    const res = await fetch(`${backendURL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success) {
      showPopup('success', '¡Inicio exitoso!', data.message);
      setTimeout(() => {
        window.location.href = 'perfil.html';
      }, 2000); // espera 2 segundos
    } else {
      showPopup('error', 'Error de inicio', data.message);
    }

  } catch (error) {
    console.error(error);
    showPopup('error', 'Error de conexión', 'No se pudo conectar con el servidor.');
  }
});
