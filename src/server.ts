// src/server.ts
import { setupApp } from "./start-up/app";

const PORT = process.env.PRODUCT_PORT || 5002;

setupApp()
  .then((app) => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  })

  .catch((err) => {
    console.error("❌ Failed to start app", err);
  });
