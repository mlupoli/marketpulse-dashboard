# Deploying MarketPulse to the Cloud

To access your dashboard from anywhere (even when your computer is off), you need to host it on a platform like **Render**, **Railway**, or **Heroku**.

## Option 1: Render (Recommended & Free)

1.  **Create a GitHub Repository**:
    -   Create a new private repository on [GitHub](https://github.com/new).
    -   Upload the contents of the `marketpulse-logic` folder to this repository.
    -   Ensure the `public` folder (containing `index.html`) is included.

2.  **Connect to Render**:
    -   Go to [Render.com](https://render.com) and create a free account.
    -   Click **New +** > **Web Service**.
    -   Connect your GitHub account and select the `marketpulse-logic` repository.

3.  **Configure the Service**:
    -   **Name**: `marketpulse-dashboard`
    -   **Environment**: `Node`
    -   **Build Command**: `npm install`
    -   **Start Command**: `npm start`
    -   **Plan**: `Free`

4.  **Deploy**:
    -   Render will automatically deploy the app.
    -   Once finished, you will receive a URL like `https://marketpulse-dashboard.onrender.com`.

## Option 2: Railway

1.  Similar to Render, connect your GitHub repo.
2.  Railway will detect the `package.json` and deploy automatically.
3.  Add a custom domain or use the generated railway.app subdomain.

## Why this works?
-   The server is 100% self-contained in the `marketpulse-logic` folder.
-   The frontend is served automatically from the `public` directory.
-   External APIs (Yahoo Finance mock, CoinGecko, RSS) are accessed directly from the cloud server.
