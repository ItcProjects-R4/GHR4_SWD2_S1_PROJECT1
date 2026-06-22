<div align="center">

# 🍽️ Restaurant Finder

### AI-Powered Restaurant Discovery & Management Platform

Find restaurants based on your mood, budget, dietary restrictions, and health conditions.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-Latest-purple?logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-API-black?logo=express)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38B2AC?logo=tailwind-css)
![Yelp API](https://img.shields.io/badge/Yelp-Fusion_API-red?logo=yelp)

[🎥 Demo](#-project-demo) • [🚀 Features](#-key-features) • [🏗 Architecture](#️-system-architecture) • [⚙ Installation](#️-installation)

</div>

## 📸 Application Preview

![Home Page](docs/home.png)


## 🤖 Smart Assistant Workflow

```mermaid
flowchart TD
A[Start Survey]
B[Mood]
C[Cuisine]
D[Budget]
E[Dietary Restrictions]
F[Medical Conditions]
G[Party Size]
H[Generate Recommendations]

A --> B
B --> C
C --> D
D --> E
E --> F
F --> G
G --> H

---

## Architecture Diagram

```md
## 🏗️ System Architecture

```mermaid
flowchart LR

User --> React

React --> Express

Express --> YelpAPI

React --> LocalStorage

YelpAPI[(Yelp API)]
LocalStorage[(Local Storage)]


---

## Screenshots Gallery

```md
# 📷 Screenshots

### Home Page

![Home](docs/home.png.jpeg)

### Explore Restaurants

![Explore](docs/explore.png.jpeg)

### Smart Assistant

![Assistant](docs/assistant.png.jpeg)

### Restaurant Details

![Details](docs/details.png.jpeg)

### Admin Dashboard

![Admin](docs/admin.png.jpeg)

# 🛠 Technology Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router v7
- React Hook Form
- Zod
- Radix UI
- Lucide React

### Backend

- Node.js
- Express.js
- CORS
- Dotenv

### External Services

- Yelp Fusion API

### Storage

- Browser LocalStorage

# 📊 Project Statistics

| Metric | Count |
|----------|----------|
| Pages | 8 |
| Components | 20+ |
| UI Components | 50+ |
| API Endpoints | 8 |
| Architecture Layers | 3 |
| Supported Devices | Mobile, Tablet, Desktop |

# 🎥 Project Demo

### Watch Full Demonstration

https://drive.google.com/file/d/1DA0ZYz1VIjd1vn0PAGi09J6fxasrujPV/view

# 👥 Team Members

| Name |
|--------|--------|
| Ahmed Yehia | Frontend Developer |
| Shahd Elhewey |
| Mohamed Mostafa |

---

<div align="center">

### ⭐ If you like this project, give it a star!

Restaurant Finder © 2026

Built with ❤️ using React, Node.js and Yelp Fusion API

</div>
