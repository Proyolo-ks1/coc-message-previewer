// MARK: Debugging
const debug = false;

if (debug) {
    document.body.classList.add('debug-mode');
}



// MARK: Dropdown Menu
const dropdownSelected = document.querySelector('.dropdown-selected');
const dropdownOptions = document.querySelector('.dropdown-options');
const options = dropdownOptions.querySelectorAll('li');

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

// MARK: Preview
const input = document.getElementById("messageInput");
const charCounter = document.getElementById("charCounter");
const warning = document.getElementById("charWarning");

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
    const currentChars = input.value.length

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
        "8": "#FF00FF", // magenta (fallback)
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
    const maxLength = 128;

    let displayText = input;
    let isTruncated = false;

    if (input.length > maxLength) {
        displayText = input.substring(0, maxLength);
        isTruncated = true;
    }

    const messageType = getSelectedMessageType();
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
                            <img src="images/Champion2.png" class="message-player-league-icon" alt="League Icon" />
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
                            <img src="images/Titan3.png" class="message-player-league-icon" alt="League Icon" />
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
});