const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animado');
    } else {
      entry.target.classList.remove('animado'); 
    }
  });
});


document.querySelectorAll('.gif-container').forEach(el => {
  observer.observe(el);
});

document.querySelectorAll('.mantenimiento-animable').forEach(el => {
  observer.observe(el);
});