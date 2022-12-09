const express = require('express')
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteReview } = require('../controllers/ProductController')
const { isAuthenticatedUser, authorizedRoles } = require('../middleware/auth')
const router = express.Router()


router.route('/products').get(getAllProducts)
router.route('/product/:id').get(getProductDetails)
router.route('/admin/product/create').post(isAuthenticatedUser, authorizedRoles('admin'), createProduct)
router.route('/admin/product/:id').put(updateProduct)
router.route('/admin/product/:id').delete(deleteProduct)

router.route('/review').put(isAuthenticatedUser, createProductReview)
router.route('/reviews').get(getProductReviews)
router.route('/reviews').delete(isAuthenticatedUser, deleteReview)

module.exports = router