import { Schema, model, Document } from "mongoose";

export interface ICounter extends Document {
  _id: string;  // Ví dụ: 'P', 'U', 'ORD'
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const CounterModel = model<ICounter>("Counter", counterSchema);
