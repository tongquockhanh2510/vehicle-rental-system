import express from 'express';
import reviewService from '../services/ReviewService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const review = await reviewService.createReview(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:reviewId', async (req, res) => {
  try {
    const review = await reviewService.getReviewById(req.params.reviewId);
    res.json(review);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:reviewId', async (req, res) => {
  try {
    const review = await reviewService.updateReview(req.params.reviewId, req.body);
    res.json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/user/:userId/reviews', async (req, res) => {
  try {
    const reviews = await reviewService.getReviewsByUser(req.params.userId);
    res.json(reviews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/user/:userId/rating', async (req, res) => {
  try {
    const rating = await reviewService.calculateAverageRating(req.params.userId);
    res.json({ average_rating: rating });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/vehicle/:vehicleId/reviews', async (req, res) => {
  try {
    const reviews = await reviewService.getReviewsByVehicle(req.params.vehicleId);
    res.json(reviews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:reviewId', async (req, res) => {
  try {
    await reviewService.deleteReview(req.params.reviewId);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
