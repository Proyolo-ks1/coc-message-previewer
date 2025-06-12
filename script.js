window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("messageInput").addEventListener("input", updatePreview);
    updatePreview();
});

// # MARK: Preview
function formatColors(text) {
    return text.replace(/<c([0-9A-Fa-f#]{1,6})>([\s\S]*?)<\/c>/g, (match, colorCode, content) => {
        const presetColors = {
            "0": "#000000", // black
            "1": "#FFFFFF", // white
            "2": "#FF0000", // red
            "3": "#00FF00", // green
            "4": "#0000FF", // blue
            "5": "#00FFFF", // aqua
            "6": "#FF00FF", // magenta
            "7": "#FFFF00", // yellow
            "9": "#8B0000"  // dark red
        };

        const color = presetColors[colorCode] || (
            colorCode.startsWith("#") ? colorCode : `#${colorCode}`
        );

        return `<span style="color:${color}">${content}</span>`;
    });
}


// # MARK: Dropdown Menu
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
        updatePreview();
    });
});

// Close dropdown if clicked outside
document.addEventListener('click', (e) => {
    if (!dropdownSelected.contains(e.target) && !dropdownOptions.contains(e.target)) {
        dropdownOptions.classList.remove('show');
    }
});

function getSelectedMessageType() {
    const selected = document.querySelector('.dropdown-options li.selected');
    return selected ? selected.getAttribute('data-value') : 'chatmessage';
}

function updatePreview() {
    const input = document.getElementById("messageInput").value;
    const messageType = getSelectedMessageType();

    let formatted = formatColors(input);

    // Customize preview depending on messageType
    switch(messageType) {
        case 'chatmessage':
            formatted = `
                <h3>Clan Description</h3>
                <div class="preview-chat-message">
                    <div class="sender">[You]:</div>
                    <div class="message">${formatted}</div>
                </div>`;
            break;

        case 'clanmail':
            formatted = `
                <h3>Clan Mail</h3>
                <div class="preview-clan-mail">
                    <div class="mail-header">Clan Mail from Leader</div>
                    <div class="mail-body">${formatted}</div>
                </div>`;
            break;

        case 'clandescription':
            formatted = `
                <h3>Clan Description</h3>
                <div class="preview-clan-description">
                    <p>${formatted}</p>
                </div>`;
            break;

        case 'clanwarletter':
            formatted = `
                <h3>Clan Description</h3>
                <div class="preview-clan-war-letter">
                    <strong>Clan War Letter</strong>
                    <div class="letter">${formatted}</div>
                </div>`;
            break;

        case 'trooprequest':
            formatted = `
                <h3>Troop Request</h3>
                <div class="preview-troop-request">
                    <div class="requester">PlayerX requests:</div>
                    <div class="troops">🛡️⚔️</div>
                    <div class="message">${formatted}</div>
                </div>`;
            break;

        case 'challenge':
            formatted = `
                <h3>Challenge</h3>
                <div class="preview-challenge">
                    <div class="challenge-title">⚔️ Friendly Challenge</div>
                    <div class="challenge-message">${formatted}</div>
                </div>`;
            break;

        default:
            formatted = `<div>${formatted}</div>`;
    }


    document.getElementById("previewBox").innerHTML = formatted.replace(/\n/g, "<br>");
}