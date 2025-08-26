import mongoose from "mongoose";

const unitOfWork = {
  async runInTransaction(work: any) {
    const session = await mongoose.startSession();

    try {
      const client = mongoose.connection.getClient();
      const isReplicaSet = mongoose.connection.readyState === 1 &&
        client.options?.replicaSet; // kiểm tra replica set

      if (!isReplicaSet) {
        console.warn("⚠️ MongoDB không phải replica set → bỏ qua transaction.");
        return await work(); // không truyền session
      }

      session.startTransaction();
      const result = await work(session);
      await session.commitTransaction();
      return result;

    } catch (error) {
      await session.abortTransaction();
      throw error;

    } finally {
      session.endSession();
    }
  }
};

export default unitOfWork;
