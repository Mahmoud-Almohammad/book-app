'use strict';

const hamburger = document.querySelector('.hamburger');
const menu = document.querySelector('.menu');

hamburger.addEventListener('click', showMenu);

function showMenu() {
    hamburger.classList.toggle('active');
    menu.classList.toggle('active');
}