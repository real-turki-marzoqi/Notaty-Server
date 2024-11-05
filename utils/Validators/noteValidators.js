const { check } = require('express-validator')
const validatorMiddleWare = require('../../middlewares/validatorMiddleWare')

exports.createNoteValidator = [

    check('title')
    .notEmpty().withMessage('Title Is Required')
    .isLength({min:2}).withMessage('Title Must at least 2 chars ')
    .isLength({max:30}).withMessage('Title must be at max 30 chars'),

    check('content')
    .optional()
    .isLength({min:2}).withMessage('content Must at least 2 chars ')
    .isLength({max:100}).withMessage('content must be at max 100 chars')

    , validatorMiddleWare
]

exports.checkIdValidator = [

    check('id')
    .isMongoId().withMessage('Invalid Note Id format ')

    ,validatorMiddleWare
]

exports.updateNoteValidator = [

    check("id")
    .isMongoId().withMessage('Invalid Note Id Format'),

    check('title')
    .optional()
    .isLength({min:2}).withMessage('Title Must at least 2 chars ')
    .isLength({max:30}).withMessage('Title must be at max 30 chars'),

    check('content')
    .optional()
    .isLength({min:2}).withMessage('content Must at least 2 chars ')
    .isLength({max:100}).withMessage('content must be at max 100 chars')
    

]