const themeBtn = document.getElementById('theme-btn');
const profileCard = document.querySelector('.card');

const colors = [
    '#ffffff',
    '#e3f2fd',
    '#f3e5f5',
    '#e8f5e9',
    '#fff3e0',
    '#fce4ec',
    '#e0f7fa',
    '#f9fbe7',
    '#f8e7ff',
    '#fbe9e7'
];

let colorIndex = 0;

themeBtn.addEventListener('click', function () {
    colorIndex = (colorIndex + 1) % colors.length;
    profileCard.style.backgroundColor = colors[colorIndex];
});