# Zwapy Video Conferencing

Zwapy's own built-in video calling for skill exchange sessions — no Zoom/Meet, peer-to-peer WebRTC on our own backend.

## Status

**Phase 1 — Done ✅**
P2P video calls via `/call/[roomId]`, with mute, camera toggle, end call, and local recording. Tested working between two browsers.

**Phase 2 — In progress 🚧**
Live captions (Web Speech API) + transcript saved to Firestore as session notes.

**Phase 3 & Safety layer — Not started**
AI session summaries, content moderation, university email verification, one-strike policy.

## Stack

Next.js + React + TypeScript + Tailwind · Node/Express + Socket.io (signaling) · Firebase Firestore (transcripts) · WebRTC (peer-to-peer video)

## Run locally

```bash
cd backend && npm install && node server.js     # localhost:5000
cd frontend && npm install && npm run dev       # localhost:3000
```

Open `localhost:3000/call/test-room` in two browser windows to test a call.

## Known limitations

- No TURN server yet — works on normal networks, may fail on strict firewalls
- Captions: Chrome/Edge only
- Firestore is in test mode — needs security rules before real user data goes in
-
