
// Dependencies
import * as path from 'path';
import * as fs from 'fs-extra';
import { DateTime } from 'luxon';
// @ts-ignore
import { SVG, registerWindow } from '@svgdotjs/svg.js';
// @ts-ignore
import * as window from 'svgdom';

// Local
import {SeriesData, SeriesConfiguration, DailyData, ColorSchema} from './Types';

// Register window
registerWindow(window, window.document);

// Local types
interface Point { x: number, y: number};

// Constants
const RESOURCES_DIRECTORY = path.join(__dirname, '../../resources');

export default class ImageGenerator
{
	// Fields

	private data: SeriesData[];
	private configuration: SeriesConfiguration[];
	private color: ColorSchema;


	// Constructor

	public constructor (
		seriesData: SeriesData[],
		seriesConfiguration: SeriesConfiguration[],
		colorSchema: ColorSchema)
	{
		this.data = seriesData;
		this.configuration = seriesConfiguration;
		this.color = colorSchema;
	}


	// Public methods

	public async generateAll(outputDirectory: string, days: number,
		framesPerDay: number, extraEndFrames: number)
	{
		if (framesPerDay < 1)
			throw new Error(`Invalid frames per day: ${framesPerDay}`);

		const firstSeriesData = this.data[0].data;
		const lastDate = firstSeriesData[firstSeriesData.length - 1].date;
		const firstDate = lastDate.plus({ days: (-1 * days) + 1 });

		let absoluteFrame = 0;
		fs.mkdirSync(outputDirectory, { recursive: true });
		fs.emptyDirSync(outputDirectory);

		for (let currentDate = firstDate; currentDate <= lastDate; currentDate = currentDate.plus({ days: 1 }))
			for (let frame = 1; frame <= framesPerDay; frame++)
				this.generateImage(
					this.generateOutputPath(outputDirectory, absoluteFrame++),
					currentDate,
					frame,
					framesPerDay);

		const lastOutputPath = this.generateOutputPath(outputDirectory, absoluteFrame - 1);
		for (let extraFrame = 1; extraFrame <= extraEndFrames; extraFrame++)
			fs.copyFileSync(
				lastOutputPath,
				this.generateOutputPath(outputDirectory, absoluteFrame++));
	}


	// Private methods

	private generateOutputPath(outputDirectory: string, frame: number)
	{
		const frameString = frame.toString().padStart(4, '0');
		const outputFile = `${frameString}.svg`;
		const outputPath = path.join(outputDirectory, outputFile);
		return outputPath;
	}

	private generateImage(outputPath: string, date: DateTime,
		frame: number, totalFrames: number)
	{
		// Init canvas
		const canvas = SVG(window.document.documentElement);
		// @ts-ignore
		canvas.size(...this.color.canvasSize);

		// Load base image
		canvas.clear();
		canvas.svg(fs.readFileSync(path.join(RESOURCES_DIRECTORY, this.color.file)).toString());

		// Write date
		canvas
			// @ts-ignore
			.text(date.toISODate())
			.font(this.color.date.font)
			.move(...this.color.date.position);

		// Draw each series
		const frameRatio = frame / totalFrames;
		for (const seriesConf of this.configuration)
		{
			// Get from data
			const seriesData = this.data.find(d => d.name === seriesConf.name);
			if (!seriesData)
				throw new Error(`Series not found: ${seriesConf.name}`);

			// Filter data with date limit
			const filteredData = seriesData.data
				.filter(d => d.cases && d.date <= date);

			// Draw lines
			if (filteredData.length < 2)
				continue;

			for (let index = 1; index < filteredData.length; index++)
			{
				if (!filteredData[index].cases)
					continue;
				const point1 = this.getPointFromDailyData(filteredData, index - 1);
				const point2 = this.getPointFromDailyData(filteredData, index);
				const isLastPoint = index === filteredData.length - 1;
				const correctedPoint2 = isLastPoint ?
					this.getCorrectedPoint(point1, point2, frameRatio) :
					point2;

				canvas
					// @ts-ignore
					.line(
						point1.x, point1.y,
						correctedPoint2.x, correctedPoint2.y)
					.stroke({ color: seriesConf.color, ...this.color.lineStroke });
			}

			// Draw circle
			const previousPoint = this.getPointFromDailyData(filteredData, filteredData.length - 2);
			const lastPoint = this.getPointFromDailyData(filteredData, filteredData.length - 1);
			const correctedLastPoint = this.getCorrectedPoint(
				previousPoint, lastPoint, frameRatio);

			// @ts-ignore
			canvas.circle(this.color.circleSize)
				.fill(seriesConf.color)
				.move(
					correctedLastPoint.x - this.color.circleSize / 2,
					correctedLastPoint.y - this.color.circleSize / 2);

			// Draw title
			canvas
				// @ts-ignore
				.text(seriesConf.code)
				.font(this.color.seriesLabel.font)
				.move(
					correctedLastPoint.x + this.color.seriesLabel.offset[0],
					correctedLastPoint.y + this.color.seriesLabel.offset[1]);
		}

		// Save image
		fs.writeFileSync(outputPath, canvas.svg());
	}

	private getPointFromDailyData(data: DailyData[], index: number)
	{
		const item = data[index];
		const base = data[index - 7];
		if (!item)
			throw new Error(`Point not found for index: ${index}`);
		const diff = Math.max(0, item.cases - (base?.cases || 0));
		return {
			x: this.color.base[0] + Math.max(0, Math.log10(item.cases) - 1) * this.color.scale[0],
			y: this.color.base[1] - (Math.max(0, Math.log10(diff) - 1) * this.color.scale[1])
		};
	}

	private getCorrectedPoint(point1: Point, point2: Point, ratio: number)
	{
		return {
			x: this.getCorrectedValue(point1.x, point2.x, ratio),
			y: this.getCorrectedValue(point1.y, point2.y, ratio)
		};
	}

	private getCorrectedValue(v1: number, v2: number, ratio: number)
	{
		return v1 + (v2 - v1) * ratio;
	}
}
