import { Request, Response } from "express";
import { parseMenuAndGenerateIcs } from "./parse-menu";
import express from 'express';

const app = express();

app.get(['/:schoolId', '/:schoolId/:meal', '/'], async (req: Request, res: Response) => {
    try {
        const schoolId = req.params.schoolId || "EisenhowerElementaryMN";
        const meal = (req.params.meal || "Lunch") as 'Lunch' | 'Breakfast';
        const icsData = await parseMenuAndGenerateIcs(schoolId, meal);

        if (icsData.length === 0) {
            res.status(404).send("No meals found for the specified date range.");
        } else {
            res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename=${schoolId}-${meal}-menu.ics`);
            res.send(icsData);
        }
    } catch (error) {
        console.error("Error generating ICS file:", error);
        res.status(500).send("Error generating ICS data.");
    }
});

const {PORT} = process.env || 3000;

// app.listen(PORT, () => console.log(`http://localhost:${PORT}`));

parseMenuAndGenerateIcs('EisenhowerElementaryMN', 'Lunch')