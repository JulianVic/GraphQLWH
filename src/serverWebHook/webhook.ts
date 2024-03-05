import { PrismaClient } from "@prisma/client"
import axios from "axios";

const prisma = new PrismaClient();

const notifyUserAndPostWebHook = async (event: string, data: any, message: string) => {

  const urls = await prisma.webHook.findMany({

    where: {

      event: event

    }
  });

  if (urls.length > 0) {

    const object = { data, message };

    urls.forEach(async (endpoint) => {

      try {

        await axios.post(endpoint.url, object);

      } catch (error) {

        console.log(error);
      }

    });

  }

}

export default { notifyUserAndPostWebHook }
