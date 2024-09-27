import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'temp', // Folder in Cloudinary where files will be uploaded
        public_id: (req, file) => uuidv4(), // Unique filename
        format: async (req, file) => path.extname(file.originalname).replace('.', ''), // Get the file extension
    },
});

// Multer setup to use Cloudinary storage
export const upload = multer({ storage: storage });

