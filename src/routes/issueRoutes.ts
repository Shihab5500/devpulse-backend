import { Router } from 'express';
import { createIssue, getAllIssues, getSingleIssue, updateIssue, deleteIssue } from '../controllers/issueController';
import { checkAuth } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', checkAuth, createIssue);
router.get('/', getAllIssues);
router.get('/:id', getSingleIssue);
router.patch('/:id', checkAuth, updateIssue);
router.delete('/:id', checkAuth, deleteIssue);

export default router;