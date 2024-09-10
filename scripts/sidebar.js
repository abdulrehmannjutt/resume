const hamBurger = document.querySelector('.menu-icon');
const mobileNav = document.querySelector('.mobile-nav');
const background = document.querySelector('.background');
const closeBtn = document.querySelector('.close-btn');
const modileNav = document.getElementById('mobileNav');
 
hamBurger.addEventListener('click', () => {
    mobileNav.classList.add('navActive');
    background.classList.add('navActive');

    document.body.classList.add('no-overflow');
    document.documentElement.classList.add('no-overflow');
});

closeBtn.addEventListener('click', () => {
    mobileNav.classList.remove('navActive');
    background.classList.remove('navActive'); 
});
 
background.addEventListener('click', () => {
    mobileNav.classList.remove('navActive');
    background.classList.remove('navActive');
     
});