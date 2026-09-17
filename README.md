# Frontend Mentor - Typing Speed Test solution

This is a solution to the [Typing Speed Test challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/typing-speed-test). Frontend Mentor challenges help you improve your coding skills by building realistic projects. 

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-I-learned)
  - [AI Collaboration](#ai-collaboration)
- [Author](#author)

## Overview

### The challenge

Users should be able to:

- Start a test by clicking the start button or by clicking the passage and typing
- Select a difficulty level (Easy, Medium, Hard) for passages of varying complexity pulled dynamically from a `data.json` file
- Switch between "Timed (60s)" mode and "Passage" mode (timer counts up with no limit)
- See real-time WPM, accuracy, and time stats while typing
- See visual feedback showing correct characters (green), errors (red/underlined), and cursor position with a blinking indicator
- Correct mistakes with backspace (original errors still count against accuracy)
- View results showing WPM, accuracy, and characters (correct/incorrect) after completing a test
- See a "Baseline Established!" message on their first test, or a "High Score Smashed!" celebration when beating their personal best
- Have their personal best persist across browser sessions via `localStorage`
- View the optimal layout depending on their device's screen size with responsive design
- See hover and focus states for all interactive elements

### Screenshot

![](./preview.jpg)

### Links

- Solution URL: [Add solution URL here](https://your-solution-url.com)
- Live Site URL: [Add live site URL here](https://your-live-site-url.com)

## My process

### Built with

- Semantic HTML5 markup
- CSS custom properties (HSL color palette)
- Flexbox & Grid for layout
- Vanilla JavaScript (DOM manipulation and event handling)
- Local font hosting (Sora font via `@font-face`)
- Mobile-first workflow

### What I learned

Working on this project was a great opportunity to practice handling precise real-time event listeners and state management in Vanilla JavaScript. A key highlight was implementing the character-by-character validation logic:

```javascript
if (inputChar === targetChar) {
  state.chars[state.currentIndex].classList.add('correct');
} else {
  state.chars[state.currentIndex].classList.add('incorrect');
  state.mistakes++;
}