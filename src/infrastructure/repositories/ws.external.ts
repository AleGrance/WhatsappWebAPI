import { Client, LocalAuth, MessageMedia, Message, Buttons, MessageAck, Reaction } from "whatsapp-web.js";
import { image as imageQr } from "qr-image";
import LeadExternal from "../../domain/lead-external.repository";

import * as loadRouter from "../router/index";

/**
 * Extendemos los super poderes de whatsapp-web
 */
class WsTransporter extends Client implements LeadExternal {
  private status = false;
  private qrCode: any = '';

  constructor() {
    super({
      authStrategy: new LocalAuth(),
      //restartOnAuthFail: true,
      puppeteer: {
        headless: true,
        args: ['--no-sandbox'],
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        //executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

        // YA ESTA INSTALADO EN EL CLOUDCLUSTERS
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

      // Suscribirse al evento message_ack
      // this.on("message_ack", (message: Message, ack: MessageAck) => {
      //   console.log('Message sent:', message.id);
      //   console.log('New ACK value:', ack);
      // });

      // Suscribirse al evento message_reaction
      // this.on("message_reaction", (reaction: Reaction) => {
      //   console.log('Reaction received:', reaction);
      // });

      // Suscribirse al evento message
      // this.on("message", (message: Message) => {
      //   console.log('Message received:', message);
      // });

      return { id: response.id.id };
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }

  async logMeOut(): Promise<any> {
    if (!this.status) {
      this.initialize();
      return { msg: 'already logged out' };
    } else {
      this.logout();
      this.status = false;
      console.log("USUARIO_DESVINCULADO");

      //this.initialize();

      return { msg: 'logged out' };
    }
  }

  async getMyStatus(): Promise<any> {
    if (!this.status) {
      return { myStatus: this.status, QR: this.qrCode };
    } else {
      return {
        myStatus: this.status,
        name: this.info.pushname,
        number: this.info.wid.user,
      };
    }
  }

  async getMyState(): Promise<any> {
    return this.getState();
  }

  private generateImage = (base64: string) => {
    const path = `${process.cwd()}/tmp`;
    let qr_svg = imageQr(base64, { type: "png", margin: 4 });

    // Convierte la imagen QR a una cadena Base64
    const chunks: any[] = [];
    qr_svg.on('data', chunk => chunks.push(chunk));
    qr_svg.on('end', () => {
      const qrCodeBase64 = Buffer.concat(chunks).toString('base64');
      this.qrCode = qrCodeBase64;
    });

    qr_svg.pipe(require("fs").createWriteStream(`${path}/qr.png`));
    console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡'`);
    console.log(`⚡ Actualiza F5 el navegador para mantener el mejor QR⚡`);
  };
}

export default WsTransporter;
