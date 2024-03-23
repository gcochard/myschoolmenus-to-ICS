import {Block, Datum, MealViewerResponse} from "./types";

import ical from 'ical-generator';

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const startDate = yesterday.toISOString().slice(0, 10);
const endDate = new Date(yesterday).setDate(yesterday.getDate() + 30);
const endDateString = new Date(endDate).toISOString().slice(0, 10);

export const parseMenuAndGenerateIcs = async (schoolId: string, meal: 'Lunch' | 'Breakfast' = 'Lunch') => {
    const url = `https://api.mealviewer.com/api/v4/school/${schoolId}/${startDate}/${endDateString}/0`;
    try {

        // Fetch with fetch.
        const mvResponse: MealViewerResponse = (await (await fetch(url)).json())

        const icalEvent = ical({
            name: `${mvResponse.physicalLocation.name} ${meal} Menu`,
            timezone: 'America/Chicago'
        });

        mvResponse.menuSchedules
            .filter(day => day.menuBlocks.length > 0)
            .filter(day => new Date(day.dateInformation.dateFull) >= yesterday)
            .map(day => day.menuBlocks.filter((block: Block) => block.blockName === meal))
            .map((blocks: Block[]) => blocks.map(block => block.cafeteriaLineList)[0]?.data)
            .forEach((datum: (Datum[] | undefined)) => {
                // Pull the date from inside the first item.
                const dateStr = datum?.[0]?.foodItemList.data[0]?.menu_Block_Date || "";
                if (dateStr) {
                    const description = datum?.map((datum: Datum) => {
                        let line = datum.name + "\n";
                        line += datum.foodItemList.data.map(item => {
                            // console.log(item)
                            // process.exit()
                            let name = item.item_Name;
                            if (item.item_Name_Line_2) {
                                name += "\n" + item.item_Name_Line_2;
                            }
                            return name;
                        }).join('\n');
                        return line;
                    }).join('\n\n');

                    console.log(description)

                    icalEvent.createEvent({
                        start: new Date(dateStr),
                        end: new Date(dateStr),
                        summary: `${meal} Menu`,
                        description,
                        location: 'Cafeteria'
                    });

                    return icalEvent;
                }
            })

        return icalEvent.toString();
    } catch (error) {
        console.error("Error fetching or parsing data:", error);
        return "";
    }
}