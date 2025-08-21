// src/server.ts
import { setupApp } from "./start-up/app";

const PORT = process.env.SSO_PORT || 3000;

setupApp()
  .then((app) => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  })

  .catch((err) => {
    console.error("❌ Failed to start app", err);
  });
