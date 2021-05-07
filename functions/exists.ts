import { access } from "fs/promises";
export const exists = async (entity: string): Promise<boolean> => {
  try {
    await access(entity);
    return true;
  }
  catch (e) {
    return false;
  }
};
