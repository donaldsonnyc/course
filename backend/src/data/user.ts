import { model, Schema } from 'mongoose';
import { useId } from './data-utils';
import { generate } from '../utils/snowflake';
import passportLocalMongoose from 'passport-local-mongoose';

export interface UserDocument extends Entity.User, Document {}

const UserSchema = new Schema({
  _id: { type: String, default: generate },
  authorId: String,
  content: String,
  createdAt: { type: String, default: new Date() },
  channelId: String,
  discriminator: Number,
  email: String,
  username: String,
  updatedAt: Date,
  guilds: [{ type: String, ref: 'guild' }],
}, { toJSON: { getters: true } })
.method('toClient', useId)
.plugin(passportLocalMongoose, { usernameField: 'email' });

export const User = model<UserDocument>('user', UserSchema);