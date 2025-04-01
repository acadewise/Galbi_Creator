declare module 'multer' {
  import { Request } from 'express';

  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }

  interface MulterRequest extends Request {
    file: File;
    files: {
      [fieldname: string]: File[]
    } | File[];
  }

  interface StorageEngine {
    _handleFile(req: Request, file: Express.Multer.File, cb: (error?: any, info?: Partial<File>) => void): void;
    _removeFile(req: Request, file: File, cb: (error: Error) => void): void;
  }

  interface DiskStorageOptions {
    destination?: string | ((req: Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) => void);
    filename?: (req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => void;
  }

  interface MulterOptions {
    dest?: string;
    storage?: StorageEngine;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
    fileFilter?(req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void): void;
  }

  interface Instance {
    single(fieldname: string): (req: Request, res: Response, next: NextFunction) => void;
    array(fieldname: string, maxCount?: number): (req: Request, res: Response, next: NextFunction) => void;
    fields(fields: Array<{ name: string; maxCount?: number }>): (req: Request, res: Response, next: NextFunction) => void;
    none(): (req: Request, res: Response, next: NextFunction) => void;
    any(): (req: Request, res: Response, next: NextFunction) => void;
  }

  function diskStorage(options: DiskStorageOptions): StorageEngine;
  function memoryStorage(): StorageEngine;

  export default function(options?: MulterOptions): Instance;
  export { diskStorage, memoryStorage };
}