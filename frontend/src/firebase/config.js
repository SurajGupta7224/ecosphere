import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  databaseURL: 'https://hommlie-8fb41-default-rtdb.firebaseio.com',
  projectId: 'hommlie-8fb41'
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export default app;
