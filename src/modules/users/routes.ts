import { Router } from 'express'
import { authMiddleware as authenticate } from '../../middleware/auth'
import { isParent } from '../../middleware/roles'
import * as userController from './controller'

const router = Router()

router.post('/link-student', authenticate, isParent, userController.linkStudent)
router.get('/students', authenticate, isParent, userController.getMyStudents)

export default router