export default async function handler(req, res) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    await fetch(`${process.env.VITE_BACKEND_URL}/health`, {
      signal: controller.signal
    });
    res.status(200).send("awake");
  } catch {
    res.status(200).send("still fine"); // don't fail cron
  } finally {
    clearTimeout(timeout);
  }
}
