// ==UserScript==
// @name        Enhanced hwr-berlin.de Timetable/Stundenplan ⏱️📚
// @description Focus on the current day and lightly suppress past events. Source code: https://github.com/bucherfa/enhanced-hwr-timetable
// @namespace   https://github.com/bucherfa/enhanced-hwr-timetable
// @homepageURL https://github.com/bucherfa/enhanced-hwr-timetable
// @supportURL  https://github.com/bucherfa/enhanced-hwr-timetable/issues
// @updateURL   https://github.com/bucherfa/enhanced-hwr-timetable/raw/master/src/main.user.js
// @author      bucherfa
// @include     https://ipool.lehre.hwr-berlin.de/data/stundenplan/*
// @include     https://moodle.hwr-berlin.de/fb2-stundenplan/stundenplan.php
// @license     GPL-3.0-or-later
// @version     1.0.1
// @grant       none
// ==/UserScript==

const monthAbbreviation = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

function main() {
  const days = parseEvents();
  const today = todayString();
  for (const key of Object.keys(days)) {
    if (key < today) {
      for (const event of days[key]) {
        event.style.borderStyle = 'dashed';
        event.style.opacity = '40%';
      }
    } /*else if (key === today) {
      for (const event of days[key]) {
        // :)
      }
    } else {
      for (const event of days[key]) {
        //event.style.borderWidth = '0';
      }
    }*/
  }
  const todayColumn = todayColumnElements();
  for (const element of todayColumn.greenish) {
    element.style.backgroundColor = '#EDEDE9';
  }
  for (const element of todayColumn.purple) {
    element.style.backgroundColor = '#E9E9ED';
  }
  if (window.location.href.includes('https://ipool.lehre.hwr-berlin.de/data/stundenplan/')) {
    buildMobileFriendlyPage();
  }
}

// for https://moodle.hwr-berlin.de/fb2-stundenplan/stundenplan.php
const courseSelector = document.querySelector('select[name="course"]');
if (courseSelector) {
  courseSelector.addEventListener('change', () => { setTimeout(main, 500) });
}

function buildMobileFriendlyPage() {
  console.log('Hello World!');
  addMobileMetaTag();
}

function addMobileMetaTag() {
  const meta = document.createElement('meta');
  meta.name = "viewport";
  meta.content = "width=device-width, initial-scale=1";
  document.getElementsByTagName('head')[0].appendChild(meta);
}

function todayColumnElements() {
  const elements = { meta: [], purple: [], greenish: [] };
  const today = todayString();
  const weeksTables = document.querySelectorAll('table');
  for (const weekTable of weeksTables) {
    if (elements.length > 0) {
      break;
    }
    let minElementOffset;
    let maxElementOffset;
    const weekDayElements = weekTable.querySelectorAll('.t');
    for (const weekDayElement of weekDayElements) {
      const unparsedWeekDayText = weekDayElement.innerText.split(', ')[1];
      const parsedWeekDayText = parseDate(unparsedWeekDayText);
      if (parsedWeekDayText === today) {
        minElementOffset = Math.round(weekDayElement.getBoundingClientRect().x);
        maxElementOffset = minElementOffset + weekDayElement.offsetWidth;
      }
    }
    const EventElements = weekTable.querySelectorAll('td');
    for (const eventElement of EventElements) {
      const eventElementOffset = Math.round(eventElement.getBoundingClientRect().x);
      if (eventElementOffset >= minElementOffset && eventElementOffset < maxElementOffset) {
        switch(eventElement.classList[0]) {
          case 'rd2':
          case 'rdl2':
          case 'rdm2':
          case 'rdr2':
            elements.greenish.push(eventElement);
            break;
          case 'rd1':
          case 'rdl1':
          case 'rdm1':
          case 'rdr1':
            elements.purple.push(eventElement);
            break;
          case 't':
          case 'tf':
            elements.meta.push(eventElement);
            break;
          default:
            // nothing
        }
      }
    }
  }
  return elements;
}

function parseEvents() {
  const days = {};
  const weeksTables = document.querySelectorAll('table');
  for (const weekTable of weeksTables) {
    const weekDayElementOffsets = {};
    const weekDayElements = weekTable.querySelectorAll('.t');
    for (const weekDayElement of weekDayElements) {
      const weekDayElementOffset = Math.round(weekDayElement.getBoundingClientRect().x);
      const unparsedWeekDayText = weekDayElement.innerText.split(', ')[1];
      const parsedWeekDayText = parseDate(unparsedWeekDayText);
      weekDayElementOffsets[weekDayElementOffset] = parsedWeekDayText;
      days[parsedWeekDayText] = [];
    }
    const EventElements = weekTable.querySelectorAll('.v');
    for (const eventElement of EventElements) {
      const eventElementOffset = Math.round(eventElement.getBoundingClientRect().x) - 5;
      days[weekDayElementOffsets[eventElementOffset]].push(eventElement);
    }
  }
  return days;
}

function parseDate(text) {
  const array = text.split(' ');
  const day = array[0].slice(0, -1);
  let month = monthAbbreviation.indexOf(array[1]) + 1;
  if (month < 10) {
    month = '0' + month;
  }
  const year = array[2];
  return `${year}-${month}-${day}`;
}

function todayString() {
  return new Date().toISOString().split('T')[0];
}

main();
