import { Client, LocalAuth, MessageMedia, Message, Buttons } from "whatsapp-web.js";
import { image as imageQr } from "qr-image";
import LeadExternal from "../../domain/lead-external.repository";

/**
 * Extendemos los super poderes de whatsapp-web
 */
class WsTransporter extends Client implements LeadExternal {
  private status = false;

  constructor() {
    super({
      authStrategy: new LocalAuth(),
      //restartOnAuthFail: true,
      puppeteer: {
        headless: true,
        //executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        //executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        //executablePath: '/usr/bin/google-chrome-stable'
      }
    });

    console.log("Iniciando....");

    this.initialize();

    this.on("ready", () => {
      this.status = true;
      console.log("LOGIN_SUCCESS");
      console.log("USER_VINCULADO: ", {
        USER: this.info.pushname,
        NRO: this.info.wid.user,
      });
    });

    this.on("auth_failure", () => {
      this.status = false;
      console.log("LOGIN_FAIL");
    });

    this.on("qr", (qr) => {
      console.log("Escanea el codigo QR que esta en la carpeta tmp");
      this.generateImage(qr);
    });
  }

  /**
   * Enviar mensaje de WS
   * @param lead
   * @returns
   */
  async sendMsg(lead: {
    message: string;
    phone: string;
    media: MessageMedia;
  }): Promise<any> {
    try {

      if (!this.status)
        return Promise.resolve({
          error: "Escanee el código QR para loguearse",
        });

      const { message, phone, media } = lead;
      //const buttons = new Buttons('Botones', [{ id: 'boton1', body: 'Opcion 1' }, { id: 'boton2', body: 'Opcion 2' }], 'Titulo', 'Footer');
      const buttons = [
        { index: 1, text: 'Opción 1', id: 'opcion_1' },
        { index: 2, text: 'Opción 2', id: 'opcion_2' },
        { index: 3, text: 'Opción 3', id: 'opcion_3' },
      ];

      // Enviar el mensaje con botones dinámicos y la imagen
      const msg = {
        to: `${phone}@c.us`,
        media: media,
        caption: message,
        thumbnail: undefined,
        mimetype: undefined,
        filename: undefined,
        captionMentions: undefined,
        ephemeralExpiration: undefined,
        ephemeralSettingTimestamp: undefined,
        sendSeen: false,
        buttons: buttons,
      };


      // Si tipo de dato es numerico convertir a string para poder verificar
      // Para enviar no importa el tipo de dato pero para verificar sí porque recibe solo string
      if (typeof lead.phone === "number") {
        let nroCel: any = lead.phone;
        lead.phone = nroCel.toString();
      }
      // Si el numero no esta registrado en WA no se envia el mensaje y retorna el nro
      if (!(await this.getNumberId(lead.phone))) {
        return { unknow: lead.phone };
      }

      const response = await this.sendMessage(`${phone}@c.us`, message, { media: media });
      //const response = await this.sendMessage(`${phone}@c.us`, new Buttons('algo', [{ id: 'customId', body: 'button1' }, { body: 'button2' }, { body: 'button3' }, { body: 'button4' }], 'Title here, doesn\'t work with media', 'Footer here'), { caption: 'if you used a MessageMedia instance, use the caption here' });
      return { id: response.id.id };
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }

  async sendMsgSimple(lead: { message: string; phone: string, }): Promise<any> {
    try {
      if (!this.status)
        return Promise.resolve({
          error: "Escanee el código QR para loguearse",
        });
      const { message, phone } = lead;
      //console.log("El lead: ", lead);
      // Si tipo de dato es numerico convertir a string para poder verificar
      // Para enviar no importa el tipo de dato pero para verificar sí
      if (typeof lead.phone === "number") {
        let nroCel: any = lead.phone;
        lead.phone = nroCel.toString();
      }
      // Si el numero no esta registrado en WA no se envia el mensaje y retorna el nro
      if (!(await this.getNumberId(lead.phone))) {
        return { unknow: lead.phone };
      }

      const response = await this.sendMessage(`${phone}@c.us`, message);
      //const response = await this.sendMessage(`${phone}@c.us`, new Buttons('algo', [{ id: 'customId', body: 'button1' }, { body: 'button2' }, { body: 'button3' }, { body: 'button4' }], 'Title here, doesn\'t work with media', 'Footer here'), { caption: 'if you used a MessageMedia instance, use the caption here' });

      return { id: response.id.id };
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }

  async logMeOut(): Promise<any> {
    if (!this.status) {
      return { msg: 'already logged out' };
    } else {
      this.logout();
      this.status = false;
      console.log("USUARIO_DESVINCULADO");
      this.on('disconnected', (reason) => {
        // Destroy and reinitialize the client when disconnected
        this.initialize();
      });
      return { msg: 'logged out' };
    }
  }

  async getMyStatus(): Promise<any> {
    return { myStatus: this.status };
    //return { myStatus: this.status, state: this.getState() };
    //return this.getState();
    //return this.info;
  }

  private generateImage = (base64: string) => {
    const path = `${process.cwd()}/tmp`;
    let qr_svg = imageQr(base64, { type: "svg", margin: 40 });
    qr_svg.pipe(require("fs").createWriteStream(`${path}/qr.svg`));
    console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡'`);
    console.log(`⚡ Actualiza F5 el navegador para mantener el mejor QR⚡`);
  };
}

export default WsTransporter;
