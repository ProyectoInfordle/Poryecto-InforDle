const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animado');
    } else {
      entry.target.classList.remove('animado'); 
    }
  });
});

// Solo observar el gif-container de Informacion
document.querySelectorAll('.gif-container').forEach(el => {
  observer.observe(el);
});

document.querySelectorAll('.mantenimiento-animable').forEach(el => {
  observer.observe(el);
});