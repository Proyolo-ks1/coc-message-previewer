// MARK: Debugging
const debug = false;

if (debug) {
    document.body.classList.add('debug-mode');
}



// MARK: Page Elements

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

// MARK: Buttons

document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        const bg = getComputedStyle(btn).backgroundColor;
        btn.style.boxShadow = `0 0 8px ${bg}, 0 0 16px ${bg}`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.boxShadow = '';
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

// MARK: Preview

const charLimits = {
    "challenge": 80,
    "chatmessage": 128,
    "clanmail": 256,
    "clandescription": 251,
    "clanwarletter": 160,
    "trooprequest": 154,
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
    const withLineBreaks = escapeHTML(text).replace(/\n/g, "<br>");

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

    return withLineBreaks.replace(/&lt;c([0-9A-Fa-f#]{1,8})&gt;([\s\S]*?)&lt;\/c&gt;/g, (match, colorCode, content) => {
        // Normalize to uppercase
        colorCode = colorCode.toUpperCase();

        // Check for single digit preset
        if (presetColors.hasOwnProperty(colorCode)) {
            return `<span style="color:${presetColors[colorCode]}">${content}</span>`;
        }

        // Accept only 6-digit or 8-digit hex codes
        if (/^[0-9A-F]{6}$/.test(colorCode)) {
            // 6-digit RGB hex
            return `<span style="color:#${colorCode}">${content}</span>`;
        } else if (/^[0-9A-F]{8}$/.test(colorCode)) {
            // 8-digit ARGB hex: AARRGGBB
            // Parse alpha and convert to CSS rgba()
            const alphaHex = colorCode.slice(0, 2);
            const rHex = colorCode.slice(2, 4);
            const gHex = colorCode.slice(4, 6);
            const bHex = colorCode.slice(6, 8);

            const alpha = parseInt(alphaHex, 16) / 255;
            const r = parseInt(rHex, 16);
            const g = parseInt(gHex, 16);
            const b = parseInt(bHex, 16);

            return `<span style="color:rgba(${r},${g},${b},${alpha.toFixed(2)})">${content}</span>`;
        }

        // Invalid code: remove tags but keep content
        return content;
    });
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

// MARK: getSelectedMessageType()
function getSelectedMessageType() {
    const selected = document.querySelector('.dropdown-options li.selected');
    return selected ? selected.getAttribute('data-value') : 'chatmessage';
}

// MARK: updatePreview()
function updatePreview() {
    const input = document.getElementById("messageInput").value;
    const messageType = getSelectedMessageType();
    const charLimit = charLimits[messageType]

    let displayText = input;
    let isTruncated = false;

    if (input.length > charLimit) {
        displayText = input.substring(0, charLimit);
        isTruncated = true;
    }

    let formattedText;
    if (messageType == 'chatmessage') {
        formattedText = formatTextChatMessage(displayText);
    } else {
        formattedText = formatTextNoFormat(displayText);
    }
    
    const nameOther = 'Other Guy';
    const nameMe = 'You'; 
    const role = 'Co-Leader';
    const timeAgo = '10m';
    const pinned = false;

    // Customize preview depending on messageType
    switch(messageType) {
        // MARK: > HTML: Chat Message
        case 'chatmessage':
            previewHtmlText = `
                <div class="clan-chat">
                    <div class="preview-chat-message preview-chat-message-other">
                        <div class="message-player">
                            <img src="images/Leagues/Champion2.png" class="message-player-league-icon" alt="League Icon" />
                            <div class="message-player-name">${nameOther}</div>
                        </div>
                        <div class="chat-message-bubble preview-chat-message-bubble-other">
                            <div class="message-bubble-role">${role}</div>
                            <div class="message-bubble-body">${formattedText}</div>
                            <div class="message-bubble-age">${timeAgo}</div>
                        </div>
                    </div>
                    <div class="preview-chat-message preview-chat-message-me">
                        <div class="message-player">
                            <img src="images/Leagues/Titan3.png" class="message-player-league-icon" alt="League Icon" />
                            <div class="message-player-name">${nameMe}</div>
                        </div>
                        <div class="chat-message-bubble preview-chat-message-bubble-me">
                            <div class="message-bubble-role">${role}</div>
                            <div class="message-bubble-body">${formattedText}</div>
                            <div class="message-bubble-age">${timeAgo}</div>
                        </div>
                    </div>
                </div>
                `;
            break;

        // MARK: > HTML: Clan Mail
        case 'clanmail':
            previewHtmlText = `
                <h3>Clan Mail</h3>
                <div class="preview-clan-mail">
                    <div class="mail-body">${formattedText}</div>
                </div>
                `;
            break;

        // MARK: > HTML: Clan Description
        case 'clandescription':
            previewHtmlText = `
                <h3>Clan Description</h3>
                <div class="preview-clan-description">
                    <div class="letter">${formattedText}</div>
                </div>
                `;
            break;

        // MARK: > HTML: Clan War Letter
        case 'clanwarletter':
            previewHtmlText = `
                <h3>Clan Description</h3>
                <div class="preview-clan-war-letter">
                    <div class="letter">${formattedText}</div>
                </div>
                `;
            break;

        // MARK: > HTML: Troop Request
        case 'trooprequest':
            previewHtmlText = `
                <h3>Troop Request</h3>
                <div class="preview-troop-request">
                    <div class="message">${formattedText}</div>
                </div>
                `;
            break;

        // MARK: > HTML: Friendly Challenge
        case 'challenge':
            previewHtmlText = `
                <h3>Challenge</h3>
                <div class="preview-challenge">
                    <div class="challenge-message">${formattedText}</div>
                </div>
                `;
            break;

        default:
            previewHtmlText = `<div>${formattedText}</div>`;
    }
    document.getElementById("previewBox").innerHTML = previewHtmlText;
}

// MARK: Run Once
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("messageInput").addEventListener("input", handleInputChange);
    handleInputChange();
    customColorTextField.dispatchEvent(new Event("input"));
});