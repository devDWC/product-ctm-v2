// src/repositories/base.repository.ts
import { Document, Model, FilterQuery, UpdateQuery } from "mongoose";

export class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  /**
   * Lấy danh sách theo filter
   */
  public async getMany(
    filter: FilterQuery<T> = {},
    projection: any = null,
    options: any = {}
  ): Promise<{ data: T[]; total: number }> {
    const { sort, ...restOptions } = options;

    const [data, total] = await Promise.all([
      this.model
        .find(filter, projection, { ...restOptions, sort })
        .lean()
        .exec() as unknown as T[],
      this.model.countDocuments(filter).exec(),
    ]);

    return { data, total };
  }

  /**
   * Lấy một document theo filter
   */
  public async getOne(
    filter: FilterQuery<T>,
    projection: any = null
  ): Promise<T | null> {
    return this.model.findOne(filter, projection).lean<T>().exec();
  }

  /**
   * Tạo mới document với điều kiện filter (nếu đã tồn tại thì trả về null)
   */
  public async create(
    data: Partial<T>,
    uniqueFilter?: FilterQuery<T>
  ): Promise<T | null> {
    if (uniqueFilter) {
      const exists = await this.model.findOne(uniqueFilter).exec();
      if (exists) {
        return null;
      }
    }

    const doc = new this.model(data);
    return doc.save();
  }

  /**
   * Cập nhật document
   */
  public async update(
    filter: FilterQuery<T>,
    updateData: UpdateQuery<T>,
    options: any = { new: true }
  ): Promise<T | null> {
    const result = await this.model
      .findOneAndUpdate(filter, updateData, options)
      .lean()
      .exec();
    return result as T | null;
  }

  /**
   * Xóa document
   */
  public async delete(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOneAndDelete(filter).exec();
  }

  /**
   * Xóa nhiều document theo filter
   */
  public async deleteMany(
    filter: FilterQuery<T>
  ): Promise<{ deletedCount?: number }> {
    const result = await this.model.deleteMany(filter).exec();
    return { deletedCount: result.deletedCount };
  }

  /**
   * Đếm số lượng document thỏa filter
   */
  public async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}
