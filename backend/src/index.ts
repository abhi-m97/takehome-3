import { createApp } from './app';

const PORT = Number(process.env.PORT) || 3001;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Learner progress API listening on http://localhost:${PORT}`);
  console.log(`Try: GET http://localhost:${PORT}/api/learners/1/progress`);
});
