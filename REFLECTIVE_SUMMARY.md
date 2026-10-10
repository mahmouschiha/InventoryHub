# Reflective Summary — InventoryHub

Use this as a draft and edit it so it accurately describes the work you personally completed.

I developed InventoryHub as a full-stack inventory dashboard with a browser-based front end and a Node.js back end. The front end communicates with the back end through JSON API endpoints using the Fetch API. The server returns consistent success and error response structures, which makes the API easier to understand and debug.

During implementation, I added server-side validation for product fields and handled invalid JSON and missing routes with descriptive error responses. I used browser-side event handlers to add, search, and delete inventory items. Search requests are debounced to reduce unnecessary calls while a user types. I also used safe DOM text insertion for product names and categories.

The dashboard calculates inventory totals and highlights products with low or zero stock. I tested the main flows by running the server locally and checking the dashboard, API responses, and validation behavior. The project helped me practice front-end/back-end integration, JSON response design, input validation, and performance-minded coding.

If Microsoft Copilot was used during your actual development, add a truthful example of how it helped you generate code, investigate a bug, or review an optimization. Describe the suggestions you accepted, what you changed, and how you verified the result.
