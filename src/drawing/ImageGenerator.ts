
// Dependencies
import * as path from 'path';
import * as fs from 'fs-extra';
import { DateTime } from 'luxon';
// @ts-ignore
import { SVG, registerWindow } from '@svgdotjs/svg.js';
// @ts-ignore
import * as window from 'svgdom';

// Local
import {TimeSeries, SeriesConfiguration, DataPoint, ColorSchema, Layout} from '../util/Types';

// Register window
registerWindow(window, window.document);

export default class ImageGenerator
{
	// Fields

	private series: TimeSeries[];
	private configuration: SeriesConfiguration[];
	private color: ColorSchema;
	private layout: Layout;


	// Constructor

	public constructor (series: TimeSeries[], configuration: SeriesConfiguration[],
		color: ColorSchema, layout: Layout)
	{
		this.series = series;
		this.configuration = configuration;
		this.color = color;
		this.layout = layout;
	}


	// Public methods

	public async generateAll(outputDirectory: string, days: number,
		frames: number, extraFrames: number)
	{
		if (frames < 1)
			throw new Error(`Invalid frames per day: ${frames}`);
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
		canvas.size(...this.layout.canvasSize);

		// Draw background
		canvas.clear();

		// Write date
		canvas
			// @ts-ignore
			.text(date.toISODate())
			.font({ ...this.color.date.font, ...this.layout.dateFont })
			.move(...this.layout.datePosition);

		// Draw each series
		const frameRatio = frame / totalFrames;
		for (const seriesConf of this.configuration)
		{
			// Get from data
			const seriesData = this.series.find(d => d.name === seriesConf.name);
			if (!seriesData)
				throw new Error(`Series not found: ${seriesConf.name}`);

			// Filter data with date limit
			const filteredData = seriesData.data
				.filter(d => d.value && d.date <= date);

			// Draw lines
			if (filteredData.length < 2)
				continue;

			for (let index = 1; index < filteredData.length; index++)
			{
				if (!filteredData[index].value)
					continue;
				// const point1 = this.getPointFromDailyData(filteredData, index - 1);
				// const point2 = this.getPointFromDailyData(filteredData, index);

				// canvas
				// 	// @ts-ignore
				// 	.line(
				// 		point1.x, point1.y,
				// 		correctedPoint2.x, correctedPoint2.y)
				// 	.stroke({ color: seriesConf.color, ...this.color.lineStroke });
			}

			// Draw circle
			// const previousPoint = this.getPointFromDailyData(filteredData, filteredData.length - 2);
			// const lastPoint = this.getPointFromDailyData(filteredData, filteredData.length - 1);
			// const correctedLastPoint = this.getCorrectedPoint(
			// 	previousPoint, lastPoint, frameRatio);

			// @ts-ignore
			// canvas.circle(this.layout.circleSize)
			// 	.fill(seriesConf.color)
			// 	.move(
			// 		correctedLastPoint.x - this.layout.circleSize / 2,
			// 		correctedLastPoint.y - this.layout.circleSize / 2);

			// Draw title
			// canvas
			// 	// @ts-ignore
			// 	.text(seriesConf.code)
			// 	.font(this.color.seriesLabel.font)
			// 	.move(
			// 		correctedLastPoint.x + this.color.seriesLabel.offset[0],
			// 		correctedLastPoint.y + this.color.seriesLabel.offset[1]);
		}

		// Save image
		// fs.writeFileSync(outputPath, canvas.svg());
	}
}
