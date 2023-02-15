import { MessageMedia } from "whatsapp-web.js";
import { Lead } from "./lead";

/**
 * Esta es la interfaz que debe de cumplir el repositorio de infraestructura
 * mysql o mongo o etc
 */
export default interface LeadRepository {
  save({
    message,
    phone,
    media
  }: {
    message: string;
    phone: string;
    media: MessageMedia;
  }): Promise<Lead | undefined | null>;

  saveSimple({
    message,
    phone
  }: {
    message: string;
    phone: string;
  }): Promise<Lead | undefined | null>;


  getDetail(id:string):Promise<Lead | null | undefined>
}
