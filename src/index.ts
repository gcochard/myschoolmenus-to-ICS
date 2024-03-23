/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

import { Block, Datum, MealViewerResponse } from "./types";

import ical from 'ical-generator';

export const parseMenuAndGenerateIcs = async (schoolId: string, meal: 'Lunch' | 'Breakfast' = 'Lunch') => {

	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);

	const startDate = yesterday.toISOString().slice(0, 10);
	const endDate = new Date(yesterday).setDate(yesterday.getDate() + 30);
	const endDateString = new Date(endDate).toISOString().slice(0, 10);

	const url = `https://api.mealviewer.com/api/v4/school/${schoolId}/${startDate}/${endDateString}/0`;
	try {

		const mvResponse: MealViewerResponse = (await (await fetch(url)).json()) as MealViewerResponse;

		const icalEvent = ical({
			ttl: 604800, // 1 week
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
							let name = item.item_Name;
							if (item.item_Name_Line_2) {
								name += "\n" + item.item_Name_Line_2;
							}
							return name;
						}).join('\n');
						return line;
					}).join('\n\n');

					icalEvent.createEvent({
						start: new Date(dateStr),
						allDay: true,
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

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

		const url = new URL(request.url);
		const schoolId = url.searchParams.get('schoolId') || "EisenhowerElementaryMN";
		const meal = url.searchParams.get('meal') as 'Lunch' | 'Breakfast' || 'Lunch';

		if (!schoolId) {
			return new Response("Missing schoolId parameter.", { status: 400 });
		}
		if (!['Lunch', 'Breakfast'].includes(meal)) {
			return new Response("Invalid meal parameter. Must be 'Lunch' or 'Breakfast'.", { status: 400 });
		}

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
	},
};
