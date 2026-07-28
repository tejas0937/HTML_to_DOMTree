# HTML to DOM Tree

A simple full-stack app that accepts raw HTML, sends it to a Node/Express backend, and renders the parsed DOM as a nested tree in a React frontend.

## Project structure

- client/ — React + Vite frontend
- server/ — Express backend

## Setup

1. Install dependencies from the project root:
   ```bash
   npm install
   ```
2. Start both apps concurrently:
   ```bash
   npm run dev
   ```
3. Open the frontend at http://localhost:5173
4. The backend will run at http://localhost:3001

## API

POST /api/parse-dom

Request body:
```json
{
  "html": "<div><h1>Hello</h1></div>"
}
```

Response:
```json
{
  "tag": "html",
  "attributes": {},
  "children": []
}
```
