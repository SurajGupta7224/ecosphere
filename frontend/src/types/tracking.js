/**
 * @typedef {Object} TrackingPoint
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} [accuracy]
 * @property {number} [altitude]
 * @property {number} [bearing]
 * @property {number} [speed]
 * @property {number} [timestamp]
 * @property {string} [id]
 */

/**
 * @typedef {Object} DestinationInfo
 * @property {number} [latitude]
 * @property {number} [longitude]
 * @property {number} [lat]
 * @property {number} [lng]
 * @property {string} [name]
 * @property {string} [address]
 */

/**
 * @typedef {Object} TrackingMetadata
 * @property {DestinationInfo} [destination]
 * @property {number} [destinationLat]
 * @property {number} [destinationLng]
 * @property {string} [destinationName]
 * @property {string} [destinationAddress]
 */

/**
 * @typedef {Object} TrackingNode
 * @property {string} driverId
 * @property {string} [driverName]
 * @property {string} [vehicleNumber]
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} [speed]
 * @property {string} [status]
 * @property {number} [accuracy]
 * @property {number} [altitude]
 * @property {number} [bearing]
 * @property {number} [startTime]
 * @property {number} [endTime]
 * @property {number} [timestamp]
 * @property {string} [sessionId]
 * @property {number} [totalDistance]
 * @property {TrackingMetadata} [metadata]
 * @property {Object.<string, TrackingPoint>} [points]
 */

/**
 * @typedef {Object} VehicleSummary
 * @property {string} id - Driver ID / Node Key
 * @property {string} vehicleNumber
 * @property {string} driverName
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} speed
 * @property {string} status
 * @property {number} timestamp
 * @property {number} totalDistance
 * @property {boolean} isDeviation
 * @property {TrackingPoint[]} pointsArray
 * @property {TrackingPoint|null} startPoint
 * @property {TrackingPoint|null} destinationPoint
 * @property {TrackingNode} rawData
 */

export {};
