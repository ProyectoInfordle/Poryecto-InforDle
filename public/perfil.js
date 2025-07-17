
async function fetchLoggedUser() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/user');
    if (!res.ok) throw new Error('No hay usuario logueado');
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Error obteniendo usuario');
    return data.username;
  } catch (e) {
    alert('Debes iniciar sesión');
    throw e;
  }
}

async function loadProfile(username) {
  try {
    const res = await fetch(`http://localhost:3000/api/profile/${username}`);
    if (!res.ok) throw new Error('No se pudo cargar el perfil');
    const data = await res.json();
    return data;
  } catch (e) {
    alert('Error al cargar perfil: ' + e.message);
    throw e;
  }
}

function showPopupSuccess(msg = 'Acción realizada correctamente') {
  const popup = document.getElementById('popup-success');
  popup.textContent = msg;
  popup.style.display = 'block';
  setTimeout(() => {
    popup.style.display = 'none';
  }, 1500);
}

document.getElementById('logout-btn').addEventListener('click', () => {
localStorage.removeItem('loggedUser');
showPopupSuccess('Has cerrado sesión');
setTimeout(() => {
 window.location.href = 'index.html';
}, 1500); // Espera que se muestre el popup y luego redirige
});


async function main() {
  try {
    const loggedUser = await fetchLoggedUser();

    const usernameDisplay = document.getElementById('username-display');
    const profileName = document.getElementById('profile-name');
    const descDiv = document.getElementById('profile-desc');
    const avatarDiv = document.getElementById('avatar');
    const navAvatarDiv = document.getElementById('nav-avatar');
    const popupOverlay = document.getElementById('popup-overlay');
    const editBtn = document.getElementById('edit-profile-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const profileForm = document.getElementById('profile-form');
    const descInput = document.getElementById('desc-input');
    const fileInput = document.getElementById('avatar-upload');

    usernameDisplay.textContent = loggedUser;
    profileName.textContent = loggedUser;

    const profileData = await loadProfile(loggedUser);

    descDiv.textContent = profileData.description || 'Bienvenido a tu perfil';

    
    function loadAvatar(div, avatarUrl) {
      if (avatarUrl) {
        div.innerHTML = `<img src="${avatarUrl}" alt="Avatar de ${loggedUser}" />`;
      } else {
        div.textContent = '👤';
      }
    }

    loadAvatar(avatarDiv, profileData.avatar);
    loadAvatar(navAvatarDiv, profileData.avatar);

    editBtn.addEventListener('click', (e) => {
      e.preventDefault();
      descInput.value = descDiv.textContent;
      popupOverlay.classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => {
      popupOverlay.classList.add('hidden');
    });

    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) popupOverlay.classList.add('hidden');
    });

    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const description = descInput.value.trim();
      const formData = new FormData();
      formData.append('description', description);
      if (fileInput.files[0]) formData.append('avatar', fileInput.files[0]);

      try {
        const res = await fetch(`http://localhost:3000/api/profile/${loggedUser}`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (!res.ok || !data.success) throw new Error(data.message || 'Error al guardar perfil');

        setTimeout(() => {
          if (fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const newAvatarUrl = event.target.result;
              avatarDiv.innerHTML = `<img src="${newAvatarUrl}" alt="Avatar Usuario" />`;
              navAvatarDiv.innerHTML = `<img src="${newAvatarUrl}" alt="Avatar de ${loggedUser}" />`;
            };
            reader.readAsDataURL(fileInput.files[0]);
          }

          descDiv.textContent = description || 'Bienvenido a tu perfil';
          popupOverlay.classList.add('hidden');
          fileInput.value = '';

          showPopupSuccess('Perfil actualizado correctamente');
        }, 300);

      } catch (err) {
        alert('No se pudo guardar el perfil: ' + err.message);
        console.error(err);
      }
    });

  } catch (err) {
    console.error('Error en la carga inicial:', err);
  }
}

main();
