const express = require('express')
const { registerUser, loginUser, logoutUser, forgotPassword, getUserDetails, resetPassword, updateUserPassword, updateUserProfile, getAllUsers, getUser, deleteUser, updateUserRole } = require('../controllers/userController')
const { isAuthenticatedUser, authorizedRoles } = require('../middleware/auth')
const router = express.Router()


router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').get(logoutUser)
router.route('/password/forgot').post(forgotPassword)
router.route('/password/reset/:token').put(resetPassword)
router.route('/me').get(isAuthenticatedUser ,getUserDetails)
router.route('/me/update').put(isAuthenticatedUser ,updateUserProfile)
router.route('/password/update').put(isAuthenticatedUser, updateUserPassword)

router.route('/admin/users').get(isAuthenticatedUser, authorizedRoles('admin'), getAllUsers)
router.route('/admin/user/:id').get(isAuthenticatedUser, authorizedRoles('admin'), getUser)
router.route('/admin/user/:id').put(isAuthenticatedUser, authorizedRoles('admin'), updateUserRole)
router.route('/admin/user/:id').delete(isAuthenticatedUser, authorizedRoles('admin'), deleteUser)

module.exports = router