const { Country, State, City, Pincode } = require("../../models/index");// GET /api/locations/countries
const getCountries = async (req, res) => {
  try {
    const countries = await Country.findAll({ where: { trans_status: 1 } });
    return res.status(200).json({ countries });
  } catch (err) {
    console.error("getCountries err:", err);
    return res.status(500).json({ message: "Failed to fetch countries" });
  }
};

// GET /api/locations/states/:country_id
const getStates = async (req, res) => {
  try {
    const states = await State.findAll({ 
      where: { country_id: req.params.country_id, trans_status: 1 } 
    });
    return res.status(200).json({ states });
  } catch (err) {
    console.error("getStates err:", err);
    return res.status(500).json({ message: "Failed to fetch states" });
  }
};

// GET /api/locations/cities/:state_id
const getCities = async (req, res) => {
  try {
    const cities = await City.findAll({ 
      where: { state_id: req.params.state_id, trans_status: 1 } 
    });
    return res.status(200).json({ cities });
  } catch (err) {
    console.error("getCities err:", err);
    return res.status(500).json({ message: "Failed to fetch cities" });
  }
};

// GET /api/locations/pincode/:pincode
const getPincodeDetails = async (req, res) => {
  try {
    const { pincode } = req.params;
    const pincodeResults = await Pincode.findAll({ 
      where: { pincode, trans_status: 1 },
      include: [
        { model: Country, as: 'country', attributes: ['id', 'country_name'] },
        { model: State, as: 'state', attributes: ['id', 'state_name'] },
        { model: City, as: 'city', attributes: ['id', 'city_name', 'area', 'region', 'district'] }
      ]
    });
    
    if (!pincodeResults || pincodeResults.length === 0) {
      return res.status(404).json({ message: "Pincode not found" });
    }
    
    return res.status(200).json({ results: pincodeResults });
  } catch (err) {
    console.error("getPincodeDetails err:", err);
    return res.status(500).json({ message: "Failed to fetch pincode details" });
  }
};

// GET /api/locations/pincodes?page=1&limit=10&search=...
const getAllPincodes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const pincode = req.query.pincode || '';
    const area = req.query.area || '';
    const city = req.query.city || '';
    const district = req.query.district || '';
    const state = req.query.state || '';
    const region = req.query.region || '';
    const offset = (page - 1) * limit;

    const where = { trans_status: 1 };
    
    if (pincode) where.pincode = { [require('sequelize').Op.like]: `%${pincode}%` };
    if (area) where['$city.area$'] = { [require('sequelize').Op.like]: `%${area}%` };
    if (city) where['$city.city_name$'] = { [require('sequelize').Op.like]: `%${city}%` };
    if (district) where['$city.district$'] = { [require('sequelize').Op.like]: `%${district}%` };
    if (state) where['$state.state_name$'] = { [require('sequelize').Op.like]: `%${state}%` };
    if (region) where['$city.region$'] = { [require('sequelize').Op.like]: `%${region}%` };

    const order = [];
    if (pincode) order.push([require('sequelize').literal(`pincode = '${pincode}'`), 'DESC']);
    if (area) order.push([require('sequelize').literal(`city.area = '${area}'`), 'DESC']);
    if (city) order.push([require('sequelize').literal(`city.city_name = '${city}'`), 'DESC']);
    if (district) order.push([require('sequelize').literal(`city.district = '${district}'`), 'DESC']);
    if (state) order.push([require('sequelize').literal(`state.state_name = '${state}'`), 'DESC']);
    if (region) order.push([require('sequelize').literal(`city.region = '${region}'`), 'DESC']);
    order.push(['id', 'DESC']);

    const { count, rows } = await Pincode.findAndCountAll({ 
      where,
      include: [
        { model: Country, as: 'country', attributes: ['id', 'country_name'] },
        { model: State, as: 'state', attributes: ['id', 'state_name'] },
        { model: City, as: 'city', attributes: ['id', 'city_name', 'area', 'region', 'district'] }
      ],
      limit,
      offset,
      order
    });

    return res.status(200).json({ 
      pincodes: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error("getAllPincodes err:", err);
    return res.status(500).json({ message: "Failed to fetch pincodes" });
  }
};

// GET /api/locations/pincodes/city/:city_id
const getPincodesByCity = async (req, res) => {
  try {
    const pincodes = await Pincode.findAll({ 
      where: { city_id: req.params.city_id, trans_status: 1 },
      include: [
        { model: City, as: 'city', attributes: ['id', 'city_name', 'area', 'region', 'district'] }
      ]
    });
    return res.status(200).json({ pincodes });
  } catch (err) {
    console.error("getPincodesByCity err:", err);
    return res.status(500).json({ message: "Failed to fetch pincodes for city" });
  }
};

// GET /api/locations/suggestions?field=area&query=jay
const getSuggestions = async (req, res) => {
  try {
    const { field, query } = req.query;
    if (!field || !query || query.length < 2) return res.json({ suggestions: [] });

    let results = [];
    const Op = require('sequelize').Op;

    if (field === 'pincode') {
      results = await Pincode.findAll({
        attributes: [[require('sequelize').fn('DISTINCT', require('sequelize').col('pincode')), 'value']],
        where: { pincode: { [Op.like]: `${query}%` }, trans_status: 1 },
        limit: 10
      });
    } else if (['area', 'city', 'district', 'region'].includes(field)) {
      const dbField = field === 'city' ? 'city_name' : field;
      results = await City.findAll({
        attributes: [[require('sequelize').fn('DISTINCT', require('sequelize').col(dbField)), 'value']],
        where: { [dbField]: { [Op.like]: `${query}%` }, trans_status: 1 },
        limit: 10
      });
    } else if (field === 'state') {
      results = await State.findAll({
        attributes: [[require('sequelize').fn('DISTINCT', require('sequelize').col('state_name')), 'value']],
        where: { state_name: { [Op.like]: `${query}%` }, trans_status: 1 },
        limit: 10
      });
    }

    return res.status(200).json({ suggestions: results.map(r => r.getDataValue('value')) });
  } catch (err) {
    console.error("getSuggestions err:", err);
    return res.status(500).json({ message: "Failed to fetch suggestions" });
  }
};

module.exports = { getCountries, getStates, getCities, getPincodeDetails, getAllPincodes, getPincodesByCity, getSuggestions };
