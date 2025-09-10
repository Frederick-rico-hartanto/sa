const { Op } = require('sequelize');
const Report = require('../models/Report');
const { utcToZonedTime, format } = require('date-fns-tz');
const { parseISO } = require('date-fns');

/**
 * Converts a UTC time string to a Date object in Jakarta time.
 * @param {string} utcTime - The time string in HH:mm:ss format.
 * @returns {Date} - The Date object in the correct timezone.
 */
const toJakartaTime = (utcTime) => {
  const timeZone = 'Asia/Jakarta';
  // Create a date object assuming UTC, then convert it
  const utcDate = parseISO(`1970-01-01T${utcTime}Z`); 
  if (isNaN(utcDate.getTime())) {
    throw new Error(`Invalid UTC time format: ${utcTime}`);
  }
  return utcToZonedTime(utcDate, timeZone);
};

/**
 * Creates a new report in the database.
 * @param {object} reportData - The data for the new report.
 * @param {string} userId - The ID of the user submitting the report.
 * @returns {Promise<object>} The created report object.
 */
const submitReport = async (reportData, userId) => {
  const { customerName, date, location, submissionTime, endTime, description, photoPath } = reportData;

  const formattedSubmissionTime = submissionTime
    ? format(toJakartaTime(submissionTime), 'HH:mm:ss')
    : null;
  const formattedEndTime = endTime 
    ? format(toJakartaTime(endTime), 'HH:mm:ss') 
    : null;

  if (!formattedSubmissionTime) {
    throw new Error('Invalid submission time.');
  }

  const report = await Report.create({
    userId,
    name: customerName,
    date,
    location,
    photo: photoPath,
    submissionTime: formattedSubmissionTime,
    endTime: formattedEndTime,
    description,
  });

  return report;
};

/**
 * Fetches reports based on user role.
 * @param {string} userId - The ID of the user requesting reports.
 * @param {string} role - The role of the user ('admin' or 'user').
 * @returns {Promise<Array>} A list of reports.
 */
const getReports = async (userId, role) => {
  let reports;
  if (role === 'admin') {
    reports = await Report.findAll({ order: [['createdAt', 'DESC']] });
  } else {
    reports = await Report.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
  }

  if (!reports || reports.length === 0) {
    return []; // Return empty array instead of throwing error
  }

  // Prepend server path to photo URLs for client consumption
  return reports.map((report) => ({
    ...report.toJSON(),
    photo: report.photo ? `/${report.photo}` : null,
  }));
};

/**
 * Fetches all reports created today (in Jakarta time).
 * @returns {Promise<Array>} A list of today's reports.
 */
const getDailyReports = async () => {
  const now = new Date();
  const jakartaNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));

  const todayStart = new Date(jakartaNow.setHours(0, 0, 0, 0));
  const todayEnd = new Date(new Date(todayStart).setDate(todayStart.getDate() + 1));

  const reports = await Report.findAll({
    where: {
      createdAt: {
        [Op.gte]: todayStart,
        [Op.lt]: todayEnd,
      },
    },
    order: [['createdAt', 'DESC']],
  });
  
  return reports.map((report) => ({
    ...report.toJSON(),
    photo: report.photo ? `/${report.photo}` : null,
  }));
};

module.exports = {
  submitReport,
  getReports,
  getDailyReports,
};
