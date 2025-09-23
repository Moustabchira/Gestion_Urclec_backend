import express from 'express';
import router from './routes/router';

const PORT: number = parseInt(process.env.PORT || "3000", 10);
const app = express();


app.use(express.json());

router(app);


app.get('/', (req, res) => {
    res.send('Serveur URCLEC démarré !');
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur demarré sur le port ${PORT}`);
  console.log("Couper le serveur avec Ctrl+C");
});
