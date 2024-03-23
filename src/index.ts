
/**
 * Generate iCal data based on MealViewer API response.
 * @param {Request} request The incoming request.
 */


import { parseMenuAndGenerateIcs } from './parse-menu';

export default {
    // async fetch(request: Request, env: any, ctx: any) {
    async fetch() {
        const schoolId = "EisenhowerElementaryMN";
        const meal = "Lunch";

        try {
            const icalData = await parseMenuAndGenerateIcs(schoolId, meal);

            if (icalData.length === 0) {
                return new Response("No meals found for the specified date range.", { status: 404 });
            } else {
                return new Response(icalData, {
                    headers: {
                        'Content-Type': 'text/calendar; charset=utf-8',
                        'Content-Disposition': `attachment; filename=${schoolId}-${meal}-menu.ics`,
                    },
                });
            }
        } catch (error) {
            console.error("Error generating ICS file:", error);
            return new Response("Error generating ICS data.", { status: 500 });
        }
    }
}