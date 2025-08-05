const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const dailyQuestsRoutes = require('./routes/dailyQuests');
const dailyRewardsRoutes = require('./routes/dailyRewards');
const dungeonQuestsRoutes = require('./routes/dungeonQuests');
const skillsRoutes = require('./routes/skills');
const penaltyQuestsRoutes = require('./routes/penaltyQuests');
const userRoutes = require('./routes/user');
const shopItemsRoutes = require('./routes/shopItems');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is working 🚀");
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/daily-quests', dailyQuestsRoutes);
app.use('/api/daily-rewards', dailyRewardsRoutes);
app.use('/api/dungeon-quests', dungeonQuestsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/penalty-quests', penaltyQuestsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/shop', shopItemsRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.log(err));
