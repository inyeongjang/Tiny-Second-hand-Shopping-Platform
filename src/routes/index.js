const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const chatRoutes = require('./chatRoutes');
const reportRoutes = require('./reportRoutes');
const searchRoutes = require('./searchRoutes');
const paymentRoutes = require('./paymentRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/chats', chatRoutes);
router.use('/reports', reportRoutes);
router.use('/search', searchRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);

module.exports = router;