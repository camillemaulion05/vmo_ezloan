import {
    Router
} from 'express';
const router = Router();
import {
    index,
    postContact
} from '../controllers/home';
import {
    getLogin,
    getLogout,
    getForgot,
    getReset,
    getSignup
} from '../controllers/users';

router.get('/', index);
router.post('/', postContact);
router.get('/login', getLogin);
// router.post('/login', ctrlUsers.postLogin);
router.get('/logout', getLogout);
router.get('/forgot', getForgot);
// router.post('/forgot', ctrlUsers.postForgot);
router.get('/reset/:token', getReset);
// router.post('/reset/:token', ctrlUsers.postReset);
router.get('/signup', getSignup);
// router.post('/signup', ctrlUsers.postSignup);

export default router;