# 🚀 Guide de Déploiement GitHub - ChessMaster

## ✅ Étape 1 : Créer le dépôt GitHub

1. Allez sur https://github.com
2. Cliquez sur le bouton **"New repository"** (en haut à droite, bouton vert)
3. Remplissez les informations :
   - **Repository name** : `ChessMaster`
   - **Description** : `Application mobile full-stack de jeu d'échecs - React Native + FastAPI + Flutter`
   - **Public** ✅ (cochez cette option pour que ce soit visible sur votre profil)
   - **NE PAS** cocher "Add a README file" (on a déjà le nôtre)
   - **NE PAS** ajouter .gitignore (on a déjà le nôtre)
4. Cliquez sur **"Create repository"**
5. **Copiez l'URL du dépôt** qui apparaît (exemple : `https://github.com/[votre-username]/ChessMaster.git`)

---

## ✅ Étape 2 : Pousser le code sur GitHub

Ouvrez **PowerShell** dans le dossier `C:\ChessMaster` et exécutez ces commandes :

```powershell
# Configurer Git avec votre nom et email (si pas déjà fait)
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@emines.um6p.ma"

# Ajouter tous les fichiers
cd C:\ChessMaster
git add .

# Créer le premier commit
git commit -m "Initial commit - ChessMaster Mobile App

- React Native mobile app (16 screens)
- FastAPI backend (40+ endpoints)
- Node.js Gateway with WebSocket
- Flutter Dashboard
- AI chess engine with 5 difficulty levels
- 50+ tactical puzzles
- Full authentication system (JWT)
- Export to PGN/CSV/PDF
- Leaderboard and statistics
- Daily challenges
"

# Renommer la branche en 'main'
git branch -M main

# Ajouter le dépôt distant (REMPLACEZ [votre-username] par votre vrainom d'utilisateur GitHub)
git remote add origin https://github.com/[votre-username]/ChessMaster.git

# Pousser le code sur GitHub
git push -u origin main
```

**Note** : Lors du push, GitHub vous demandera de vous authentifier :
- Utilisez votre nom d'utilisateur GitHub
- Pour le mot de passe, utilisez un **Personal Access Token** (plus de mot de passe classique)

### Comment créer un Personal Access Token :

1. Sur GitHub, allez dans **Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**
2. Cliquez sur **"Generate new token"** > **"Generate new token (classic)"**
3. Donnez un nom : `ChessMaster Upload`
4. Cochez la permission : `repo` (Full control of private repositories)
5. Cliquez sur **"Generate token"**
6. **COPIEZ LE TOKEN** (vous ne pourrez plus le voir après !)
7. Utilisez ce token comme mot de passe lors du `git push`

---

## ✅ Étape 3 : Générer l'APK Android

Pour créer le fichier APK que vous pouvez partager :

```powershell
cd C:\ChessMaster\mobile

# Option 1 : Build APK local (sans compte Expo)
npx expo export:android

# Option 2 : Build APK avec EAS (compte Expo requis - RECOMMANDÉ)
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

**L'APK sera téléchargeable depuis votre compte Expo** après quelques minutes.

### Partager l'APK :

1. Téléchargez l'APK depuis le lien donné par EAS
2. Uploadez-le sur **Google Drive**
3. Cliquez sur "Obtenir le lien" et mettez "Accessible à toute personne disposant du lien"
4. **Copiez ce lien** pour le mettre dans votre formulaire de candidature

---

## ✅ Étape 4 : Créer un dossier de Screenshots (Optionnel mais recommandé)

```powershell
# Créer le dossier docs/screenshots
cd C:\ChessMaster
mkdir docs\screenshots

# Prenez des captures d'écran de l'application Expo Go sur votre téléphone
# Sauvegardez-les dans ce dossier avec des noms descriptifs :
# - home.png
# - login.png
# - game.png
# - puzzles.png
# - leaderboard.png
# - stats.png
```

Ensuite, ajoutez et poussez les screenshots :

```powershell
git add docs/screenshots/
git commit -m "Add app screenshots"
git push
```

---

## ✅ Résumé des Liens à fournir dans votre candidature

À la fin du processus, vous aurez :

1. **Lien GitHub** : `https://github.com/[votre-username]/ChessMaster`
2. **Lien APK** : `https://drive.google.com/file/d/XXXXX/view?usp=sharing`
3. **Démo vidéo** (optionnel) : Lien YouTube si vous enregistrez une démo

---

## 🎯 Template de réponse pour le formulaire

Copiez-collez ceci dans la section "Fichiers justificatifs" :

```
📁 Code Source Complet :
https://github.com/[votre-username]/ChessMaster

📱 APK Android (Téléchargement direct) :
https://drive.google.com/file/d/XXXXX/view?usp=sharing

📖 Documentation :
README complet avec architecture, stack technique, et guide d'installation disponible sur GitHub

📊 Statistiques du projet :
- 15 000+ lignes de code
- 16 écrans React Native
- 40+ endpoints API REST
- 50+ puzzles tactiques intégrés
- Architecture microservices complète
```

---

## ✅ Commandes de Vérification

Pour vérifier que tout est OK :

```powershell
# Vérifier le statut Git
git status

# Voir l'historique des commits
git log --oneline

# Vérifier le dépôt distant
git remote -v

# Vérifier que le push a fonctionné
git log origin/main
```

---

## 🆘 Problèmes Courants

### Erreur "Permission denied"
→ Vérifiez votre Personal Access Token

### Erreur "Repository not found"
→ Vérifiez que l'URL du remote est correcte : `git remote -v`
→ Modifiez-la si nécessaire : `git remote set-url origin https://github.com/[username]/ChessMaster.git`

### Fichiers trop gros
→ Vérifiez que node_modules/ et venv/ sont bien ignorés dans .gitignore

---

**Bonne chance avec votre candidature OCP Khouribga ! 🚀**
