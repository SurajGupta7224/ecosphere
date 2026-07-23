const { Employee, User, Vehicle } = require("../../models/index");
const { Op } = require("sequelize");

// GET /api/employees - List all employees
const getAllEmployees = async (req, res) => {
  try {
    const { status, approval_status, staff_type } = req.query;
    const where = {};
    if (status) where.employee_status = status;
    if (approval_status) where.profile_approval_status = approval_status;
    if (staff_type) where.staff_type = staff_type;

    const isAdmin = req.user?.role?.role_name?.toLowerCase() === 'admin';
    if (!isAdmin) {
      where.user_id = req.user.id;
    }

    const employees = await Employee.findAll({
      where,
      include: [
        { model: User, as: "approver", attributes: ["id", "name", "email"] },
        { model: Vehicle, as: "driverVehicles", attributes: ["id", "registration_number", "brand", "model"] }
      ],
      order: [["created_at", "DESC"]]
    });

    return res.status(200).json({ employees });
  } catch (err) {
    console.error("getAllEmployees error:", err);
    return res.status(500).json({ message: "Failed to fetch employees" });
  }
};

// GET /api/employees/:id - Get employee details
const getEmployeeById = async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Employee.findByPk(id, {
      include: [
        { model: User, as: "approver", attributes: ["id", "name", "email"] }
      ]
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({ employee });
  } catch (err) {
    console.error("getEmployeeById error:", err);
    return res.status(500).json({ message: "Failed to fetch employee details" });
  }
};

// POST /api/employees - Create employee
const createEmployee = async (req, res) => {
  try {
    const {
      name, email, mobile_number, gender, blood_group, marital_status,
      father_husband_name, dob, staff_type, address,
      aadhaar_number, pan_card_number, esi_number, epf_number,
      driving_license_number, police_verification_number,
      medical_certificate_number, eyesight_certificate_number,
      profile_approval_status, employee_status
    } = req.body;

    // Validate required fields
    if (!name || !mobile_number || !gender || !dob || !staff_type || !address || !aadhaar_number || !pan_card_number) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Uniqueness validation check (ONLY FOR ADD/CREATE EMPLOYEE)
    const existing = await Employee.findOne({
      where: {
        [Op.or]: [
          { mobile_number },
          { aadhaar_number }
        ]
      }
    });

    if (existing) {
      if (existing.mobile_number === mobile_number) {
        return res.status(400).json({
          message: `Mobile number is already registered by employee ${existing.name} (ID: EMP-${existing.id})`
        });
      }
      if (existing.aadhaar_number === aadhaar_number) {
        return res.status(400).json({
          message: `Aadhaar number is already registered by employee ${existing.name} (ID: EMP-${existing.id})`
        });
      }
    }

    // Process files
    const fileFields = [
      'profile_photo', 'aadhaar_front_image', 'aadhaar_back_image', 'pan_card_image',
      'driving_license_front_image', 'driving_license_back_image', 'police_verification_image',
      'medical_certificate_image', 'eyesight_certificate_image'
    ];

    const fileData = {};
    if (req.files) {
      fileFields.forEach(field => {
        if (req.files[field] && req.files[field][0]) {
          fileData[field] = req.files[field][0].filename;
        }
      });
    }

    // Validate that required images for new employee are present
    if (!fileData.aadhaar_front_image || !fileData.aadhaar_back_image || !fileData.pan_card_image) {
      return res.status(400).json({ message: "Aadhaar Front/Back and PAN Card images are required" });
    }

    if (staff_type === 'driver') {
      if (!driving_license_number || !driving_license_number.trim()) {
        return res.status(400).json({ message: "Driving license number is required for Driver" });
      }
      if (!fileData.driving_license_front_image || !fileData.driving_license_back_image) {
        return res.status(400).json({ message: "Driving License Front and Back images are required for Driver" });
      }
    }

    // Approval logs details
    let approved_by = null;
    let approved_date = null;
    if (profile_approval_status === "approved") {
      approved_by = req.user.id;
      approved_date = new Date();
    }

    const employee = await Employee.create({
      user_id: req.user.id,
      name,
      email: email || null,
      mobile_number,
      gender,
      blood_group: blood_group || null,
      marital_status: marital_status || null,
      father_husband_name: father_husband_name || null,
      dob,
      staff_type,
      address,
      aadhaar_number,
      pan_card_number,
      esi_number: esi_number || null,
      epf_number: epf_number || null,
      driving_license_number: staff_type === "driver" ? driving_license_number : null,
      police_verification_number: police_verification_number || null,
      medical_certificate_number: medical_certificate_number || null,
      eyesight_certificate_number: eyesight_certificate_number || null,
      
      profile_approval_status: profile_approval_status || "pending",
      employee_status: employee_status || "active",
      approved_by,
      approved_date,

      // Files
      ...fileData
    });

    return res.status(201).json({ message: "Employee created successfully", employeeId: employee.id });
  } catch (err) {
    console.error("createEmployee error:", err);
    return res.status(500).json({ message: "Failed to create employee", error: err.message });
  }
};

