// Frases a mostrar
const phrases = [
    " Aprender",
    " Entender",
    " Descubrir",
];

// Función que simula el "auto typing"
function typePhrase(spanElement, phrase, index = 0, callback) {
    if (index < phrase.length) {
        spanElement.textContent += phrase[index];
        index++;
        setTimeout(() => typePhrase(spanElement, phrase, index, callback), 100); // Velocidad de tipeo
    } else {
        // Cuando termine de escribir la frase, llamamos al callback para borrar la frase
        setTimeout(callback, 1000); // Esperamos un segundo antes de empezar a borrar
    }
}

// Función que simula el "auto deleting" (borrado)
function deletePhrase(spanElement, phrase, index = phrase.length - 1, callback) {
    if (index >= 0) {
        spanElement.textContent = phrase.substring(0, index);
        index--;
        setTimeout(() => deletePhrase(spanElement, phrase, index, callback), 50); // Velocidad de borrado
    } else {
        // Cuando termine de borrar, pasamos a la siguiente frase
        setTimeout(callback, 500); // Pausa de 0.5 segundos antes de escribir la siguiente frase
    }
}

// Función para manejar las frases
function startTypingAnimation() {
    const typingSpan = document.querySelector('.typing-text span');
    let currentPhraseIndex = 0;

    function typeNextPhrase() {
        const currentPhrase = phrases[currentPhraseIndex];
        typingSpan.textContent = ''; // Limpiar el texto actual
        typePhrase(typingSpan, currentPhrase, 0, () => {
            // Después de escribir la frase, iniciamos el borrado
            deletePhrase(typingSpan, currentPhrase, currentPhrase.length - 1, () => {
                // Pasamos a la siguiente frase después de que se haya borrado la anterior
                currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                typeNextPhrase(); // Llamamos de nuevo para escribir la siguiente frase
            });
        });
    }

    typeNextPhrase(); // Iniciar la animación
}

// Iniciar la animación cuando se cargue la página
window.onload = startTypingAnimation;

