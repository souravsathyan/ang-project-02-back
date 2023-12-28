import express from 'express'
import * as authController from '../controllers/authController'
import * as userCOntroller from '../controllers/userController'
export const router = express.Router()

router.route('/home')
.get(authController.protect,userCOntroller.userHome)