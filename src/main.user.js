// ==UserScript==
// @name        Enhanced hwr-berlin.de timetable/Stundenplan ⏱️📚
// @description Focus on the current day and lightly suppress past events.
// @namespace   https://github.com/bucherfa/enhanced-hwr-timetable
// @include     https://ipool.lehre.hwr-berlin.de/data/stundenplan/*
// @include     https://moodle.hwr-berlin.de/fb2-stundenplan/stundenplan.php
// @license     GPL-3.0-or-later
// @version     1
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
    } else if (key === today) {
      //for (const event of days[key]) {
        // :)
      //}
    } else {
      for (const event of days[key]) {
        event.style.opacity = '60%';
      }
    }
  }
}

// for https://moodle.hwr-berlin.de/fb2-stundenplan/stundenplan.php
const courseSelector = document.querySelector('select[name="course"]');
if (courseSelector) {
  courseSelector.addEventListener('change', () => {setTimeout(main, 500)});
}

function parseEvents() {
  const days = {}
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
