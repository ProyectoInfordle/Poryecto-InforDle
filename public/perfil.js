async function fetchLoggedUser() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/user', { credentials: 'include' });
    if (!res.ok) throw new Error('No hay usuario logueado');
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Error obteniendo usuario');
    return data;
  } catch (e) {
    alert('Debes iniciar sesión');
    throw e;
  }
}

async function loadProfile(username) {
  try {
    const res = await fetch(`http://localhost:3000/api/profile/${username}`, { credentials: 'include' });
    if (!res.ok) throw new Error('No se pudo cargar el perfil');
    const data = await res.json();
    return data; // data debe contener: description, avatar, role
  } catch (e) {
    alert('Error al cargar perfil: ' + e.message);
    throw e;
  }
}


function showPopupSuccess(msg = 'Acción realizada correctamente') {
  const popup = document.getElementById('popup-success');
  if (!popup) return;
  popup.textContent = msg;
  popup.style.display = 'block';
  setTimeout(() => { popup.style.display = 'none'; }, 1500);
}

document.getElementById('logout-btn')?.addEventListener('click', async () => {
  try {
    const res = await fetch('http://localhost:3000/api/users/logout', {
      method: 'POST',
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Error cerrando sesión');
    localStorage.removeItem('loggedUser');
    showPopupSuccess('Has cerrado sesión');
    setTimeout(() => { window.location.href = 'index.html'; }, 1500);
  } catch (err) {
    alert('No se pudo cerrar sesión: ' + err.message);
    console.error(err);
  }
});

function showPanels(role) {
  const adminPanel = document.getElementById('admin-panel');
  const ownerPanel = document.getElementById('owner-panel');
  const overlay = adminPanel?.querySelector('.maintenance-x');

  // Ocultar todo por defecto
  if (adminPanel) adminPanel.style.display = 'none';
  if (ownerPanel) ownerPanel.style.display = 'none';
  if (overlay) overlay.classList.remove('active');

  // Mostrar solo según rol
  if (role === 'admin') {
    if (adminPanel) adminPanel.style.display = 'block';
    if (overlay) overlay.classList.add('active'); // activa banner y bloquea solo admin-panel
  } else if (role === 'owner') {
    if (ownerPanel) ownerPanel.style.display = 'block';
  }
  // member → no muestra panel ni overlay
}






async function main() {
  try {
    const userData = await fetchLoggedUser();
    const loggedUser = userData.username;
    const role = userData.role;

    showPanels(role);



    // ---- ELEMENTOS DOM ----
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

    // ---- MOSTRAR DATOS ----
    usernameDisplay.textContent = loggedUser;
    profileName.textContent = loggedUser;

    const profileData = await loadProfile(loggedUser);
    descDiv.textContent = profileData.description || 'Bienvenido a tu perfil';

    function loadAvatar(div, avatarUrl) {
      if (!div) return;
      if (avatarUrl) div.innerHTML = `<img src="${avatarUrl}" alt="Avatar de ${loggedUser}" />`;
      else div.textContent = '👤';
    }

    loadAvatar(avatarDiv, profileData.avatar);
    loadAvatar(navAvatarDiv, profileData.avatar);

    // ---- EDITAR PERFIL ----
editBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  descInput.value = descDiv.textContent;
  popupOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
});

// Animación de cierre al presionar cancelar
cancelBtn?.addEventListener('click', () => {
  if (!popupOverlay.classList.contains('hidden')) {
    const popup = popupOverlay.querySelector('.popup');
    popup.classList.add('closing');
    popup.addEventListener('animationend', () => {
      popup.classList.remove('closing');
      popupOverlay.classList.add('hidden');
      document.body.style.overflow = '';
    }, { once: true });
  }
});

// Comentamos esta parte para que no se cierre al hacer click afuera
/*
popupOverlay?.addEventListener('click', (e) => { 
  if (e.target === popupOverlay) popupOverlay.classList.add('hidden'); 
});
*/

profileForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const description = descInput.value.trim();
  const formData = new FormData();
  formData.append('description', description);
  if (fileInput.files[0]) formData.append('avatar', fileInput.files[0]);

  try {
    const res = await fetch(`http://localhost:3000/api/profile/${loggedUser}`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Error al guardar perfil');

    if (fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        loadAvatar(avatarDiv, event.target.result);
        loadAvatar(navAvatarDiv, event.target.result);
      };
      reader.readAsDataURL(fileInput.files[0]);
    }

    descDiv.textContent = description || 'Bienvenido a tu perfil';

    // Animación de cierre al guardar
    const popup = popupOverlay.querySelector('.popup');
    popup.classList.add('closing');
    popup.addEventListener('animationend', () => {
      popup.classList.remove('closing');
      popupOverlay.classList.add('hidden');
    }, { once: true });

    fileInput.value = '';
    showPopupSuccess('Perfil actualizado correctamente');
  } catch (err) {
    alert('No se pudo guardar el perfil: ' + err.message);
    console.error(err);
  }
});
;

    

    

    // ---- PANEL OWNER / ADMIN ----
    if (role === 'owner' || role === 'admin' || role === 'menber') {
      const panelId = role === 'owner' ? 'owner-panel' : 'admin-panel';
      const panel = document.getElementById(panelId);
      if (!panel) return;
      panel.style.display = 'block';
      const usersTableBody = panel.querySelector('tbody');

      async function loadUsers() {
        try {
          const res = await fetch('http://localhost:3000/api/users/all', { credentials: 'include' });
          if (!res.ok) throw new Error('Error cargando usuarios');
          const data = await res.json();

          usersTableBody.innerHTML = '';
          data.users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${user.username}</td>
              <td>${user.email}</td>
              <td>
                <select class="role-select" data-username="${user.username}">
                  <option value="user" ${user.role === 'user' ? 'selected' : ''}>user</option>
                  <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>admin</option>
                  <option value="owner" ${user.role === 'owner' ? 'selected' : ''}>owner</option>
                </select>
              </td>
              ${role === 'owner' ? `<td><button class="delete-user-btn" data-username="${user.username}">Eliminar</button></td>` : ''}
            `;
            usersTableBody.appendChild(tr);
          });

          // Cambiar roles
          usersTableBody.querySelectorAll('.role-select').forEach(select => {
            select.addEventListener('change', async (e) => {
              const username = e.target.dataset.username;
              const newRole = e.target.value;
              try {
                const res = await fetch(`http://localhost:3000/api/users/${username}/change-role`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ role: newRole }),
                  credentials: 'include'
                });
                const data = await res.json();
                if (!res.ok || !data.success) throw new Error(data.message);
                showPopupSuccess(`Rol de ${username} actualizado a ${newRole}`);
              } catch (err) {
                alert('Error al cambiar rol: ' + err.message);
              }
            });
          });

          // Eliminar usuarios (solo owner)
          if (role === 'owner') {
            usersTableBody.querySelectorAll('.delete-user-btn').forEach(btn => {
              btn.addEventListener('click', async (e) => {
                const username = e.target.dataset.username;
                if (!confirm(`¿Eliminar usuario ${username}?`)) return;
                try {
                  const res = await fetch(`http://localhost:3000/api/users/${username}`, {
                    method: 'DELETE',
                    credentials: 'include'
                  });
                  const data = await res.json();
                  if (!res.ok || !data.success) throw new Error(data.message);
                  showPopupSuccess(`Usuario ${username} eliminado`);
                  loadUsers();
                } catch (err) {
                  alert('Error al eliminar usuario: ' + err.message);
                }
              });
            });
          }

        } catch (err) {
          console.error('Error cargando usuarios:', err);
        }
      }

      loadUsers();
    }

  } catch (err) {
    console.error('Error en la carga inicial:', err);
  }
}

main();
