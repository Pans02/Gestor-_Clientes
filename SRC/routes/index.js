import {Router} from 'express'
const router = Router()

router.get('/', (req, res) => res.render('index'));
router.get('/', (req, res) => res.render('Tabla_Gestor'));

export default router