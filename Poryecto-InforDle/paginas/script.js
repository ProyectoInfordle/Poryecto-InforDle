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

