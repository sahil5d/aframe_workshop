var log = console.log;
var d = document;
d.f = document.querySelector;
d.c = document.createElement;

var thescene = d.f('a-scene');
if (thescene.hasLoaded) {
    allthecode();
} else {
    thescene.addEventListener('loaded', allthecode);
}

function allthecode() {
    d.f('#thefloor').setAttribute('position', { x: 0, y: .1, z: 0 });


}