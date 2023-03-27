import express, { Router } from "express";
import LeadCtrl from "../controller/lead.ctrl";
import container from "../ioc";
const router: Router = Router();

/**
 * http://localhost/lead POST
 */
const leadCtrl: LeadCtrl = container.get("lead.ctrl");
router.post("/", leadCtrl.sendCtrl);
router.get('/', (req, res) => {
    res.send({
        msg: "WWA"
    });
});

router.get('/logout', leadCtrl.logOutCtrl);
router.get('/status', leadCtrl.getStatusCtrl);
router.get('/state', leadCtrl.getStateCtrl);


export { router };
