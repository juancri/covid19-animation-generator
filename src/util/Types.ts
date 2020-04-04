
import { DateTime } from 'luxon';

export interface DailyData {
	date: DateTime;
	cases: number;
}

export interface SeriesData {
	name: string;
	data: DailyData[];
}

export interface SeriesConfiguration {
	name: string;
	code: string;
	color: string;
}

export interface ColorSchema {
	seriesLabel: {
		font: object;
		offset: number[];
	},
	date: {
		font: object;
	},
	lineStroke: object;
}

export interface ColorSchemas {
	[key: string]: ColorSchema;
}

export interface Layout {
	canvasSize: number[];
	base: number[],
	scale: number[];
	circleSize: number;
	datePosition: number[];
	dateFont: object;
}

export interface Layouts {
	[key: string]: Layout;
}

export interface DataSource {
	url: string;
	nameColumn: string;
	series: SeriesConfiguration[];
}

export interface DataSources {
	[key: string]: DataSource;
}

export interface Configuration {
	dataSources: DataSources;
	days: number;
	framesPerDay: number;
	extraEndFrames: number;
	colorSchemas: ColorSchemas;
	layouts: Layouts;
	defaults: {
		schema: string;
		source: string;
		days: number,
		frames: number,
		extraFrames: number;
	}
}
