const { CollectionEvent, Corporation, Zone, Ward } = require("../../models/index");
const { Op } = require("sequelize");

// GET /api/collection-events
const getAllCollectionEvents = async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search = '', 
    status = '', 
    corporation_id = '', 
    zone_id = '', 
    ward_id = '',
    sortField = 'id', 
    sortOrder = 'DESC' 
  } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where[Op.or] = [
      { event_name: { [Op.like]: `%${search}%` } },
      { address: { [Op.like]: `%${search}%` } }
    ];
  }
  if (status) {
    where.status = status;
  }
  if (corporation_id) {
    where.corporation_id = corporation_id;
  }
  if (zone_id) {
    where.zone_id = zone_id;
  }
  if (ward_id) {
    where.ward_id = ward_id;
  }

  const allowedSortFields = ['id', 'event_name', 'status', 'created_at'];
  const orderField = allowedSortFields.includes(sortField) ? sortField : 'id';
  const orderDir = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

  try {
    const { count, rows } = await CollectionEvent.findAndCountAll({
      where,
      include: [
        {
          model: Corporation,
          as: "corporation",
          attributes: ["id", "corporation_name"]
        },
        {
          model: Zone,
          as: "zone",
          attributes: ["id", "zone_name"]
        },
        {
          model: Ward,
          as: "ward",
          attributes: ["id", "ward_name"]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[orderField, orderDir]]
    });

    return res.status(200).json({
      collectionEvents: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error("getAllCollectionEvents error:", err);
    return res.status(500).json({ message: "Failed to fetch collection events" });
  }
};

// GET /api/collection-events/:id
const getCollectionEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await CollectionEvent.findByPk(id, {
      include: [
        { model: Corporation, as: "corporation", attributes: ["id", "corporation_name"] },
        { model: Zone, as: "zone", attributes: ["id", "zone_name"] },
        { model: Ward, as: "ward", attributes: ["id", "ward_name"] }
      ]
    });
    if (!event) {
      return res.status(404).json({ message: "Collection event not found" });
    }
    return res.status(200).json({ collectionEvent: event });
  } catch (err) {
    console.error("getCollectionEventById error:", err);
    return res.status(500).json({ message: "Failed to fetch collection event details" });
  }
};

// POST /api/collection-events
const createCollectionEvent = async (req, res) => {
  const { 
    corporation_id, 
    zone_id, 
    ward_id, 
    event_name, 
    categories, 
    address, 
    landmark, 
    google_map_url, 
    latitude, 
    longitude, 
    status 
  } = req.body;

  // Validation
  if (!corporation_id) return res.status(400).json({ message: "Corporation is required" });
  if (!zone_id) return res.status(400).json({ message: "Zone is required" });
  if (!ward_id) return res.status(400).json({ message: "Ward is required" });
  if (!event_name || !event_name.trim()) return res.status(400).json({ message: "Collection event name is required" });
  
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({ message: "At least one category is required" });
  }
  if (!address || !address.trim()) return res.status(400).json({ message: "Complete address is required" });

  try {
    // Verify Corporation, Zone, and Ward are Active
    const corporation = await Corporation.findByPk(corporation_id);
    if (!corporation || corporation.status !== 'Active') {
      return res.status(400).json({ message: "Selected Corporation must be active" });
    }

    const zone = await Zone.findByPk(zone_id);
    if (!zone || zone.status !== 'Active' || zone.corporation_id !== parseInt(corporation_id)) {
      return res.status(400).json({ message: "Selected Zone must be active and belong to the selected Corporation" });
    }

    const ward = await Ward.findByPk(ward_id);
    if (!ward || ward.status !== 'Active' || ward.zone_id !== parseInt(zone_id)) {
      return res.status(400).json({ message: "Selected Ward must be active and belong to the selected Zone" });
    }

    // Unique check under the selected Ward
    const existing = await CollectionEvent.findOne({
      where: { 
        ward_id, 
        event_name: event_name.trim() 
      }
    });
    if (existing) {
      return res.status(400).json({ message: "Collection event name already exists in this Ward" });
    }

    const event = await CollectionEvent.create({
      corporation_id,
      zone_id,
      ward_id,
      event_name: event_name.trim(),
      categories,
      address: address.trim(),
      landmark: landmark ? landmark.trim() : null,
      google_map_url: google_map_url ? google_map_url.trim() : null,
      latitude: latitude || null,
      longitude: longitude || null,
      status: status || 'Active'
    });

    return res.status(201).json({ message: "Collection event created successfully", collectionEvent: event });
  } catch (err) {
    console.error("createCollectionEvent error:", err);
    return res.status(500).json({ message: "Failed to create collection event" });
  }
};

