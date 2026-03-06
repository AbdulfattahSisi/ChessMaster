# 🎯 INSTRUCTIONS POUR POUSSER SUR GITHUB

## ✅ Ce qui a été fait :

1. ✅ Git configuré avec votre nom et email
2. ✅ 97 fichiers ajoutés au staging
3. ✅ Commit initial créé (29,269 lignes de code)
4. ✅ Branche renommée en 'main'

---

## 🚀 PROCHAINES ÉTAPES (À FAIRE MAINTENANT)

### Étape 1 : Créer le dépôt sur GitHub.com

1. Allez sur **https://github.com**
2. Connectez-vous à votre compte (ou créez-en un gratuit)
3. Cliquez sur le bouton vert **"New"** ou **"New repository"** en haut à droite
4. Remplissez :
   - **Repository name** : `ChessMaster`
   - **Description** : `Application mobile full-stack de jeu d'échecs - React Native + FastAPI + Flutter - Portfolio MyEPI OCP Khouribga`
   - **Public** ✅ (cochez cette option)
   - **NE PAS** cocher "Add a README file"
   - **NE PAS** cocher "Add .gitignore"
5. Cliquez sur **"Create repository"**

### Étape 2 : Copier votre username GitHub

Notez votre **username GitHub** (visible en haut à droite sur GitHub.com)

### Étape 3 : Exécuter ces commandes

**REMPLACEZ `[VOTRE-USERNAME]` par votre vrai username GitHub** puis exécutez dans PowerShell :

```powershell
cd C:\ChessMaster

# Ajouter le dépôt distant (REMPLACEZ [VOTRE-USERNAME])
git remote add origin https://github.com/[VOTRE-USERNAME]/ChessMaster.git

# Pousser le code sur GitHub
git push -u origin main
```

### Étape 4 : Authentification GitHub

Lors du `git push`, GitHub vous demandera de vous authentifier.

**Option 1 - GitHub Desktop (recommandé pour débutants)** :
- Téléchargez GitHub Desktop : https://desktop.github.com/
- Connectez-vous avec votre compte
- Faites le push via l'interface graphique

**Option 2 - Personal Access Token (ligne de commande)** :
1. Sur GitHub.com : **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Cliquez **"Generate new token"** → **"Generate new token (classic)"**
3. Nom : `ChessMaster Upload`
4. Cochez : `repo` (Full control of private repositories)
5. Générez et **COPIEZ LE TOKEN** (vous ne pourrez plus le voir !)
6. Lors du `git push`, utilisez :
   - Username : votre username GitHub
   - Password : **collez le token** (pas votre mot de passe)

---

## 📱 Étape suivante : Générer l'APK Android

Une fois le code poussé sur GitHub, générez l'APK :

```powershell
cd C:\ChessMaster\mobile

# Installer EAS CLI (une seule fois)
npm install -g eas-cli

# Se connecter à Expo (créez un compte gratuit sur expo.dev)
eas login

# Lancer le build APK
eas build --platform android --profile preview
```

Le build prendra ~10-15 minutes. Un lien de téléchargement vous sera fourni.

---

## 📎 Upload de l'APK sur Google Drive

1. Téléchargez l'APK depuis le lien Expo
2. Uploadez sur **Google Drive**
3. Clic droit → **Partager** → "Accessible à toute personne disposant du lien"
4. **Copiez le lien de partage**

---

## 📝 Remplir le formulaire de candidature

Une fois GitHub et l'APK prêts, ouvrez :
- **`CANDIDATURE_REPONSES.md`** pour copier vos réponses

N'oubliez pas de remplacer :
- `[VOTRE-USERNAME]` → votre username GitHub
- `XXXXX` → l'ID de votre fichier APK sur Drive

---

## ✅ Checklist finale

- [ ] Dépôt créé sur GitHub.com (public)
- [ ] Commande `git remote add origin` exécutée (avec votre username)
- [ ] Commande `git push -u origin main` exécutée avec succès
- [ ] Vérification : votre code est visible sur `https://github.com/[username]/ChessMaster`
- [ ] APK généré via `eas build`
- [ ] APK uploadé sur Google Drive avec lien de partage
- [ ] Réponses du formulaire copiées depuis `CANDIDATURE_REPONSES.md`
- [ ] Liens GitHub et Drive remplacés dans les réponses

---

**🎯 Vous êtes presque prêt ! Plus que quelques commandes et votre portfolio sera en ligne.**

Si vous rencontrez un problème, relisez le fichier `DEPLOYMENT_GUIDE.md` pour plus de détails.
