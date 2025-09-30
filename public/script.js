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

// Función para crear un cuadro con nombre, rol y descripción
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

// Agregar cuadro nuevo con datos en ciclo de infoTemplates
btnAddInfo.addEventListener("click", () => {
  const data = infoTemplates[nextIndex];
  const nuevoCuadro = crearCuadroInformacion(data);
  infoContainer.appendChild(nuevoCuadro);

  nextIndex = (nextIndex + 1) % infoTemplates.length;
});

// Opcional: agregar un cuadro inicial al cargar la página
window.addEventListener("DOMContentLoaded", () => {
  btnAddInfo.click();
});
