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
                    <div style="color: #1a1a1a; font-size: 0.8em; margin-bottom: 0.3em;">${entry.date}</div>
                    <h3 style="color: #eeeeee; font-weight: bold; margin: 0 0 0.3em 0;">${entry.version} — ${entry.title}</h3>
                    <p style="color: #bbbbbb; font-size: 0.9em; margin: 0;">${entry.description}</p>
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