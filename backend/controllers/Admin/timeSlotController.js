const { TimeSlot, WasteCollectionRequest } = require("../../models/index");
const { Op } = require("sequelize");
const sequelize = require("../../config/db");

// Helper to format TIME "09:00:00" to "09:00 AM"
function formatTimeToAMPM(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'
  const hStr = h < 10 ? `0${h}` : h.toString();
  return `${hStr}:${m} ${ampm}`;
}

// Helper to calculate duration between "HH:MM:SS" times
function getDurationString(startTime, endTime) {
  if (!startTime || !endTime) return '';
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let diffMin = (eh * 60 + em) - (sh * 60 + sm);
  if (diffMin < 0) {
    diffMin += 24 * 60;
  }
  const hrs = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  let res = [];
  if (hrs > 0) res.push(`${hrs} Hour${hrs > 1 ? 's' : ''}`);
  if (mins > 0) res.push(`${mins} Min${mins > 1 ? 's' : ''}`);
  return res.join(' ') || '0 Hours';
}

// GET /api/admin/time-slots (Admin View)
const getAllTimeSlots = async (req, res) => {
  const { search = '', status = '' } = req.query;

  const where = {};
  if (search) {
    where.slot_name = { [Op.like]: `%${search}%` };
  }
  if (status) {
    where.status = status;
  }

  try {
    // 1. Fetch dashboard statistics
    const totalSlots = await TimeSlot.count();
    const activeSlots = await TimeSlot.count({ where: { status: 'Active' } });
    const inactiveSlots = await TimeSlot.count({ where: { status: 'Inactive' } });

    // 2. Fetch all slots matching filter
    const slots = await TimeSlot.findAll({
      where,
      order: [
        ['start_time', 'ASC'],
        ['end_time', 'ASC']
      ]
    });

    // 3. Map format response
    const formattedSlots = slots.map(slot => {
      return {
        id: slot.id,
        slot_name: slot.slot_name,
        start_time: slot.start_time,
        end_time: slot.end_time,
        start_time_formatted: formatTimeToAMPM(slot.start_time),
        end_time_formatted: formatTimeToAMPM(slot.end_time),
        duration_string: getDurationString(slot.start_time, slot.end_time),
        status: slot.status,
        description: slot.description,
        created_at: slot.created_at,
        updated_at: slot.updated_at
      };
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalSlots,
        activeSlots,
        inactiveSlots
      },
      slots: formattedSlots
    });

  } catch (err) {
    console.error("getAllTimeSlots error:", err);
    return res.status(500).json({ success: false, message: "Failed to load time slots." });
  }
};

// GET /api/admin/time-slots/active (User / Standalone view for request booking)
const getActiveTimeSlots = async (req, res) => {
  try {
    const slots = await TimeSlot.findAll({
      where: { status: 'Active' },
      order: [
        ['start_time', 'ASC'],
        ['end_time', 'ASC']
      ]
    });

    const formattedSlots = slots.map(slot => {
      return {
        id: slot.id,
        slot_name: slot.slot_name,
        start_time: slot.start_time,
        end_time: slot.end_time,
        start_time_formatted: formatTimeToAMPM(slot.start_time),
        end_time_formatted: formatTimeToAMPM(slot.end_time),
        duration_string: getDurationString(slot.start_time, slot.end_time),
        status: slot.status,
        description: slot.description
      };
    });

    return res.status(200).json({
      success: true,
      slots: formattedSlots
    });
  } catch (err) {
    console.error("getActiveTimeSlots error:", err);
    return res.status(500).json({ success: false, message: "Failed to load active time slots." });
  }
};

