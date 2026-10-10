# InventoryHub

A lightweight full-stack inventory dashboard built with Node.js and vanilla HTML, CSS, and JavaScript. It is designed as a learning/demo project for front-end/back-end integration, JSON API responses, debugging, and performance-conscious implementation.

## Requirements

- Node.js 18 or newer
- No third-party Node packages required

## Run locally

1. Extract the ZIP file.
2. Open a terminal in the `InventoryHub` folder.
3. Run:

   ```bash
   npm start
   ```

4. Open <http://localhost:3000> in your browser.

## Features

- Responsive inventory dashboard
- Product totals, stock quantity, estimated inventory value, and low-stock count
- Search by product name or category
- Add inventory items with server-side validation
- Delete inventory items
- Consistent JSON API response structure
- Light/dark theme toggle
- Accessible labels, status messages, and dialog form
- Uses built-in Node.js HTTP server to avoid dependency installation

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API status |
| GET | `/api/items` | List inventory items |
| GET | `/api/items?q=mouse` | Search items |
| POST | `/api/items` | Create an item |
| DELETE | `/api/items/:id` | Delete an item |

Example POST request body:

```json
{
  "name": "USB-C Cable",
  "category": "Accessories",
  "quantity": 10,
  "price": 8.99
}
```

Successful API responses use a consistent structure, for example:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Wireless Mouse",
      "category": "Accessories",
      "quantity": 24,
      "price": 19.99
    }
  ],
  "meta": {
    "count": 1
  }
}
```

Errors return `success: false` and a descriptive `error` field.

## Architecture and implementation notes

- `server.js` serves the front-end files and exposes JSON API routes.
- `public/app.js` uses `fetch()` to communicate with the API.
- User input is validated on the server; product strings are inserted into the page using `textContent` rather than interpolated HTML.
- Search is debounced to reduce unnecessary API requests while typing.
- Static assets use a short cache lifetime. API responses are marked `no-store`.
- The sample inventory is held in memory and resets when the server restarts. This demo does not include a database or authentication.

## Before submitting to a course

This is a starter/demo implementation. Review it, run it, and adapt it to the exact work you completed in the four earlier course activities. Do not claim you completed steps or used Copilot in ways that do not reflect your actual process. Add your own changes and commit history before submitting.
