import { MessageMedia } from "whatsapp-web.js";
import LeadExternal from "../domain/lead-external.repository";
import LeadRepository from "../domain/lead.repository";

export class LeadCreate {
  private leadRepository: LeadRepository;
  private leadExternal: LeadExternal;
  constructor(respositories: [LeadRepository, LeadExternal]) {
    const [leadRepository, leadExternal] = respositories;
    this.leadRepository = leadRepository;
    this.leadExternal = leadExternal;
  }

  public async sendMessageAndSave({
    message,
    phone,
    media,
  }: {
    message: string;
    phone: string;
    media: MessageMedia;
  }) {
    const responseDbSave = await this.leadRepository.save({ message, phone, media });//TODO DB
    const responseExSave = await this.leadExternal.sendMsg({ message, phone, media });//TODO enviar a ws
    return { responseDbSave, responseExSave };
  }

  public async sendMessageAndSaveSimple({
    message,
    phone
  }: {
    message: string;
    phone: string;
  }) {
    const responseDbSave = await this.leadRepository.saveSimple({ message, phone });//TODO DB
    const responseExSave = await this.leadExternal.sendMsgSimple({ message, phone });//TODO enviar a ws
    //return {responseDbSave, responseExSave};

    /* 
      Caso de que la sesion se cierre desde el celular
    */
    // if (responseExSave.error === "Protocol error (Runtime.callFunctionOn): Session closed. Most likely the page has been closed.") {
    //   this.logMeOut();
    //   return;
    // }

    return { responseExSave };
  }

  // Log out
  public async logMeOut() {
    const responseLog = await this.leadExternal.logMeOut();
    return responseLog;
  }
  // Get status
  public async getMyStatus() {
    const responseLog = await this.leadExternal.getMyStatus();
    return responseLog;
  }

  // Get status
  public async getMyState() {
    const responseLog = await this.leadExternal.getMyState();
    return responseLog;
  }
}
