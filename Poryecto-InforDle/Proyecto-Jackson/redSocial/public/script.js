document.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/api/posts');
  const posts = await res.json();
  const container = document.getElementById('posts');

  posts.forEach(post => {
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `
      <h3>${post.user}</h3>
      <p>${post.text}</p>
      ${post.image ? `<img src="/uploads/${post.image}" width="200">` : ''}
    `;
    container.appendChild(div);
  });
});