// PUT /api/employees/:id - Update employee
const updateEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const {
      name, email, mobile_number, gender, blood_group, marital_status,
      father_husband_name, dob, staff_type, address,
      aadhaar_number, pan_card_number, esi_number, epf_number,
      driving_license_number, police_verification_number,
      medical_certificate_number, eyesight_certificate_number,
      profile_approval_status, employee_status
    } = req.body;

    const updateData = {
      name,
      email: email || null,
      mobile_number,
      gender,
      blood_group: blood_group || null,
      marital_status: marital_status || null,
      father_husband_name: father_husband_name || null,
      dob,
      staff_type,
      address,
      aadhaar_number,
      pan_card_number,
      esi_number: esi_number || null,
      epf_number: epf_number || null,
      driving_license_number: staff_type === "driver" ? driving_license_number : null,
      police_verification_number: police_verification_number || null,
      medical_certificate_number: medical_certificate_number || null,
      eyesight_certificate_number: eyesight_certificate_number || null,
      profile_approval_status: profile_approval_status || employee.profile_approval_status,
      employee_status: employee_status || employee.employee_status
    };

    // If staff type changed to helper, clear license details
    if (staff_type === "helper") {
      updateData.driving_license_number = null;
      updateData.driving_license_front_image = null;
      updateData.driving_license_back_image = null;
    }

    // Process approval logic
    if (updateData.profile_approval_status === "approved" && employee.profile_approval_status !== "approved") {
      updateData.approved_by = req.user.id;
      updateData.approved_date = new Date();
    } else if (updateData.profile_approval_status !== "approved") {
      updateData.approved_by = null;
      updateData.approved_date = null;
    }

    // Process uploaded files
    if (req.files) {
      const fileFields = [
        'profile_photo', 'aadhaar_front_image', 'aadhaar_back_image', 'pan_card_image',
        'driving_license_front_image', 'driving_license_back_image', 'police_verification_image',
        'medical_certificate_image', 'eyesight_certificate_image'
      ];
      fileFields.forEach(field => {
        if (req.files[field] && req.files[field][0]) {
          updateData[field] = req.files[field][0].filename;
        }
      });
    }

    await employee.update(updateData);
    return res.status(200).json({ message: "Employee updated successfully", employee });
  } catch (err) {
    console.error("updateEmployee error:", err);
    return res.status(500).json({ message: "Failed to update employee", error: err.message });
  }
};

// PATCH /api/employees/:id/status - Toggle active/inactive status
const updateEmployeeStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await employee.update({ employee_status: status });
    return res.status(200).json({ message: "Employee status updated successfully" });
  } catch (err) {
    console.error("updateEmployeeStatus error:", err);
    return res.status(500).json({ message: "Failed to update employee status" });
  }
};

// DELETE /api/employees/:id - Delete employee record
const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await employee.destroy();
    return res.status(200).json({ message: "Employee record deleted successfully" });
  } catch (err) {
    console.error("deleteEmployee error:", err);
    return res.status(500).json({ message: "Failed to delete employee record" });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee
};
