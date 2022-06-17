'use strict';

////////////////////////////////////////////////////////////////////////////////////
//PAGE

// Modal window

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');

const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

//* Implementing Smooth Scrolling

//////////////////////////

btnScrollTo.addEventListener('click', function(e){
  const s1coords = section1.getBoundingClientRect();
  console.log(s1coords);

  console.log(e.target.getBoundingClientRect());

  console.log('Current scroll (X/Y)', window.pageXOffset, window.pageYOffset);

  //Scrolling

  // window.scrollTo(
  //   s1coords.left + window.pageXOffset, 
  //   s1coords.top + window.pageYOffset
  // );

  /*Old school to make a scroll (discovering the coordinates and manke the scroll)*/
  // window.scrollTo({
  //   left: s1coords.left + window.pageXOffset, 
  //   top: s1coords.top + window.pageYOffset,
  //   behavior: 'smooth',
  // });

  /*New way of make a scroll*/
  section1.scrollIntoView({behavior: 'smooth'});
});

//* Event Delegation Implementing Page Navigation
//////////////////////////////////////
//Page Navigation

//Not efficient!
// document.querySelectorAll('.nav__link').forEach(function(el){
//   el.addEventListener('click', function(e){
//     e.preventDefault();
//     const id = this.getAttribute('href');
//     document.querySelector(id).scrollIntoView({behavior: 'smooth'});
//   });
// });

//1. Add event listener to common parent element
//2. Determine what element originated the event

document.querySelector('.nav__links').addEventListener('click', function(e){
  e.preventDefault();

  //Matching strategy: just clicks on links not in gaps or outside
  if(e.target.classList.contains('nav__link')){
    const id = e.target.getAttribute('href');
    document.querySelector(id).scrollIntoView({behavior: 'smooth'});
  }
});

//* Building a Tabbed Component
///////////////////////////////////
//Tabbed component
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

tabsContainer.addEventListener('click', function(e){
  const clicked = e.target.closest('.operations__tab');

  //Guard clause
  if(!clicked) return;

  //Remove active classes
  tabs.forEach(t => t.classList.remove('operations__tab--active'));
  tabsContent.forEach(c => c.classList.remove('operations__content--active'))

  //Active tab
  clicked.classList.add('operations__tab--active');

  //Activate content area
  document
  .querySelector(`.operations__content--${clicked
    .dataset.tab}`)
  .classList.add('operations__content--active');
  
})

//*Passing Arguments to Event Handlers
////////////////////////////////////
//Menu fade animation
const nav = document.querySelector('.nav');

const handleHover = function (e, opacity){
  if(e.target.classList.contains('nav__link')){
    const link = e.target;
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const log = link.closest('.nav').querySelector('img');
    
    siblings.forEach(el => {
      if (el !== link) el.style.opacity = opacity;
    });
    localStorage.style.opacity = opacity;
  }
}

nav.addEventListener('mouseover', function(e){
  handleHover(e, 0.5);
})

//nav.addEventListener('mouseover', handleHover.bind(0.5));

nav.addEventListener('mouseout', function(e){
  handleHover(e, 1);
})

//nav.addEventListener('mouseover', handleHover.bind(1));


//* Implementing a Sticky Navigation The Scroll Event
//////////////////////////////////

/*
//Sticky navigation
const initialCoords = section1.getBoundingClientRect();
window.addEventListener('scroll', function(e){
  if(this.window.scrollY > initialCoords.top) nav.classList.add('sticky')
  else nav.classList.remove('sticky');
})
*/

//* A Better Way The Intersection Observer API
/*Show how works the Int. Obs. API*/
/*
const obsCallback = function(entries, observer) {
  entries.forEach(entry => {
    console.log(entry);
  });
};

const obsOptions = {
  root: null,
  threshold: [0, 0.2],
};

const observer = new IntersectionObserver(obsCallback, obsOptions);
observer.observe(section1);
*/

const header = document.querySelector('.header');
const navHeight = nav.getBoundingClientRect().height;

const stickyNav = function(entries){
  const [entry] = entries;
  if(!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
}

const headerObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0,
  rootMargin: `-${navHeight}px`,
});
headerObserver.observe(header);

