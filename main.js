// Importiere die notwendigen Bibliotheken
import 'swiped-events';

const t1_r = "A car produces 100kg CO2 per hour"
const t2_r = (value)=>`This tree intakes only ${value || '999'}kg CO2 per hour`
const t3_r = (value)=>`${value || '999'} more trees required to get rid of CO2`

const t1_l = "You breath 960 times per hour"
const t2_l = (value)=>`This tree produces O2 for only ${value || '999'} breaths`
const t3_l = (value)=>`${value || '999'} more trees required to cover your need`;

let text_top;
let text_middle;
let text_bottom;

// Warte bis das Document fertig geladen ist
document.querySelector('a-scene').addEventListener('loaded', () => {

    text_top = document.getElementById("text_top");
    text_middle = document.getElementById("text_middle");
    text_bottom = document.getElementById("text_bottom");

    if (text_top) text_top.setAttribute("value", t1_r);
    if (text_middle) text_middle.setAttribute("value", t2_r('4'));
    if (text_bottom) text_bottom.setAttribute("value", t3_r('24'));
});


let position = 0;

document.addEventListener('swiped-left', () => {
    if (position === 0){
        if (text_top) text_top.setAttribute("value", t1_l);
        if (text_middle) text_middle.setAttribute("value", t2_l('35'));
        if (text_bottom) text_bottom.setAttribute("value", t3_l('26'));

        position ++;
    }
});

document.addEventListener('swiped-right', () => {
    if (position === 1){
        if (text_top) text_top.setAttribute("value", t1_r);
        if (text_middle) text_middle.setAttribute("value", t2_r('4'));
        if (text_bottom) text_bottom.setAttribute("value", t3_r('24'));

        position --;
    }
})