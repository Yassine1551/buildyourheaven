# Build Your Heaven

An Islamic worship companion app built with React Native (Expo).

## Features

- **Daily Adhkar**: Morning, evening, sleep, and wake-up remembrances with interactive counters
- **Quran**: Browse surahs and read Quranic verses
- **Prayer Tracker**: Track your 5 daily prayers with times
- **Digital Tasbeeh**: Count your dhikr
- **Duas**: Collection of daily duas
- **Leaderboard**: Track your worship streaks and rankings
- **Badges**: Earn achievements for consistency
- **Notifications**: Prayer reminders and adhkar alerts

## Tech Stack

- React Native (Expo SDK 52)
- Expo Router (file-based routing)
- TypeScript
- Android (native)

## Getting Started

```bash
npm install
npx expo start
```

Build for Android:

```bash
npx expo run:android
```

## Project Structure

```
app/               # Expo Router screens
  (tabs)/          # Bottom tab navigation
    index.tsx      # Home screen
    quran.tsx      # Quran browser
    rankings.tsx   # Leaderboard
    badges.tsx     # Achievements
    notifications.tsx # Settings
  _layout.tsx      # Root layout
constants/         # Data files (verses, etc.)
template/          # Templates (auth, UI)
android/           # Android native project
scripts/           # Build/utility scripts
```
