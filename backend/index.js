import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API route to get Hero section details
app.get('/api/hero', (req, res) => {
  res.json({
    logo: {
      text: 'Giftworld',
      icon: 'Gift'
    },
    navigation: [
      { label: 'Most Popular', href: '#most-popular' },
      { label: 'Our Collection', href: '#collection' },
      { label: 'Support', href: '#support' }
    ],
    hero: {
      title: 'Perfect Gifts for your loved ones',
      subtitle: 'Discover beautifully detailed deity statues, custom couple figurines, and personalized gifts crafted to perfection.',
      cta: {
        text: 'Explore Collection',
        href: '#collection'
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
