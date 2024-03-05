import { gql } from 'graphql-tag';

export const typeDefs = gql`

  type WebHookResponse {

    id : ID
    url : String
    event : String
    user : String
  }

  type Query {

    users(token : String!, first : Int, after: Int) : [User]
    userById(token : String!, userId : String!) : User
    postsByUserId(token : String!, userId: String!, first : Int, after : Int): [Post]
    postById(token: String!, postId : String!): Post
    webhookUrlById(token: String!, webHookId : String!): WebHookResponse
    webhookUrls(token : String!, first : Int, after : Int): [WebHook]
    webhookUrlsByIdUser(token : String!, userId: String, first : Int, after: Int): [WebHook]

  }

  type UserResponse {

    token: String
    username : String
    email : String

  }

  type PostResponse {

    id : ID
    title : String,
    content : String,
    user : String
  }

  type Mutation {

    createUser(username : String, email : String, password : String): UserResponse!
    authenticateUser(username : String, password : String): UserResponse!
    createPost(title : String, content : String, userId : String, token : String!): PostResponse
    createWebHook(url : String, event: String, userId : String, token: String!) : WebHook
    updateUser(token : String!, username : String, email : String, idUser: String!): User
    deleteUser(token : String!, idUser: String!) : User
    updatePost(token : String!, idPost : String!, title: String, content : String): PostResponse
    updateWebHook(token : String!, idWebHook: String!, url : String, event : String): WebHookResponse

  }

  type User {

    id : ID!
    username : String
    email : String

  }

  type Post {

    id : ID!
    title : String
    content : String

  }

  type WebHook {

    id : ID!
    url : String
    event : String
    userId : String

  }

`


