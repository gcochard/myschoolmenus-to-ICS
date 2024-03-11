const axios = require('axios');
const ical = require('ical-generator');

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1); // Set date to yesterday

const startDate = yesterday.toISOString().slice(0, 10); // YYYY-MM-DD format
const endDate = new Date(yesterday).setDate(yesterday.getDate() + 30); // 30 days from yesterday
const endDateString = new Date(endDate).toISOString().slice(0, 10);

async function parseMenuAndGenerateIcs(schoolId, baseUrl) {
    const url = `${baseUrl}/${schoolId}/${startDate}/${endDateString}/0`;
    try {
        const response = await axios.get(url);
        const jsonData = response.data.menuSchedules;

        console.log(JSON.stringify(response.data, null, 2))

        process.exit()

        // Rest of the function logic remains the same...
    } catch (error) {
        console.error("Error fetching or parsing data:", error);
        return "";
    }
}

module.exports = parseMenuAndGenerateIcs;