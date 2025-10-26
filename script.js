// MARK: Debugging
const debug = false;

if (debug) {
    document.body.classList.add('debug-mode');
}



// MARK: Page Elements

const customBg = document.getElementById('custom-background');

const dropdownSelected = document.querySelector('.dropdown-selected');
const dropdownOptions = document.querySelector('.dropdown-options');
const options = dropdownOptions.querySelectorAll('li');

const customColorBtn = document.getElementById("customColorBtn");
const customColorTextField = document.getElementById("customColorTextField");
const colorWheelBtn = document.getElementById("colorWheelButton");
const customColorPicker = document.getElementById("customColorPicker");

const inputTextBox = document.getElementById("messageInput");
const charCounter = document.getElementById("charCounter");
const warning = document.getElementById("charWarning");

const shareLink = document.getElementById("share-link")


// MARK: Background

function updateBackgroundPosition() {
    const windowWidth = window.innerWidth;
    const treshhold = 1160;
    let shift = 0;
    if (windowWidth < treshhold) {
        shift = 0.5 * (windowWidth - treshhold);
    }
    customBg.style.right = `${shift}px`;
}
updateBackgroundPosition();
window.addEventListener('resize', updateBackgroundPosition);



// MARK: Share Link

shareLink.addEventListener("click", function (e) {
    e.preventDefault();
    const url = "https://proyolo-ks1.github.io/coc-message-previewer/";

    if (navigator.share) {
        navigator.share({
            title: "Clash of Clans Message Previewer",
            text: "Preview your Clan Chat Message before sending it with custom colors!",
            url: url
        }).catch(err => {
            if (err.name !== "AbortError") {
                console.error("Share failed:", err);
            }
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(url).then(() => {
            const feedback = document.getElementById("copy-feedback");
            feedback.style.display = "inline";
            setTimeout(() => {
                feedback.style.display = "none";
            }, 2000);
        }).catch(err => {
            alert("Failed to copy the link.");
            console.error(err);
        });
    }
});



// MARK: Dropdown Menu

dropdownSelected.addEventListener('click', () => {
    dropdownOptions.classList.toggle('show');
});

options.forEach(option => {
    option.addEventListener('click', () => {
        // Remove previous selection
        dropdownOptions.querySelector('li.selected').classList.remove('selected');

        // Mark this option as selected
        option.classList.add('selected');

        // Update displayed value
        dropdownSelected.textContent = option.textContent;

        // Save selection to localStorage
        localStorage.setItem('selectedMessageType', option.getAttribute('data-value'));

        // Close options
        dropdownOptions.classList.remove('show');

        // Update preview because the message type changed
        handleInputChange();
    });
});

// Close dropdown if clicked outside
document.addEventListener('click', (e) => {
    if (!dropdownSelected.contains(e.target) && !dropdownOptions.contains(e.target)) {
        dropdownOptions.classList.remove('show');
    }
});

// Restore Dropdown Selection
function restoreDropdownSelection() {
    const savedType = localStorage.getItem('selectedMessageType');
    if (savedType) {
        const savedOption = dropdownOptions.querySelector(`li[data-value="${savedType}"]`);
        if (savedOption) {
            // Remove current selection
            const current = dropdownOptions.querySelector('li.selected');
            if (current) current.classList.remove('selected');

            // Set saved selection
            savedOption.classList.add('selected');
            dropdownSelected.textContent = savedOption.textContent;
        }
    }
}

// MARK: getSelectedMessageType()
function getSelectedMessageType() {
    const selected = document.querySelector('.dropdown-options li.selected');
    return selected ? selected.getAttribute('data-value') : 'chatmessage';
}

// MARK: Color Button Tooltip

document.querySelectorAll('.color-btn').forEach(btn => {
    let tooltip;

    btn.addEventListener('mouseenter', () => {
        const bg = getComputedStyle(btn).backgroundColor;
        btn.style.boxShadow = `0 0 8px ${bg}, 0 0 16px ${bg}`;

        const titleText = btn.getAttribute('title') || btn.getAttribute('alt') || 'No text';

        // Create tooltip
        tooltip = document.createElement('div');
        tooltip.textContent = btn.getAttribute('title') || btn.getAttribute('alt') || 'No text';
        tooltip.style.position = 'absolute';
        tooltip.style.border = '3px solid var(--dropdown-border)';
        tooltip.style.backgroundColor = 'var(--chat-message-me-background)';
        tooltip.style.fontFamily = '"CCBackBeat W90 Heavy Italic", sans-serif';
        tooltip.style.fontSize = '1rem';
        tooltip.style.color = bg;
        tooltip.style.letterSpacing = '0.03em';
        tooltip.style.padding = '0.25rem 0.5rem';
        tooltip.style.whiteSpace = 'nowrap';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '9999';
        tooltip.style.borderRadius = '6px';

        // Background depending on title
        if (titleText === "Textbubble You") {
            tooltip.style.backgroundColor = 'var(--chat-message-other-background)';
        } else {
            tooltip.style.backgroundColor = 'var(--chat-message-me-background)';
        }

        // Position above the button
        const rect = btn.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.top + window.scrollY - 30}px`;

        document.body.appendChild(tooltip);
    });

    btn.addEventListener('mousemove', (e) => {
        if (tooltip) {
            tooltip.style.left = `${e.pageX + 5}px`;
            tooltip.style.top = `${e.pageY - 35}px`; // stays above cursor
        }
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.boxShadow = '';
        if (tooltip) {
            tooltip.remove();
            tooltip = null;
        }
    });
});

// MARK: InputTextBox

// Inserting Custom Color

// Open build-in browser color wheel
colorWheelBtn.addEventListener("click", () => {
    customColorPicker.click();
});

// Apply Chosen color to customColorHex.value
customColorPicker.addEventListener("input", () => {
    customColorTextField.value = customColorPicker.value.toUpperCase();
    customColorBtn.style.backgroundColor = customColorTextField.value;
});

// Update color picker when user types a valid hex color
customColorTextField.addEventListener("input", () => {
    const val = customColorTextField.value.toUpperCase();
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        customColorPicker.value = val;
        customColorBtn.style.backgroundColor = val;
    }
});

// Clicking Color Buttons
document.getElementById("coloring").addEventListener("click", function (e) {
    const button = e.target.closest("button[color-id]");
    if (!button) return;

    const input = inputTextBox;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selectedText = input.value.slice(start, end);

    let markupColor;
    const colorId = button.getAttribute("color-id");

    if (colorId === "customColorBtn") {
        const customHexColor = customColorTextField.value.trim();
        if (!/^#[0-9A-Fa-f]{6}$/.test(customHexColor)) {
            alert("Invalid custom color format. Use #RRGGBB.");
            return;
        }
        markupColor = customHexColor.slice(1); // remove the "#"
    } else {
        markupColor = colorId
    }
    const startTag = `<c${markupColor}>`;
    const endTag = `</c>`;
    const replacement = startTag + selectedText + endTag;

    // Replaces and adds to undo/redo stack
    input.setRangeText(replacement, start, end, "end");

    handleInputChange();
});

document.getElementById("copyMessageBtn").addEventListener("click", () => {
    const text = document.getElementById("messageInput").value;
    navigator.clipboard.writeText(text).then(() => {
        // Optional visual feedback
        const btn = document.getElementById("copyMessageBtn");
        btn.textContent = "✅";
        setTimeout(() => btn.textContent = "📋", 1000);
    }).catch(err => {
        console.error("Failed to copy text: ", err);
    });
});

// MARK: > Formatting
function formatTextChatMessage(text) {

    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, function(m) {
            switch (m) {
                case "&": return "&amp;";
                case "<": return "&lt;";
                case ">": return "&gt;";
                case '"': return "&quot;";
                case "'": return "&#39;";
            }
        });
    }

    const presetColors = {
        "0": "#000000", // black
        "1": "#FFFFFF", // white
        "2": "#FF0000", // red
        "3": "#00FF00", // green
        "4": "#0000FF", // blue
        "5": "#00FFFF", // aqua
        "6": "#FF00FF", // magenta
        "7": "#FFFF00", // yellow
        "8": "#FF00FF", // magenta (second?)
        "9": "#bf1238"  // dark red
    };

    const escaped = escapeHTML(text).replace(/\n/g, "<br>");

    // Match <cXX> but do not require closing </c>
    return escaped.replace(/&lt;c([0-9A-Fa-f#]{1,8})&gt;/g, (match, colorCode) => {
        colorCode = colorCode.toUpperCase();

        let color;
        if (presetColors[colorCode]) {
            color = presetColors[colorCode];
        } else if (/^[0-9A-F]{6}$/.test(colorCode)) {
            color = `#${colorCode}`;
        } else if (/^[0-9A-F]{8}$/.test(colorCode)) {
            const alpha = parseInt(colorCode.slice(0, 2), 16) / 255;
            const r = parseInt(colorCode.slice(2, 4), 16);
            const g = parseInt(colorCode.slice(4, 6), 16);
            const b = parseInt(colorCode.slice(6, 8), 16);
            color = `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
        } else {
            color = null;
        }

        return color ? `<span style="color:${color}">` : "";
    }).replace(/&lt;\/c&gt;/g, "</span>");
}

function formatTextNoFormat(text) {
    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, function(m) {
            switch (m) {
                case "&": return "&amp;";
                case "<": return "&lt;";
                case ">": return "&gt;";
                case '"': return "&quot;";
                case "'": return "&#39;";
            }
        });
    }

    return escapeHTML(text).replace(/\n/g, "<br>");
}

// MARK: Preview

const charLimits = {
    "challenge": 80,
    "chat-message": 128,
    "clan-mail": 256,
    "clan-description": 251,
    "clan-war-letter": 160,
    "troop-request": 154,
};

function handleInputChange() {
    const messageType = getSelectedMessageType();
    const charLimit = charLimits[messageType]
    const currentChars = inputTextBox.value.length

    let text = `${currentChars}/${charLimit}`;
    let color = "rgb(127,127,127)";

    if (currentChars > charLimit) {
        text += " - Maximum of " + charLimit + " characters reached!";
        color = "red";
    }

    charCounter.textContent = text;
    charCounter.style.color = color;

    updatePreview();
};

const loadedPreviews = {}; // cache loaded previews

// Preload everything on page load
function preloadAllPreviews() {
    const types = Object.keys(charLimits);
    const promises = types.map(messageType =>
        fetch(`preview-files/${messageType}.html`)
            .then(res => res.text())
            .then(html => {
                loadedPreviews[messageType] = { html };

                // CSS HEAD check
                fetch(`preview-files/${messageType}.css`, { method: 'HEAD' })
                    .then(res => {
                        if (res.ok) loadedPreviews[messageType].cssHref = `preview-files/${messageType}.css`;
                    });

                // JS HEAD check
                fetch(`preview-files/${messageType}.js`, { method: 'HEAD' })
                    .then(res => {
                        if (res.ok) loadedPreviews[messageType].jsPath = `preview-files/${messageType}.js`;
                    });
            })
    );
    return Promise.all(promises);
}

function renderTemplate(template, data) {
    return new Function("data", 
        "with (data) { return `" + template + "`; }"
    )(data);
}

// MARK: updatePreview()
function updatePreview() {
    const messageType = getSelectedMessageType();
    const input = document.getElementById("messageInput").value;
    const charLimit = charLimits[messageType];
    let displayText = input.substring(0, charLimit);

    const formattedText = messageType === 'chat-message'
        ? formatTextChatMessage(displayText)
        : formatTextNoFormat(displayText);

    const data = { nameOther:'Other Guy', nameMe:'You', role:'Co-Leader', timeAgo:'10m', pinned:false, formattedText };

    const cached = loadedPreviews[messageType];
    if (!cached) return console.warn(`Preview for ${messageType} not preloaded yet`);

    document.getElementById("previewBox").innerHTML = renderTemplate(cached.html, data);

    if (cached.cssHref) {
        let oldLink = document.getElementById('preview-css');
        if (oldLink) oldLink.remove();
        const link = document.createElement('link');
        link.id = 'preview-css';
        link.rel = 'stylesheet';
        link.href = cached.cssHref;
        document.head.appendChild(link);
    }

    if (cached.jsPath && !cached.jsLoaded) {
        const script = document.createElement('script');
        script.src = cached.jsPath;
        script.type = 'module';
        document.body.appendChild(script);
        cached.jsLoaded = true;
    }
}

// MARK: DOM ready
window.addEventListener('DOMContentLoaded', () => {
    preloadAllPreviews().then(() => {
        // Executed once all previews are loaded
        restoreDropdownSelection();
        handleInputChange();
        document.getElementById("messageInput").addEventListener("input", handleInputChange);
        customColorTextField.dispatchEvent(new Event("input"));
    });
});