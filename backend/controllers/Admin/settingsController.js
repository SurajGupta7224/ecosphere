const {
  AppSettings, BrandingSettings, ThemeSettings, CompanySettings,
  EmailSettings, SecuritySettings, SystemSettings, AuditLog, User
} = require("../../models/index");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");

// Helper to write audit log
const writeAuditLog = async (req, action, module, oldValue, newValue) => {
  try {
    const userId = req.user ? req.user.id : null;
    const userName = req.user ? req.user.name : "System";
    const ipAddress = req.ip || req.connection.remoteAddress;

    await AuditLog.create({
      user_id: userId,
      user_name: userName,
      action,
      module,
      old_value: typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue),
      new_value: typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue),
      ip_address: ipAddress
    });
  } catch (err) {
    console.error("Audit log writing failed:", err);
  }
};

// GET Public Settings (for login & public pages before auth)
exports.getPublicSettings = async (req, res) => {
  try {
    const [branding] = await BrandingSettings.findOrCreate({ where: { id: 1 } });
    const [theme] = await ThemeSettings.findOrCreate({ where: { id: 1 } });
    const [app] = await AppSettings.findOrCreate({ where: { id: 1 } });
    const [system] = await SystemSettings.findOrCreate({ where: { id: 1 } });

    res.json({
      success: true,
      settings: {
        appName: app.app_name,
        appShortName: app.app_short_name,
        defaultLanguage: app.default_language,
        companyName: branding.company_name,
        companyTagline: branding.company_tagline,
        companyLogo: branding.company_logo,
        favicon: branding.favicon,
        loginLogo: branding.login_logo,
        loginBg: branding.login_bg,
        footerCopyright: branding.footer_copyright,
        supportEmail: branding.support_email,
        supportPhone: branding.support_phone,
        maintenanceMode: system.maintenance_mode,
        theme: {
          theme_type: theme.theme_type,
          primary_color: theme.primary_color,
          secondary_color: theme.secondary_color,
          sidebar_color: theme.sidebar_color,
          sidebar_text_color: theme.sidebar_text_color,
          sidebar_active_bg_color: theme.sidebar_active_bg_color,
          sidebar_active_text_color: theme.sidebar_active_text_color,
          navbar_color: theme.navbar_color,
          card_bg_color: theme.card_bg_color,
          button_color: theme.button_color,
          text_color: theme.text_color
        }
      }
    });
  } catch (error) {
    console.error("Fetch Public Settings Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET All Settings (Admin)
exports.getSettings = async (req, res) => {
  try {
    const [app] = await AppSettings.findOrCreate({ where: { id: 1 } });
    const [branding] = await BrandingSettings.findOrCreate({ where: { id: 1 } });
    const [theme] = await ThemeSettings.findOrCreate({ where: { id: 1 } });
    const [company] = await CompanySettings.findOrCreate({ where: { id: 1 } });
    const [email] = await EmailSettings.findOrCreate({ where: { id: 1 } });
    const [security] = await SecuritySettings.findOrCreate({ where: { id: 1 } });
    const [system] = await SystemSettings.findOrCreate({ where: { id: 1 } });

    res.json({
      success: true,
      settings: {
        app,
        branding,
        theme,
        company,
        email,
        security,
        system
      }
    });
  } catch (error) {
    console.error("Fetch Settings Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// UPDATE General Settings
exports.updateGeneralSettings = async (req, res) => {
  try {
    const settings = await AppSettings.findByPk(1);
    const oldValues = settings.toJSON();
    
    await settings.update(req.body);
    await writeAuditLog(req, "Update General Settings", "General", oldValues, settings.toJSON());

    res.json({ success: true, message: "General Settings updated successfully", settings });
  } catch (error) {
    console.error("Update General Settings Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// UPDATE Branding Settings
exports.updateBrandingSettings = async (req, res) => {
  try {
    const settings = await BrandingSettings.findByPk(1);
    const oldValues = settings.toJSON();

    const updateData = { ...req.body };

    // Process files if uploaded
    if (req.files) {
      if (req.files.company_logo) {
        updateData.company_logo = `Others/${req.files.company_logo[0].filename}`;
      }
      if (req.files.favicon) {
        updateData.favicon = `Others/${req.files.favicon[0].filename}`;
      }
      if (req.files.login_logo) {
        updateData.login_logo = `Others/${req.files.login_logo[0].filename}`;
      }
      if (req.files.login_bg) {
        updateData.login_bg = `Others/${req.files.login_bg[0].filename}`;
      }
    }

    await settings.update(updateData);
    await writeAuditLog(req, "Update Branding Settings", "Branding", oldValues, settings.toJSON());

    res.json({ success: true, message: "Branding Settings updated successfully", settings });
  } catch (error) {
    console.error("Update Branding Settings Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// UPDATE Theme Settings
exports.updateThemeSettings = async (req, res) => {
  try {
    const settings = await ThemeSettings.findByPk(1);
    const oldValues = settings.toJSON();

    await settings.update(req.body);
    await writeAuditLog(req, "Update Theme Settings", "Theme", oldValues, settings.toJSON());

    res.json({ success: true, message: "Theme Settings updated successfully", settings });
  } catch (error) {
    console.error("Update Theme Settings Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// UPDATE Company Settings
exports.updateCompanySettings = async (req, res) => {
  try {
    const settings = await CompanySettings.findByPk(1);
    const oldValues = settings.toJSON();

    await settings.update(req.body);
    await writeAuditLog(req, "Update Company Settings", "Company", oldValues, settings.toJSON());

    res.json({ success: true, message: "Company Settings updated successfully", settings });
  } catch (error) {
    console.error("Update Company Settings Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// UPDATE Email Settings
exports.updateEmailSettings = async (req, res) => {
  try {
    const settings = await EmailSettings.findByPk(1);
    const oldValues = settings.toJSON();

    await settings.update(req.body);
    await writeAuditLog(req, "Update Email Settings", "Email", oldValues, settings.toJSON());

    res.json({ success: true, message: "Email Settings updated successfully", settings });
  } catch (error) {
    console.error("Update Email Settings Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// TEST Email Configuration
exports.testEmailConfiguration = async (req, res) => {
  try {
    const { smtp_host, smtp_port, smtp_username, smtp_password, encryption_type, from_email, from_name, test_recipient } = req.body;

    if (!test_recipient) {
      return res.status(400).json({ success: false, message: "Recipient email is required" });
    }

    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: parseInt(smtp_port),
      secure: encryption_type === 'ssl',
      auth: smtp_username ? {
        user: smtp_username,
        pass: smtp_password
      } : undefined
    });

    await transporter.sendMail({
      from: `"${from_name}" <${from_email}>`,
      to: test_recipient,
      subject: "Ecosphere SMTP Configuration Test",
      text: "This is a test email from the Ecosphere Admin Portal to verify your SMTP configuration. If you receive this, your settings are working properly!",
      html: "<h3>Ecosphere Admin Portal</h3><p>This is a test email to verify your SMTP configuration. If you receive this, your settings are working properly!</p>"
    });

    await writeAuditLog(req, `SMTP Connection Test to ${test_recipient}`, "Email", "N/A", "Success");

    res.json({ success: true, message: `Test email sent successfully to ${test_recipient}` });
  } catch (error) {
    console.error("SMTP Test Error:", error);
    await writeAuditLog(req, "SMTP Connection Test Failed", "Email", "N/A", error.message);
    res.status(500).json({ success: false, message: `SMTP connection failed: ${error.message}` });
  }
};

// UPDATE Security Settings
exports.updateSecuritySettings = async (req, res) => {
  try {
    const settings = await SecuritySettings.findByPk(1);
    const oldValues = settings.toJSON();

    await settings.update(req.body);
    await writeAuditLog(req, "Update Security Settings", "Security", oldValues, settings.toJSON());

    res.json({ success: true, message: "Security Settings updated successfully", settings });
  } catch (error) {
    console.error("Update Security Settings Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// UPDATE System Settings
exports.updateSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.findByPk(1);
    const oldValues = settings.toJSON();

    await settings.update(req.body);
    await writeAuditLog(req, "Update System Settings", "System", oldValues, settings.toJSON());

    res.json({ success: true, message: "System Settings updated successfully", settings });
  } catch (error) {
    console.error("Update System Settings Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET Audit Logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, user_id, module, start_date, end_date } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {};

    if (user_id) {
      whereClause.user_id = user_id;
    }
    if (module) {
      whereClause.module = module;
    }
    if (start_date && end_date) {
      whereClause.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date + "T23:59:59.999Z")]
      };
    } else if (start_date) {
      whereClause.created_at = {
        [Op.gte]: new Date(start_date)
      };
    } else if (end_date) {
      whereClause.created_at = {
        [Op.lte]: new Date(end_date + "T23:59:59.999Z")
      };
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
      include: [
        { model: User, as: "user", attributes: ["name", "email"] }
      ]
    });

    res.json({
      success: true,
      logs: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Fetch Audit Logs Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
