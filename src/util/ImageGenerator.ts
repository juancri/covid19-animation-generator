
// Dependencies
import * as fs from 'fs';
import * as path from 'path';
import { DateTime } from 'luxon';
// @ts-ignore
import { SVG, registerWindow } from '@svgdotjs/svg.js';
// @ts-ignore
import * as window from 'svgdom';

// Local
import {CountryData, CountryConfiguration, DailyData} from './Types';

// Register window
registerWindow(window, window.document);

// Constants
const BASE_IMAGE = fs.readFileSync(path.join(__dirname, '../../resources/base.svg')).toString();
const CANVAS_SIZE = [1250, 1250];
const CIRCLE_SIZE = 15;
const COUNTRY_LABEL_FONT = {
	size: 30,
	family: 'DejaVu Sans Mono',
	anchor: 'end',
	fill: 'black'
};
const COUNTRY_LABEL_OFFSET = [20, 20];
const DATE_FONT = {
	size: 30,
	family: 'DejaVu Sans Mono',
	anchor: 'end',
	fill: 'black'
};
const DATE_POSITION = [1000, 100];
const LINE_STROKE = { width: 3, linecap: 'round' };
const BASE_X = 140;
const BASE_Y = 1110;
const SCALE_X = 200;
const SCALE_Y = 200;

export default class ImageGenerator
{
	// Fields

	private data: CountryData[];
	private configuration: CountryConfiguration[];


	// Constructor

	public constructor (countryData: CountryData[], countryConfiguration: CountryConfiguration[])
	{
		this.data = countryData;
		this.configuration = countryConfiguration;
	}


	// Public methods

	public async generateAll(outputDirectory: string) {
		const firstCountryData = this.data[0].data;
		const first = firstCountryData[0].date;
		const last = firstCountryData[firstCountryData.length - 1].date;

		for (let current = first; current <= last; current = current.plus({ days: 1 }))
			this.generateImage(outputDirectory, current);
	}


	// Private methods

	private generateImage(outputDirectory: string, date: DateTime)
	{
		// Init canvas
		const canvas = SVG(window.document.documentElement);
		// @ts-ignore
		canvas.size(...CANVAS_SIZE);

		// Load base image
		canvas.clear();
		canvas.svg(BASE_IMAGE);

		// Write date
		canvas
			// @ts-ignore
			.text(date.toISODate())
			.font(DATE_FONT)
			.move(...DATE_POSITION);

		// Draw each country
		for (const countryConf of this.configuration)
		{
			// Get from data
			const countryData = this.data.find(d => d.country === countryConf.name);
			if (!countryData)
				throw new Error(`Country not found: ${countryConf.name}`);

			// Filter data with date limit
			const filteredData = countryData.data
				.filter(d => d.cases && d.date <= date);
			if (filteredData.length < 9)
				continue;

			// Draw lines
			if (filteredData.length > 0)
			{
				for (let index = 1; index < filteredData.length; index++)
				{
					if (!filteredData[index].cases)
						continue;
					const point1 = this.getPointFromDailyData(filteredData, index - 1);
					const point2 = this.getPointFromDailyData(filteredData, index);

					// @ts-ignore
					canvas.line(point1.x, point1.y, point2.x, point2.y)
						.stroke({ color: countryConf.color, ...LINE_STROKE });
				}
			}

			// Draw circle
			const lastPoint = this.getPointFromDailyData(filteredData, filteredData.length - 1);
			// @ts-ignore
			canvas.circle(CIRCLE_SIZE)
				.fill(countryConf.color)
				.move(
					lastPoint.x - CIRCLE_SIZE / 2,
					lastPoint.y - CIRCLE_SIZE / 2);

			// Draw title
			canvas
				// @ts-ignore
				.text(countryConf.code)
				.font(COUNTRY_LABEL_FONT)
				.move(
					lastPoint.x + COUNTRY_LABEL_OFFSET[0],
					lastPoint.y + COUNTRY_LABEL_OFFSET[1]);
		}

		// Save image
		const outputPath = path.join(outputDirectory, `${date.toISODate()}.svg`);
		fs.mkdirSync(outputDirectory, { recursive: true });
		fs.writeFileSync(outputPath, canvas.svg());
	}

	private getPointFromDailyData(data: DailyData[], index: number)
	{
		const item = data[index];
		const base = data[index - 7];
		const diff = Math.max(0, item.cases - (base?.cases || 0));
		return {
			x: BASE_X + Math.max(0, Math.log10(item.cases) - 1) * SCALE_X,
			y: BASE_Y - (Math.max(0, Math.log10(diff) - 1) * SCALE_Y)
		};
	}
}