// POST /api/admin/time-slots
const createTimeSlot = async (req, res) => {
  const { slot_name, start_time, end_time, status, description } = req.body;

  if (!slot_name || !start_time || !end_time) {
    return res.status(400).json({ success: false, message: "Slot Name, Start Time, and End Time are required." });
  }

  if (start_time >= end_time) {
    return res.status(400).json({ success: false, message: "End Time must always be greater than Start Time." });
  }

  try {
    // 1. Check for exact duplicate slot
    const duplicate = await TimeSlot.findOne({
      where: {
        start_time,
        end_time
      }
    });

    if (duplicate) {
      return res.status(400).json({ success: false, message: "This time slot already exists." });
    }

    // 2. Check for overlapping slots
    const overlap = await TimeSlot.findOne({
      where: {
        start_time: { [Op.lt]: end_time },
        end_time: { [Op.gt]: start_time }
      }
    });

    if (overlap) {
      return res.status(400).json({ success: false, message: "This time slot overlaps with an existing slot." });
    }

    const newSlot = await TimeSlot.create({
      slot_name,
      start_time,
      end_time,
      status: status || 'Active',
      description: description || null
    });

    return res.status(201).json({
      success: true,
      message: "Time slot created successfully.",
      slot: newSlot
    });

  } catch (err) {
    console.error("createTimeSlot error:", err);
    return res.status(500).json({ success: false, message: "Failed to create time slot." });
  }
};

// PUT /api/admin/time-slots/:id
const updateTimeSlot = async (req, res) => {
  const { id } = req.params;
  const { slot_name, start_time, end_time, status, description } = req.body;

  if (!slot_name || !start_time || !end_time) {
    return res.status(400).json({ success: false, message: "Slot Name, Start Time, and End Time are required." });
  }

  if (start_time >= end_time) {
    return res.status(400).json({ success: false, message: "End Time must always be greater than Start Time." });
  }

  try {
    const slot = await TimeSlot.findByPk(id);
    if (!slot) {
      return res.status(404).json({ success: false, message: "Time slot not found." });
    }

    // 1. Check for duplicate slot (excluding current slot)
    const duplicate = await TimeSlot.findOne({
      where: {
        start_time,
        end_time,
        id: { [Op.ne]: id }
      }
    });

    if (duplicate) {
      return res.status(400).json({ success: false, message: "This time slot already exists." });
    }

    // 2. Check for overlapping slots (excluding current slot)
    const overlap = await TimeSlot.findOne({
      where: {
        start_time: { [Op.lt]: end_time },
        end_time: { [Op.gt]: start_time },
        id: { [Op.ne]: id }
      }
    });

    if (overlap) {
      return res.status(400).json({ success: false, message: "This time slot overlaps with an existing slot." });
    }

    await slot.update({
      slot_name,
      start_time,
      end_time,
      status: status || 'Active',
      description: description || null
    });

    return res.status(200).json({
      success: true,
      message: "Time slot updated successfully.",
      slot
    });

  } catch (err) {
    console.error("updateTimeSlot error:", err);
    return res.status(500).json({ success: false, message: "Failed to update time slot." });
  }
};

// PATCH /api/admin/time-slots/:id/status
const toggleTimeSlotStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const slot = await TimeSlot.findByPk(id);
    if (!slot) {
      return res.status(404).json({ success: false, message: "Time slot not found." });
    }

    const nextStatus = slot.status === 'Active' ? 'Inactive' : 'Active';
    await slot.update({ status: nextStatus });

    return res.status(200).json({
      success: true,
      message: `Time slot is now ${nextStatus}.`,
      slot
    });
  } catch (err) {
    console.error("toggleTimeSlotStatus error:", err);
    return res.status(500).json({ success: false, message: "Failed to update status." });
  }
};

// DELETE /api/admin/time-slots/:id
const deleteTimeSlot = async (req, res) => {
  const { id } = req.params;

  try {
    const slot = await TimeSlot.findByPk(id);
    if (!slot) {
      return res.status(404).json({ success: false, message: "Time slot not found." });
    }

    await slot.destroy();

    return res.status(200).json({
      success: true,
      message: "Time slot deleted successfully."
    });
  } catch (err) {
    console.error("deleteTimeSlot error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete time slot." });
  }
};

module.exports = {
  getAllTimeSlots,
  getActiveTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  toggleTimeSlotStatus,
  deleteTimeSlot
};
