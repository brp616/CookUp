This project CookUp was created for MIT Weblab 2026 by Ben Plotnik and Xuan Yi Ng. Huge thanks to the whole Weblab team for their support, our chefs in the test kitchen and Yannawut Kimranuk for this great guide that helped us get our recommender off the ground:
https://yannawut.medium.com/basic-content-based-recommendation-system-with-python-code-be920b412067. This is a project for personal use and we do not claim to own all the IP here, see below for full attributions:

Front end/full stack tools:
* React.js
* Node.js/vite & Express: primary web servers to help us delegate some of those tasks, make routes pretty simply
* deployed on render @ https://cookup-1gl6.onrender.com/
* pretty minor, but used cheerio web scraper to get info on recipes pulled from other websites

Database/storage/other APIs:
* MongoDB for most data
* Cloudinary for image uploads
* Google OAuth for logins

Python backend:
* FastAPI: MWeb framework for building APIs with Python
* Uvicorn: server implementation, used to serve the FastAPI application/run the app
* PyMongo: The official Python driver for MongoDB, used for database interactions.
* Full python requirements:
* fastapi
* uvicorn
* pymongo
* pandas
* scikit-learn
* python-dotenv
* numpy

Attributions/code citation:
*we pulled a lot of standard formatting for react/node.js from Weblab materials
*LLMs (Gemini, ChatGPT, GitHub copilot in VS code) used to better understand project structure/give some skeletons of code + debug problems and learn functions
*Once again, recommendation system based on this article from https://yannawut.medium.com/basic-content-based-recommendation-system-with-python-code-be920b412067. how it works:
1. Vectorization: Put our data in a format python can actually use.
2. Scoring Logic: Recipes are ranked based on similarity from likes/yums, followed users, and more with a time dimension for all public posts in the DB
3. Data Pipeline:
   - FastAPI receives the request from the Node.js gateway.
   - PyMongo fetches relevant recipe candidates from MongoDB.
   - The Predict Module (`recommender/predict.py`) calculates similarity scores.
   - Results are returned as JSON, allowing the React frontend to render them instantly.

Example screenshots:
<p align="center">
  <img src="./Screenshot 2026-01-26 121353.png" width="800px" alt="CookUp Interface 1">
</p>
<p align="center">
  <img src=".Screenshot 2026-01-26 121431.png" width="800px" alt="CookUp Interface 2">
</p>

BSON: Used for handling MongoDB's Binary JSON data types (like ObjectId).
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
