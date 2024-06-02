import mongoose from "mongoose";
const { Schema, model } = mongoose;
import type { User } from "../lib/definitions";

// interface UserDocument extends Document, User {
//   isSubscriptionActive: () => boolean;
// }

type UserMethods = { isSubscriptionActive: () => boolean };

type UserModel = User & UserMethods;

const userSchema = new Schema<UserModel>(
  {
    email: { type: String, required: true, unique: true, immutable: true },
    number: { type: String, required: true, unique: true },
    subscription: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
  },
  { timestamps: true }
);

userSchema.methods.isSubscriptionActive = function () {
  const now = new Date(); // Get the current date and time
  return now <= this.subscription.endDate;
};

export const UserModel = model("User", userSchema);
