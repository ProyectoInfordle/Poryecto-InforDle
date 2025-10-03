const phrases = [
    " Aprender",
    " Entender",
    " Descubrir",
];


function typePhrase(spanElement, phrase, index = 0, callback) {
    if (index < phrase.length) {
        spanElement.textContent += phrase[index];
        index++;
        setTimeout(() => typePhrase(spanElement, phrase, index, callback), 100); 
    } else {

        setTimeout(callback, 1000); 
    }
}


function deletePhrase(spanElement, phrase, index = phrase.length - 1, callback) {
    if (index >= 0) {
        spanElement.textContent = phrase.substring(0, index);
        index--;
        setTimeout(() => deletePhrase(spanElement, phrase, index, callback), 50); 
    } else {
        setTimeout(callback, 500);
    }
}




function startTypingAnimation() {
    const typingSpan = document.querySelector('.typing-text span');
    let currentPhraseIndex = 0;

    function typeNextPhrase() {
        const currentPhrase = phrases[currentPhraseIndex];
        typingSpan.textContent = ''; 
        typePhrase(typingSpan, currentPhrase, 0, () => {

            deletePhrase(typingSpan, currentPhrase, currentPhrase.length - 1, () => {

                currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                typeNextPhrase(); 
            });
        });
    }

    typeNextPhrase();
}



window.onload = startTypingAnimation;

const infoTemplates = [
  {
    nombre: "Ana Pérez",
    rol: "Gestora de Contenido",
    descripcion: "Encargada de organizar y actualizar la información relevante del sitio.",
  },
  {
    nombre: "Carlos Díaz",
    rol: "Moderador",
    descripcion: "Supervisa la calidad y coherencia de los contenidos publicados.",
  },
  {
    nombre: "María López",
    rol: "Diseñadora Gráfica",
    descripcion: "Crea los diseños visuales para mejorar la experiencia del usuario.",
  },
];

const infoContainer = document.getElementById("informacion-content");
const btnAddInfo = document.getElementById("add-info-btn");

let nextIndex = 0;


function crearCuadroInformacion({ nombre, rol, descripcion }) {
  const div = document.createElement("div");
  div.classList.add("informacion-cuadro");
  div.tabIndex = 0;

  div.innerHTML = `
    <h3>${nombre}</h3>
    <p class="rol">${rol}</p>
    <p class="descripcion">${descripcion}</p>
  `;

  return div;
}


btnAddInfo.addEventListener("click", () => {
  const data = infoTemplates[nextIndex];
  const nuevoCuadro = crearCuadroInformacion(data);
  infoContainer.appendChild(nuevoCuadro);

  nextIndex = (nextIndex + 1) % infoTemplates.length;
});


window.addEventListener("DOMContentLoaded", () => {
  btnAddInfo.click();
});


async function fetchLoggedUser() {
  return localStorage.getItem('loggedUser');
}


async function loadProfile(username) {
  try {
    const res = await fetch(`http://localhost:3000/api/profile/${username}`, { credentials: 'include' });
    if (!res.ok) throw new Error('No se pudo cargar el perfil');
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Error al cargar perfil:', e);
    return {};
  }
}

async function updateUserInfoUI() {
  const userInfoDiv = document.getElementById('user-info');
  const loggedUser = await fetchLoggedUser();

  if (!loggedUser) {

    userInfoDiv.innerHTML = `<a href="login.html" class="logo">Iniciar Sesión</a>`;
    return;
  }

  const profileData = await loadProfile(loggedUser);

  const avatarUrl = profileData.avatar || null;

  userInfoDiv.innerHTML = `
    <div class="menu-right" aria-label="Usuario Logueado" style="display:flex; align-items:center; gap:12px; font-size:1.2rem; font-weight:600;">
      <a href="perfil.html" style="display:flex; align-items:center; gap:12px; text-decoration:none; color:inherit; cursor:pointer;">
        <div class="nav-avatar" id="nav-avatar" style="width:48px; height:48px; border-radius:50%; overflow:hidden; background:#eee; display:flex; justify-content:center; align-items:center; font-size:2rem;">
          ${avatarUrl ? `<img src="${avatarUrl}" alt="Avatar de ${loggedUser}" style="width:100%; height:100%; object-fit:cover;"/>` : '👤'}
        </div>
        <strong id="username-display">${loggedUser}</strong>
      </a>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', updateUserInfoUI);

