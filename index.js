const express = require('express');
const parseMenuAndGenerateIcs = require('./parse-menu');

const app = express();



app.get(['/:schoolId', '/'], async (req, res) => {
    try {
        const baseUrl = "https://api.mealviewer.com/api/v4/school";
        const schoolId = req.params.schoolId || "EisenhowerElementaryMN";
        const icsData = await parseMenuAndGenerateIcs(schoolId, baseUrl);

        if (icsData.length === 0) {
            res.status(404).send("No meals found for the specified date range.");
        } else {
            res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
            res.send(icsData);
        }
    } catch (error) {
        console.error("Error generating ICS file:", error);
        res.status(500).send("Error generating ICS data.");
    }
});

app.listen(3000, () => console.log('http://localhost:3000'));

parseMenuAndGenerateIcs("EisenhowerElementaryMN", "https://api.mealviewer.com/api/v4/school")