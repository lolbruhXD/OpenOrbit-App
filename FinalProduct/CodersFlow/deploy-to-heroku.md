# Deploy Backend to Heroku

## Step 1: Install Heroku CLI
1. Download from: https://devcenter.heroku.com/articles/heroku-cli
2. Login: `heroku login`

## Step 2: Prepare Backend for Heroku
1. Add `Procfile` to backend directory:
   ```
   web: node server.js
   ```

2. Update `package.json` scripts:
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     }
   }
   ```

## Step 3: Deploy
```bash
cd CodersFlow/backend/backend
heroku create your-app-name
git add .
git commit -m "Deploy backend"
git push heroku main
```

## Step 4: Update Mobile App
Update `api.js` with your Heroku URL:
```javascript
BASE_URL: 'https://your-app-name.herokuapp.com/api'
```
