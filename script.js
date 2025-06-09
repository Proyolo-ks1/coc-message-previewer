document.getElementById("messageInput").addEventListener("input", updatePreview);
document.getElementById("messageType").addEventListener("change", updatePreview);

function updatePreview() {
    const input = document.getElementById("messageInput").value;
    const formatted = formatColors(input);
    document.getElementById("previewBox").innerHTML = formatted;
}

// Simple color formatting using <c2>colored text</c>
function formatColors(text) {
    return text.replace(/<c([0-9A-Fa-f#]{1,6})>(.*?)<\/c>/g, (match, colorCode, content) => {
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

        // Check if it's a preset (0–9), otherwise treat it as hex color
        const color = presetColors[colorCode] || (
            colorCode.startsWith("#") ? colorCode : `#${colorCode}`
        );

        return `<span style="color:${color}">${content}</span>`;
    });
}
