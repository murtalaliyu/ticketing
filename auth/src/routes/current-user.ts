import express from 'express';

import { currentUser } from '@bluepink-tickets/common';

const router = express.Router();

// goal is to determine whether or not a user is currently signed in
router.get('/api/users/currentuser', currentUser, (req, res) => {
    res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
