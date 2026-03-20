import { createApp } from "./app";
import { resolveDependencies } from "./registry";
const PORT = process.env.PORT || 5000;
async function main() {
  try {
    await resolveDependencies();
    const app = createApp();

    app.listen(Number(PORT), () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log({ error });
    console.log("failed to start app");
    process.exit(1);
  }
}

main();
