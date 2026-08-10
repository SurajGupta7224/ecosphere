const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folderName = 'Others';
    if (file.fieldname === 'profile_photo' || file.fieldname === 'profile_pic') folderName = 'ProfilePics';
    if (file.fieldname === 'pan_card_file') folderName = 'Pan_Card';
    if (file.fieldname === 'aadhaar_card_file') folderName = 'Aadhaar_Card';
    if ([
      'aadhaar_front_image',
      'aadhaar_back_image',
      'pan_card_image',
      'driving_license_front_image',
      'driving_license_back_image',
      'police_verification_image',
      'medical_certificate_image',
      'eyesight_certificate_image'
    ].includes(file.fieldname)) {
      folderName = 'Employees';
    }
    if (file.fieldname === 'category_image') folderName = 'Category';

    if (file.fieldname === 'subcategory_image') folderName = 'SubCategory';
    if (file.fieldname === 'product_images') folderName = 'ProductImages';
    if ([
      'images', 
      'mom_agreement_file', 
      'po_copy_file', 
      'email_copy_file', 
      'rwa_file', 
      'gst_file', 
      'pan_file', 
      'trade_license_file'
    ].includes(file.fieldname)) {
      folderName = 'CollectionRequests';
    }
    
    if ([
      'rc_front_image',
      'rc_back_image',
      'vehicle_front_photo',
      'vehicle_rear_photo',
      'vehicle_left_photo',
      'vehicle_right_photo',
      'puc_certificate_image',
      'insurance_certificate_image',
      'fc_certificate_image',
      'permit_certificate_image',
      'road_tax_receipt_image',
      'device_front_photo',
      'device_back_photo',
      'device_imei_sticker_photo',
      'device_purchase_invoice',
      'device_warranty_card',
      'device_box_imei_photo',
      'device_charger_photo',
      'device_accessories_photo',
      'device_other_document'
    ].includes(file.fieldname)) {
      folderName = 'Vehicles';
    }
    
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
  // Accept common images, pdfs, and word documents (doc, docx)
  const allowedExts = /jpeg|jpg|png|webp|gif|svg|pdf|doc|docx/;
  const allowedMimes = /image\/(jpeg|jpg|png|webp|gif|svg\+xml)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|octet-stream)/;

  const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimes.test(file.mimetype.toLowerCase());

  if (extname || mimetype) {
    return cb(null, true);
  }
  cb(new Error("Invalid file type. Allowed file formats are PDF, DOC, DOCX, JPG, PNG, and WEBP."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

module.exports = upload;
