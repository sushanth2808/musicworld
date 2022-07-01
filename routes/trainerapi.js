var express = require('express');
const { trainer_list, fetch_trainer, view_trainer, trainee_application, applications, accept, reject, trainer_data, trainer_update, trainer_updating, trainer_meetings, meetings, login, loginpage, filters, posts, logout, newpage, subscribers } = require('../controller/trainerapicontroller');
const { authenticateToken } = require('../middleware/authenticate');
var router = express.Router();
router.get('/login',loginpage)
router.get('/logout',logout)
router.post('/loginaccount',login)
router.get('/fetch_trainer',fetch_trainer)
router.get('/list/:val', trainer_list)
router.post('/filter',filters)
router.get('/view_trainer/:username',authenticateToken('user') ,view_trainer)
router.post('/trainee',trainee_application)
router.get('/applications',authenticateToken("trainer"),applications)
router.get('/accept/:username',accept)
router.get('/reject/:username',reject)
router.get('/trainer_data',authenticateToken("trainer"),trainer_data)
router.get('/trainer_update',authenticateToken("trainer"),trainer_update)
router.post('/trainer_updating',authenticateToken("trainer"),trainer_updating)
router.get('/trainer_meetings',authenticateToken("trainer"),trainer_meetings)

router.post('/meetings',authenticateToken("trainer"),meetings)
router.post('/posts',authenticateToken("trainer"),posts)
router.get('/newpage',authenticateToken("trainer"),subscribers)
router.get('/newpage/:username',newpage)
module.exports = router