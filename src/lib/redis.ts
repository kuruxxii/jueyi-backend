import Redis from "ioredis";
export const redis = new Redis({
  port: 6379,
  host: "101.132.43.220",
  password: "MarySomers37",
});
import { UserModel } from "../models/UserModel";

export async function getOrSetCache(key: string, callback: Function) {
  try {
    const value = await redis.get(key);
    if (value) {
      console.log("Cache Hit");
      return JSON.parse(value);
    } else {
      console.log("Cache Miss");
      const newValue = await callback();
      await redis.set(key, JSON.stringify(newValue), "EX", 3600);
      return newValue;
    }
  } catch (error) {
    throw new Error(`Error in getOrSetCache function: ${error}`);
  }
}

export async function getOrSetCacheForUserModel(
  key: string,
  callback: Function
) {
  try {
    const value = await redis.get(key);
    if (value) {
      console.log("Cache Hit");
      return new UserModel(JSON.parse(value));
    } else {
      console.log("Cache Miss");
      const newValue = await callback();
      await redis.set(key, JSON.stringify(newValue), "EX", 3600);
      return newValue;
    }
  } catch (error) {
    throw new Error(`Error in getOrSetCache function: ${error}`);
  }
}
