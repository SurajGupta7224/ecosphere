const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folderName = 'Others';
    if (file.fieldname === 'profile_photo' || file.fieldname === 'profile_pic') folderName = 'ProfilePics';
    if (file.fieldname === 'pan_card_file') folderName = 'Pan_Card';
    if (file.fieldname === 'aadhaar_card_file') folderName = 'Aadhaar_Card';
    if (file.fieldname === 'gst_file') folderName = 'GST';
    if (file.fieldname === 'category_image') folderName = 'Category';
    if (file.fieldname === 'subcategory_image') folderName = 'SubCategory';
    if (file.fieldname === 'product_images') folderName = 'ProductImages';
    if (file.fieldname === 'images') folderName = 'CollectionRequests';
    
    const dir = path.join(__dirname, "../public/uploads", folderName);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Accept common images and pdfs
  const filetypes = /jpeg|jpg|png|webp|gif|svg|pdf/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("File type not supported. Please upload an image (JPG, PNG, WEBP, GIF, SVG) or a PDF."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;