//*Revealing Elements on Scroll
///////////////////////////////

const allSections = document.querySelectorAll('.section')

const revealSection = function(entries, observer){
  const [entry] = entries;

  if(!entry.isIntersecting) return;
  entry.target.classList.remove('section--hidden'); //Remove style and show sections
  observer.unobserve(entry.target); //Not keep observe the sections
}

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
})

allSections.forEach(function(section){
  sectionObserver.observe(section);
  //section.classList.add('section--hidden');//Add hidden style to all sections
})

//* Lazy Loading Images
///////////////////////
const imgTargets = document.querySelectorAll('img[data-src]');

const loadImg = function(entries, observer){
  const [entry] = entries;

  if(!entry.isIntersecting) return;

  //Replace src with data-src
  entry.target.src = entry.target.dataset.src;
  entry.target.addEventListener('load', function(){
    entry.target.classList.remove('lazy-img');
  });

  observer.unobserve(entry.target);

};

const imgOberver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '-200px',
})

imgTargets.forEach( img => imgOberver.observe(img));



/****************************** Building a Slider **********************************/
//*Building a Slider Component Part 1
//Slider
const slider = function(){
  const slides = document.querySelectorAll('.slide');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnRight = document.querySelector('.slider__btn--right');
  const dotContainer = document.querySelector('.dots');

  let curSlide = 0;
  const maxSlide = slides.length;

  //Functions
  const createDots = function(){
    slides.forEach(function(_, i){
      dotContainer.insertAdjacentHTML(
        'beforeend', 
        `<button class="dots__dot" data-slide="${i}"></button>`)
    });
  };

  const activeteDots = function(slide){
    document.querySelectorAll('.dots__dot').forEach(dot => dot.classList.remove('dots__dot--active'));

    document.querySelector(`.dots__dot[data-slide="${slide}"]`).classList.add('dots__dot--active');
  }

  const goToSlide = function(slide){
    slides.forEach(
      (s,i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`));
  };

  //Next slide
  const nextSlide = function(){

    if(curSlide === (maxSlide - 1)){
      curSlide = 0;
    }else{
      curSlide++;
    }

    goToSlide(curSlide);
    activeteDots(curSlide);
  };

  const prevSlide = function(){
    if(curSlide === 0){
      curSlide = maxSlide - 1;
    }else {
      curSlide--;
    }
    goToSlide(curSlide);
    activeteDots(curSlide);
  }

  const init = function(){
    createDots();
    activeteDots(0);
    goToSlide(0);
  }
  init();

  //Event handlers
  btnRight.addEventListener('click', nextSlide)
  btnLeft.addEventListener('click', prevSlide);

  //*Building a Slider Component Part 2
  document.addEventListener('keydown', function(e){
    if(e.key === 'ArrowLeft') prevSlide();
    if(e.key === 'ArrowRight') nextSlide();
  });

  dotContainer.addEventListener('click', function(e){
    if(e.target.classList.contains('dots__dot')){
      const {slide} = e.target.dataset;
      goToSlide(slide);
      activeteDots(slide);
    }
  });
};
slider();
/************************************************************************************/










////////////////////////////////////////////////////////////////////////////////
//CLASSES

//* Selecting, Creating, and Deleting Elements




/*
console.log(document.documentElement);
console.log(document.head);
console.log(document.body);

const header = document.querySelector('.header');
const allSections = document.querySelectorAll('.section');
console.log(allSections);

document.getElementById('section--1');
const allButtons = document.getElementsByTagName('button');
console.log(allButtons);

const i = document.getElementsByClassName('btn');
console.log(i);

//Creating and inserting elements
const message = document.createElement('div');
message.classList.add('cookie-message');
message.textContent = "We use cookies for improved..."
message.innerHTML = 'We use cookies for improved... <button class="btn btn--close-cookie">Got it!</button>';

header.prepend(message);
header.append(message);
header.append(message.cloneNode(true));

header.before(message); //Insert before header
header.after(message); //Insert after header

//Delete elements
document.querySelector('.btn--close-cookie').addEventListener('click', function(){
  // message.remove();
  message.parentElement.removeChild(message);
});
*/

//* Styles, Attributes and Classes

/*
const header = document.querySelector('.header');


const message = document.createElement('div');
message.classList.add('cookie-message');
message.innerHTML = 'We use cookies for improved... <button class="btn btn--close-cookie">Got it!</button>';

header.append(message);

//Delete elements
document.querySelector('.btn--close-cookie').addEventListener('click', function(){
   message.remove();
  // message.parentElement.removeChild(message);
});

//Styles
message.style.backgroundColor = '#37383d';
message.style.width = '120%';

console.log(getComputedStyle(message).color);
console.log(getComputedStyle(message).height);

message.style.height = Number.parseFloat(getComputedStyle(message).height, 10) + 30 + 'px';

document.documentElement.style.setProperty('--color-primary', 'orangered');

//Attributes
const logo = document.querySelector('.nav__logo');
console.log(logo.alt);
console.log(logo.src);
console.log(logo.className);
//Non-standard
console.log(logo.designer);
logo.setAttribute('company', Bankist)
console.log(logo.getAttribute( 'company'));

const link = document.querySelector('.nav__Link--btn');
console.log(link.href);
console.log(link.getAttribute('href'));

//Data attributes
console.log(logo.dataset.versionNumber);

//Classes
logo.classList.add('c', 'j');
logo.classList.remove('c', 'j');
logo.classList.toggle('c');
logo.classList.contains('c');
//Don't use! Overwrite the contained classes
logo.className = 'jonas'
*/


//* Types of Events and Event Handlers

/*
const h1 = document.querySelector('h1');

const alertH1 = function(e){
  alert('addEventListener: Great! You are reading the heading :D');

  h1.removeEventListener('mouseenter', alertH1);
}

h1.addEventListener('mouseenter', alertH1);
*/

//*Event Propagation in Pratice

/*
const randomInt = (min, max) => Math.floor(Math.random() * (max - min +1) + min);
const randomColor = () => 
  `rgb(${randomInt(0,255)},${randomInt(0,255)},${randomInt(0,255)})`;
console.log(randomColor(0, 255));

document.querySelector('.nav__link').addEventListener('click', function(e){
  this.style.backgroundColor = randomColor();
  console.log('LINK', e.target, e.currentTarget);

  //Stop propagation - Not a good idea stop propagation
  //e.stopPropagation();

});

document.querySelector('.nav__links').addEventListener('click', function(e){
  this.style.backgroundColor = randomColor();
  console.log('LINKS', e.target, e.currentTarget);
});

document.querySelector('.nav').addEventListener('click', function(e){
  this.style.backgroundColor = randomColor();
  console.log('NAV', e.target, e.currentTarget); 
});
*/

//* DOM Traversing

/*
const h1 = document.querySelector('h1');

//Going downwards: child
console.log(h1.querySelectorAll('.highlight'));
//Only for direct children
console.log(h1.childNodes);
console.log(h1.children);

h1.firstElementChild.style.color = 'white';
h1.lastElementChild.style.color = 'orangered';

//Going upwards: parents
console.log(h1.parentNode);
console.log(h1.parentElement);

h1.closest('.header').style.background = 'var(--gradient-secondary)';
h1.closest('h1').style.background = 'var(--gradient-primary)';

//Going sideways: siblings; we can only access direct siblings
console.log(h1.previousElementSibling);
console.log(h1.nextElementSibling);

console.log(h1.previousSibling);
console.log(h1.nextSibling);

console.log(h1.parentElement.children);

[...h1.parentElement.children].forEach(function(el){
  if(el !== h1) el.style.transform = 'scale(0.5)';
})
*/

//* Lifecycle DOM Events

/*
document.addEventListener("DOMContentLoaded", function(e){
  console.log('HTML parsed and DOM tree built!', e);
});

window.addEventListener('load', function (e){
  console.log('Page fully loaded', e);
});

window.addEventListener('beforeunload', function(e){
  e.preventDefault();
  console.log(e);
  e.returnValue = 'message';
});
*/

//*Efficient Script Loading efer and async | Theory Class
