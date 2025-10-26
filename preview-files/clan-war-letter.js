const glow = document.querySelector('.floating-clan-war-letter-glow');
const icon = document.querySelector('.floating-clan-war-letter-icon');

let peakCount = 0;
glow.addEventListener('animationiteration', () => {
    peakCount++;
    // every second iteration (full cycle = 3.5s)
    if (peakCount % 2 === 0) {
        icon.style.animation = 'wiggleIcon 1s linear forwards';
        setTimeout(() => icon.style.animation = 'none', 1000);
    }
});