# Changelog

The version is shown in the bottom-right corner of the app. Bump it with every change
(`npm version patch|minor|major --no-git-tag-version`) and add an entry here.

## 2.2.0

- New logo and browser icon (ear with sound waves), also as home-screen icon on iPhone
- Removed the unused photo slots on the mode cards (no more 404 errors)

## 2.1.1

- Fixed: the settings tooltip was hidden behind the high score card

## 2.1.0

- Version number in the bottom-right corner

## 2.0.0

- Restructured into a Vite + TypeScript + SCSS project with unit and end-to-end tests, CI and GitHub Pages deployment
- Quiz types are self-contained modules, so new (also non-numeric) quizzes plug in without engine changes

## 1.5.0

- Region Switzerland (phone numbers, Franken and Rappen, Swiss sentences)
- Edge: rotate through all Microsoft voices; voice preview with stop button
- Sentence overview in the settings; replaying keeps the cursor in the answer field; "Prüfen" stops the voice

## 1.4.0

- Forgiving typed answers (month names, 12-hour times with a warning, spaces and dashes, + and 00)
- Board marks each digit as right, wrong or near
- Many more sentence templates, scoring rules in a modal, tooltips for the difficulty levels

## 1.3.0

- Arcade-style redesign: ring timer, score pop-ups, stars, confetti, sound effects

## 1.2.0

- Scoring by the millisecond, compact two-column layout that fits a 13" laptop

## 1.1.0

- Rounds of 10 questions with timer, difficulty levels, results and high scores

## 1.0.0

- First version: listening practice for times, phone numbers, numbers, prices and dates
