import mongoose, { Schema, Document, Model } from "mongoose";

/** Interface chung cho các document */
export interface IBaseDocument extends Document {
  createdAt?: Date;
  updatedAt?: Date;
  deleted?: boolean;
}

/** BaseSchema cho phép kế thừa và mở rộng */
export const BaseSchema = new Schema<IBaseDocument>(
  {
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // tự động tạo createdAt & updatedAt
  }
);

/**
 * BaseModel là class generic bao bọc mongoose.Model
 * cung cấp hàm CRUD cơ bản (find, create, update, delete)
 */
export class BaseModel<T extends IBaseDocument> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id).exec();
  }

  async findAll(filter = {}): Promise<T[]> {
    return await this.model.find(filter).exec();
  }

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async softDelete(id: string): Promise<T | null> {
    return await this.model
      .findByIdAndUpdate(id, { deleted: true }, { new: true })
      .exec();
  }
}
