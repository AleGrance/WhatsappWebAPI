import { MessageMedia } from "whatsapp-web.js";

export default interface LeadExternal {
    sendMsg({message, phone, media}:{message:string, phone:string, media:MessageMedia}):Promise<any>
    sendMsgSimple({message, phone}:{message:string, phone:string}):Promise<any>
    logMeOut():Promise<any>
    getMyStatus():Promise<any>
}