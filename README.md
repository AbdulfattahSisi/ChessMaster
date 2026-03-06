# ♟️ ChessMaster - Application Mobile Full-Stack

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

> **Application mobile de gestion de parties d'échecs** - Projet personnel développé en autodidacte pour maîtriser le développement mobile full-stack.

---

## 📱 Description

**ChessMaster** est une application mobile complète permettant de jouer aux échecs contre une IA, résoudre des puzzles tactiques, apprendre des ouvertures théoriques, et suivre sa progression avec statistiques et leaderboards.

**Développée par** : Iliass - Élève Ingénieur 4ème année EMINES  
**Contexte** : Projet personnel d'entrepreneuriat - Auto-formation au développement mobile  
**Durée** : 2 mois

---

## ✨ Fonctionnalités

- ♟️ **Jeu contre IA** - 5 niveaux de difficulté (Débutant 800 ELO → Master 2400 ELO)
- 🧩 **Puzzles Tactiques** - 50+ puzzles classés par catégorie et difficulté
- 📚 **Bibliothèque d'Ouvertures** - Catalogue complet des ouvertures théoriques
- 📊 **Statistiques & Progression** - Tableau de bord avec analytics détaillés
- 🏆 **Leaderboard Global** - Classement ELO en temps réel
- 🔍 **Révision de Parties** - Analyse automatique avec calcul de précision
- 🎯 **Défis Quotidiens** - Challenges journaliers avec récompenses XP
- 🎨 **Interface Moderne** - Design premium avec vector icons et animations
- 📤 **Export Multi-Format** - PGN, CSV, PDF
- 🔐 **Authentification Complète** - JWT, gestion de profils, rôles

---

## 🏗️ Architecture

### Stack Technique

**Mobile** : React Native (Expo SDK 50), React Navigation 6, Context API, AsyncStorage, Axios  
**Backend** : FastAPI (Python 3.13), SQLAlchemy 2.0, SQLite, JWT, python-chess  
**Gateway** : Node.js Express, WebSocket (ws), http-proxy-middleware  
**Dashboard** : Flutter/Dart, Provider, Material Design

### Structure

```
ChessMaster/
├── mobile/         # React Native (16 screens, 6 components)
├── backend/        # FastAPI (40+ endpoints, 10 models)
├── gateway/        # Node.js Express (proxy + WebSocket)
└── dashboard/      # Flutter Web (admin panel)
```

---

## 🚀 Installation

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Gateway (Node.js)
```bash
cd gateway
npm install
node server.js
```

### 3. Mobile (React Native)
```bash
cd mobile
npm install
npx expo start --tunnel
```

**Scannez le QR code** avec **Expo Go** sur votre smartphone !

---

## 📊 Statistiques du Projet

- **Lignes de code** : ~15 000+
- **Screens** : 16 écrans React Native
- **Components** : 6 composants réutilisables
- **API Endpoints** : 40+ routes REST
- **Database Models** : 10 tables SQLAlchemy
- **Puzzles** : 50+ puzzles tactiques
- **Ouvertures** : 40+ variantes
- **Tests** : 54 issues résolues

---

## 🎯 Compétences Acquises

### Frontend Mobile
✅ React Native & Expo  
✅ Navigation multi-écrans (Stack, Tabs)  
✅ Gestion d'état (Context API, AsyncStorage)  
✅ Intégration API REST  
✅ Animations (Reanimated)  
✅ UI/UX moderne avec @expo/vector-icons  

### Backend
✅ FastAPI & architecture REST  
✅ SQLAlchemy ORM  
✅ Authentification JWT  
✅ Moteur d'IA (python-chess)  
✅ Export multi-format (PGN, CSV, PDF)  

### Architecture
✅ Microservices (Mobile → Gateway → Backend)  
✅ WebSocket temps réel  
✅ Dashboard administratif  

---

## ‍💻 Auteur

**Iliass**  
Élève Ingénieur 4ème année - EMINES  
📧 Email : [iliass.AitAli@emines.um6p.ma](mailto:iliass.AitAli@emines.um6p.ma)  
💼 Projet réalisé dans le cadre d'un acte d'entrepreneuriat  

---

## 📄 Licence

Projet personnel à but éducatif et portfolio.

---

**⭐ Projet développé pour maîtriser React Native et le développement mobile full-stack**
