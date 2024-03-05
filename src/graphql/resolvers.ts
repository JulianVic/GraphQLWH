import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from 'uuid'
const prisma = new PrismaClient();
import JWTService from "../services/JWTService";
import BcryptService from "../services/BcryptService";
import WebhookService from "../serverWebHook/webhook";

export const resolvers = {

  Query: {

    users: async (_: any, args: any) => {

      const { token, first, after } = args;
      if (!token) return null;

      const isCorrect = JWTService.verifyToken(token);
      if (!isCorrect) return null;

      return await prisma.user.findMany({
        take: first,
        skip: after ? after : 0,
      });
    },

    userById: async (_: any, args: any) => {

      const { token, userId } = args;

      if (!token) return null;

      const isCorrect = JWTService.verifyToken(token);
      if (!isCorrect) return null;

      const user = await prisma.user.findFirst({
        where: { id: userId }
      });

      return user;

    },

    postsByUserId: async (_: any, args: any) => {

      const { token, userId, first, after } = args;

      if (!token) return null;

      const isCorrect = JWTService.verifyToken(token);
      if (!isCorrect) return null;

      const posts = await prisma.post.findMany({
        where: {
          authorId: userId
        },
        take: first,
        skip: after ? after : 0
      });

      return posts;

    },

    postById: async (_: any, args: any) => {

      try {

        const { token, postId } = args;

        if (!token) return null;

        const isCorrect = JWTService.verifyToken(token);
        if (!isCorrect) return null;

        const post = await prisma.post.findFirst({ where: { id: postId } });

        if (!post) return null;

        return post;

      } catch (error) {

        console.error("Error al procesar la solicitud");
        console.error(error);
        return null

      }
    },

    webhookUrlById: async (_: any, args: any) => {

      try {

        const { token, webHookId } = args;

        if (!token) return null;
        const isCorrect = JWTService.verifyToken(token);

        if (!isCorrect) return null;

        const webhook = await prisma.webHook.findFirst({ where: { id: webHookId } });

        const user = await prisma.user.findFirst({
          where: {
            id: webhook?.userId
          }
        });

        const data = { id: webhook?.id, url: webhook?.url, event: webhook?.event, user: user?.username }
        return data;

      } catch (error) {

        console.error("ha ocurrido un error");
        console.error(error);
        return null;

      }
    },

    webhookUrls: async (_: any, args: any) => {

      try {

        const { token, first, after } = args;
        if (!token) return null;

        const isCorrect = JWTService.verifyToken(token);
        if (!isCorrect) return null;

        const endpoints = await prisma.webHook.findMany({
          take: first,
          skip: after ? after : 0,
        });

        return endpoints;

      } catch (error) {

      }
    },

    webhookUrlsByIdUser: async (_: any, args: any) => {

      try {

        const { token, userId, first, after } = args;

        if (!token) return null;

        const isCorrect = JWTService.verifyToken(token);
        if (!isCorrect) return null;

        const webhooks = await prisma.webHook.findMany({
          where: {
            userId: userId
          },
          take: first,
          skip: after ? after : 0
        });

        return webhooks;

      } catch (error) {

        console.error("Ha ocurrido un error");
        console.error(error);
        return null;
      }
    }
  },

  Mutation: {

    createUser: async (_: any, args: any) => {

      const { username, email, password } = args;

      const id: string = uuidv4();

      const hashedPassword = await BcryptService.encryptPassword(password)
      const user = await prisma.user.create({

        data: {
          id,
          username,
          email,
          password: hashedPassword,
        }

      });

      const token = JWTService.sign(user.username, '1h');

      return { token, username: user.username, email: user.email };

    },

    authenticateUser: async (_: any, args: any) => {

      const { username, password } = args;

      const checkIs = await prisma.user.findFirst({

        where: {
          username: username
        }
      });

      if (!checkIs) return null;

      const isCorrect = await BcryptService.verifyPassword(password, checkIs.password);

      if (!isCorrect) return {
        token: "you are not authorized to access this resource",
        username: "you are not authorized to access this resource",
        email: "you are not authorized to access this resource"
      }

      const token = JWTService.sign(checkIs.username, '1h');

      return { token, username: checkIs.username, email: checkIs.email };

    },

    createPost: async (_: any, args: any) => {

      const { title, content, userId, token } = args;

      if (!token) return null;

      const isCorrect = JWTService.verifyToken(token);
      if (!isCorrect) return null;

      const userOwner = await prisma.user.findFirst({

        where: {

          id: userId

        }
      });

      if (!userOwner) return null;

      const id: string = uuidv4();

      const createdPost = await prisma.post.create({

        data: {
          id,
          title: title,
          content: content,
          authorId: userId
        }
      });

      const userAuthor = await prisma.user.findFirst({ where: { id: userId } });
      const data = { id: createdPost.id, title, content, user: userAuthor?.username };

      WebhookService.notifyUserAndPostWebHook("createPost", data, "new post")

      return data;

    },

    createWebHook: async (_: any, args: any) => {

      const { url, event, userId, token } = args;

      if (!token) return null;

      const isCorrect = JWTService.verifyToken(token);

      if (!isCorrect) return null;

      const id: string = uuidv4();

      const webhook = await prisma.webHook.create({
        data: {
          id,
          url,
          event,
          userId
        }
      });

      return webhook;

    },

    updateUser: async (_: any, args: any) => {

      const { token, username, email, idUser } = args;

      if (!token) return null;

      const isCorrect = JWTService.verifyToken(token);
      if (!isCorrect) return null;

      const user = await prisma.user.update({
        where: {
          id: idUser
        },

        data: {
          username: username,
          email: email,
        }
      });

      const data = { user: user.username, email: user.email };

      WebhookService.notifyUserAndPostWebHook("updateUser", data, "Se ha actualizado un usuario")

      return user;

    },

    deleteUser: async (_: any, args: any) => {

      const { token, idUser } = args;

      if (!token) return null;

      const isCorrect = JWTService.verifyToken(token);
      if (!isCorrect) return null;

      const userDelete = await prisma.user.delete({
        where: {
          id: idUser
        }
      });

      const data = { user: userDelete.username, email: userDelete.email };
      WebhookService.notifyUserAndPostWebHook("deleteUser", data, "Se ha eliminado un usuario")

      return userDelete;

    },

    updatePost: async (_: any, args: any) => {

      const { token, idPost, title, content } = args;

      if (!token) return null;
      const isCorrect = JWTService.verifyToken(token);
      if (!isCorrect) return null;

      const post = await prisma.post.update({
        where: {
          id: idPost
        },
        data: {
          title: title,
          content: content
        }
      });

      const userAuthor = await prisma.user.findFirst({ where: { id: post.authorId } });
      const data = { id: post.id, title, content, user: userAuthor?.username };

      WebhookService.notifyUserAndPostWebHook("updatePost", data, "Se ha actualizado un post")

      return data;

    },

    updateWebHook: async (_: any, args: any) => {

      const { token, idWebHook, url, event } = args;

      if (!token) return null;

      const isCorrect = JWTService.verifyToken(token);
      if (!isCorrect) return null;

      const updatedWebHook = await prisma.webHook.update({
        where: {
          id: idWebHook
        },
        data: {
          url: url,
          event: event
        }
      });

      const user = await prisma.user.findFirst({
        where: {
          id: updatedWebHook?.userId
        }
      });

      const data = { id: updatedWebHook?.id, url: updatedWebHook.url, event: updatedWebHook?.event, user: user?.username };

      WebhookService.notifyUserAndPostWebHook("updateWebHook", data, "se ha actualizado una url");

      return data;
    }

  }

}
