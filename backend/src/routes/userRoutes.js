import express from 'express';
import {
  getAllUsers,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.route('/')
  .get(getAllUsers);

router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

export default router;
