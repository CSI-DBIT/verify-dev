import ShortUniqueId from "short-unique-id";
import { v4 as uuidv4 } from "uuid";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const { randomUUID } = new ShortUniqueId({ length: 10 });

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  return await Bun.password.hash(password);
};

// Compare password
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await Bun.password.verify(password, hash);
};

export const generateComplexId = () => {
  const uniqueId = uuidv4();
  const shortId = randomUUID();
  const complexId = `${shortId}-${uniqueId}`;
  return complexId;
};

export const generateSmallId = () => {
  const certificateCode = randomUUID();
  return certificateCode;
};

export const getExpTimestamp = (seconds: number) => {
  const currentTimeMillis = Date.now();
  const secondsIntoMillis = seconds * 1000;
  const expirationTimeMillis = currentTimeMillis + secondsIntoMillis;
  return Math.floor(expirationTimeMillis / 1000);
};

export const handleFileUpload = async ({
  file,
  directory,
  allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"],
  maxSizeMB = 5
}: {
  file: File;
  directory: string;
  allowedTypes?: string[];
  maxSizeMB?: number;
}): Promise<string> => {
  try {
    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`);
    }

    // Validate file size (default 5MB)
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File size too large. Maximum size: ${maxSizeMB}MB`);
    }

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), "public", directory);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const uniqueId = `${randomUUID()}-${Date.now()}`;
    const fileName = `${uniqueId}.${fileExt}`;
    const filePath = join(directory, fileName);
    const fullPath = join(uploadDir, fileName);

    // Save file
    await Bun.write(fullPath, file);

    // Return relative path for database storage
    return filePath;
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
};