// PUT /api/collection-events/:id
const updateCollectionEvent = async (req, res) => {
  const { id } = req.params;
  const { 
    corporation_id, 
    zone_id, 
    ward_id, 
    event_name, 
    categories, 
    address, 
    landmark, 
    google_map_url, 
    latitude, 
    longitude, 
    status 
  } = req.body;

  if (!corporation_id) return res.status(400).json({ message: "Corporation is required" });
  if (!zone_id) return res.status(400).json({ message: "Zone is required" });
  if (!ward_id) return res.status(400).json({ message: "Ward is required" });
  if (!event_name || !event_name.trim()) return res.status(400).json({ message: "Collection event name is required" });
  
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({ message: "At least one category is required" });
  }
  if (!address || !address.trim()) return res.status(400).json({ message: "Complete address is required" });

  try {
    const event = await CollectionEvent.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: "Collection event not found" });
    }

    // Verify Zone and Ward links
    const zone = await Zone.findByPk(zone_id);
    if (!zone || zone.corporation_id !== parseInt(corporation_id)) {
      return res.status(400).json({ message: "Selected Zone does not belong to the selected Corporation" });
    }

    const ward = await Ward.findByPk(ward_id);
    if (!ward || ward.zone_id !== parseInt(zone_id)) {
      return res.status(400).json({ message: "Selected Ward does not belong to the selected Zone" });
    }

    // Unique check under the selected Ward excluding self
    const existing = await CollectionEvent.findOne({
      where: {
        ward_id,
        event_name: event_name.trim(),
        id: { [Op.ne]: id }
      }
    });
    if (existing) {
      return res.status(400).json({ message: "Collection event name already exists in this Ward" });
    }

    await event.update({
      corporation_id,
      zone_id,
      ward_id,
      event_name: event_name.trim(),
      categories,
      address: address.trim(),
      landmark: landmark ? landmark.trim() : null,
      google_map_url: google_map_url ? google_map_url.trim() : null,
      latitude: latitude || null,
      longitude: longitude || null,
      status: status || event.status
    });

    return res.status(200).json({ message: "Collection event updated successfully", collectionEvent: event });
  } catch (err) {
    console.error("updateCollectionEvent error:", err);
    return res.status(500).json({ message: "Failed to update collection event" });
  }
};

// PATCH /api/collection-events/:id/status
const toggleCollectionEventStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const event = await CollectionEvent.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: "Collection event not found" });
    }

    await event.update({ status });
    return res.status(200).json({ message: "Status updated successfully", status });
  } catch (err) {
    console.error("toggleCollectionEventStatus error:", err);
    return res.status(500).json({ message: "Failed to update status" });
  }
};

// DELETE /api/collection-events/:id
const deleteCollectionEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await CollectionEvent.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: "Collection event not found" });
    }

    await event.destroy();
    return res.status(200).json({ message: "Collection event deleted successfully" });
  } catch (err) {
    console.error("deleteCollectionEvent error:", err);
    return res.status(500).json({ message: "Failed to delete collection event" });
  }
};

module.exports = {
  getAllCollectionEvents,
  getCollectionEventById,
  createCollectionEvent,
  updateCollectionEvent,
  toggleCollectionEventStatus,
  deleteCollectionEvent
};
