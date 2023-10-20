import express, { Router } from "express";
import LeadCtrl from "../controller/lead.ctrl";
import container from "../ioc";
const router: Router = Router();
const apiKey = '^f4xufs,9}1ITYYJYbU>.ZF]32(J94ñññ';

/**
 * http://localhost/lead POST
 */
const leadCtrl: LeadCtrl = container.get("lead.ctrl");

router.get('/', validateApiKey, (req, res) => {
    res.send({
        msg: "WWA - es true"
    });
});

router.post("/", leadCtrl.sendCtrl);
router.get('/status', validateApiKey, leadCtrl.getStatusCtrl);
router.get('/logout', validateApiKey, leadCtrl.logOutCtrl);
router.get('/state', validateApiKey, leadCtrl.getStateCtrl);


// Checks the apikey
function validateApiKey(req: any, res: any, next: any) {
    // Checks for the apikey
    if (!req.headers.apikey) {
        return res.status(403).send({
            error: "Forbidden",
            message: "Tu petición no tiene cabecera de autorización",
        });
    }

    // Checks for the eq
    if (req.headers.apikey === apiKey) {
        next();
    } else {
        return res.status(403).send({
            error: "Forbidden",
            message: "Cabecera de autorización inválida",
        });
    }
}


export { router };
