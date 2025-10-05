import { Client, Databases, Users, Teams } from 'node-appwrite';

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY_SUPER_ADMIN!); // Your secret API key

const databases = new Databases(client);
const users = new Users(client);
const teams = new Teams(client);

export const getAdminDatabases = () => databases;
export const getAdminUsers = () => users;
export const getAdminTeams = () => teams;