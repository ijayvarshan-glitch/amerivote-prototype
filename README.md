# 🦅 AmeriVote (Project Prototype)

A secure, universally accessible digital voting infrastructure prototype designed specifically for two massive but politically disenfranchised groups: **global expatriates** and **elderly citizens**. 

This repository contains a functional, self-contained frontend application built using **React (JSX)**. It simulates the core user interfaces, biometric/identity check-in loops, real-time vote aggregation dashboards, and running cryptographic background audit logs required for a modern GovTech voting architecture.

---

## 💡 The Inspiration (Why This Matters)
The vision for AmeriVote is deeply personal. Having relocated from India to the United States following my father’s international corporate job transfer, I grew up surrounded by the expat community. I witnessed firsthand how disconnected global citizens can become from their home country’s democratic processes due to slow physical mail-in ballots, legacy paper trails, and overwhelming manual paperwork. 

At the same time, existing digital solutions completely ignore the physical and cognitive user-experience (UI/UX) needs of older generations. AmeriVote solves this dual-front crisis by combining airtight mobile security gates with a radically simplified, high-contrast, large-font interface that any citizen—or their grandparent—can navigate with absolute confidence.

---

## 🛠️ Implemented Prototype Features
The provided `AmeriVote_project_prototype.jsx` file is structured as a single-file application with zero external runtime database dependencies, utilizing an optimized, reactive in-memory state architecture to model:

* **Voter Check-In & Identity Gates:** Features a simulated registration engine mapped to mock state verification vectors, incorporating a custom One-Time Passcode (OTP) verification framework.
* **Radically Simplified Ballot Interface:** High-contrast layout components utilizing clean color hierarchies, large interactive selection cards, and strict linear navigation paths engineered for accessibility.
* **Cryptographic Bulletin Board Logs:** Generates real-time unique ballot receipt strings and SHA-256 style mock transaction hashes, demonstrating public transparency while preserving absolute voter privacy.
* **Real-Time Election Management & Tally Dashboard:** A live, back-end console layout for election officials that calculates running vote totals, visualizes candidate margins, maps voter registries, and appends background events to a running, tamper-evident **Audit Trail Log**.
* **Production Readiness Assessment Engine:** An interactive compliance tracker comparing this front-end mockup directly against enterprise standard requirements, mapping future development pathways to **CISA Infrastructure Guidelines, NIST FIPS 140-2, and EAC VVSG 2.0 Audits**.

---

## 🧱 Code Architecture & Palette Constants
The application UI utilizes a dedicated dark-mode color schema designed to mimic high-security corporate voting consoles:
```javascript
const C = {
  bg:         "#070F1E", // Deep Security Blue
  card:       "#0D1E35", // Raised Panel Accent
  red:        "#B22234", // Old Glory Red Accent
  blueLight:  "#2A5AAA", // Primary Action Blue
  gold:       "#C8970A", // Legislative Gold Accent
  success:    "#1E9E60", // Audit Approved Green
};
