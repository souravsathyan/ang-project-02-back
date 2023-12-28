import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { NextFunction } from "express";
import crypto from "crypto";

export interface UserData extends Document {
  name: string;
  email: string;
  password: string;
  phone: number;
  roles: string;
  status:boolean;
  verified:boolean;
  passwordChangedAt: Date;
  verificationToken: string;
  verificationTokenExpire: Date;
  comparePasswordInDB(pwd: string, pwdInDB: string): string | boolean;
  isPasswordChanged(JWTTimestamp: number): boolean;
  createVerificationToken():string
}

const userSchema = new mongoose.Schema<UserData>({
  name: {
    type: String,
  },
  email: {
    type: String,
    lowercase: true,
  },
  roles: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  status: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: Number,
  },
  password: {
    type: String,
    select: false,
  },
  verified:{
    type:Boolean,
    default:false
  },
  passwordChangedAt: Date,
  verificationToken: String,
  verificationTokenExpire: Date,
});

// hashing pwd
userSchema.pre("save", async function (next: NextFunction) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
// checking if the pwd changeda after logging in and issing jwt
userSchema.methods.isPasswordChanged = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const passwordChangedTimestamp : number = parseInt((this.passwordChangedAt.getTime()/1000).toString(),10)
    return JWTTimestamp < passwordChangedTimestamp
  }
  return false
};

// generating reset token
userSchema.methods.createVerificationToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.verificationToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.verificationTokenExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.comparePasswordInDB = async function (pwd, pwdDb) {
  return await bcrypt.compare(pwd, pwdDb);
};

export const User = mongoose.model("User", userSchema);
