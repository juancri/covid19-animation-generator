
import { DateTime } from 'luxon';

export interface DailyData {
	date: DateTime;
	cases: number;
}

export interface CountryData {
	country: string;
	data: DailyData[];
}

export interface CountryConfiguration {
	name: string;
	code: string;
	color: string;
}

export interface ColorSchema {
	file: string;
	canvasSize: number[],
	base: number[],
	scale: number[],
	circleSize: number,
	countryLabel: {
		font: object;
		offset: number[];
	},
	date: {
		font: object;
		position: number[];
	},
	lineStroke: object;
}

export interface ColorSchemas {
	[key: string]: ColorSchema;
}

export interface Configuration {
	countries: CountryConfiguration[];
	startDate: string;
	framesPerDay: number;
	extraEndFrames: number;
	colorSchemas: ColorSchemas;
	defaultColorSchema: string;
}
