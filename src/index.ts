export interface Env {}

import { Datum, MsmResponse, Setting, DisplayItem } from "./types";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

import ical from 'ical-generator';

export const parseMenuAndGenerateIcs = async (districtId: string, menuId: number) => {

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const today = dayjs();

    const url = `https://myschoolmenus.com/api/organizations/${districtId}/menus/${menuId}/year/${year}/month/${month}/date_overwrites`;
    try {

        const msmResponse: MsmResponse = (await (await fetch(url)).json()) as MsmResponse;

        const icalEvent = ical({
            ttl: 86400, // 1 day
            name: `Menu`,
            timezone: 'America/Los_Angeles'
        });

        let numEvents = 0;
        const eachDatum = (datum: Datum) => {
            const settings = JSON.parse(datum.setting);
            const dateStr = datum.day;
            if (dateStr && settings.current_display.length) {
                let meal = settings.current_display[0];
                if(meal.weight == 0){
                    meal = /breakfast/i.test(meal.item) ? 'Breakfast' : 'Lunch';
                }
                icalEvent.name(`${meal} Menu`);
                const hour = meal == 'Breakfast' ? 10 : 12;
                const start = dayjs(dateStr).hour(hour);
                if(today.isAfter(start, 'day')){
                    console.log({today, start});
                    return;
                }
                const end = start.minute(30);
                const summary = `${meal}: ` + settings.current_display.map((displayItem: DisplayItem) => {
                    return displayItem.weight == 1
                        ? displayItem.name :
                            displayItem.weight == 2
                                ?  ' / ' + displayItem.name : '';
                }).join('');

                icalEvent.createEvent({
                    start: start,
                    end: end,
                    summary
                });
                numEvents++;
            }
        };
        msmResponse.data.forEach(eachDatum);
        if(numEvents < 10){
            // fetch next month's and iterate over it
            const nextUrl = `https://myschoolmenus.com/api/organizations/${districtId}/menus/${menuId}/year/${year}/month/${month+1}/date_overwrites`;
                const msmResponse2: MsmResponse = (await (await fetch(nextUrl)).json()) as MsmResponse;
            msmResponse2.data.forEach(eachDatum);
        }

        return icalEvent.toString();
    } catch (error) {
        console.error(`Error fetching or parsing data: from ${url}: `, error);
        return "";
    }
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

        const url = new URL(request.url);
        const districtId = url.searchParams.get('districtId') || 136;
        const menu = url.searchParams.get('menu') || 75181;

        if (!districtId) {
            return new Response("Missing districtId parameter.", { status: 400 });
        }

        try {
            const icalData = await parseMenuAndGenerateIcs(districtId, menu);

            if (icalData.length === 0) {
                return new Response("No meals found for the specified date range.", { status: 404 });
            } else {
                return new Response(icalData, {
                    headers: {
                        'Content-Type': 'text/calendar; charset=utf-8',
                        'Content-Disposition': `attachment; filename=${districtId}-${menu}-menu.ics`,
                    },
                });
            }
        } catch (error) {
            console.error("Error generating ICS file:", error);
            return new Response("Error generating ICS data.", { status: 500 });
        }
    },
};
