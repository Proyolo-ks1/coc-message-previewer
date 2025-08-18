// MARK: Update ChangeLog
fetch('changelog.json')
    .then(response => response.json())
    .then(changelog => {
        // 1. Render changelog only if container exists
        const container = document.getElementById('changelog-container');
        if (container) {
            changelog.forEach(entry => {
                const box = document.createElement('div');
                box.classList.add('update-box');

                box.innerHTML = `
                    <div class="update-box-date">${entry.date}</div>
                    <h3 class="update-box-title">${entry.version} — ${entry.title}</h3>
                    <p class="update-box-desc">${entry.description}</p>
                `;

                container.appendChild(box);
            });
        }

        // 2. Always update footer version
        const newest = changelog.length > 0 ? changelog[0] : { version: "0.0" };
        const versionSpan = document.getElementById('version-number');
        if (versionSpan) {
            versionSpan.textContent = newest.version;
        }
    })
    .catch(err => {
        console.error("Failed to load changelog:", err);
    });