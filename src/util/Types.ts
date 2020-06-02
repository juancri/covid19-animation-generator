
import { DateTime } from 'luxon';
import CanvasWriter from '../drawing/CanvasWriter';

// Data source

export interface DataPoint {
	date: DateTime;
	value: number;
}

export interface TimeSeries {
	name: string;
	data: DataPoint[];
	forceColor?: string;
	forceCode?: string;
}

export type PreProcessor = (series: TimeSeries[], params: any) => Promise<TimeSeries[]>;

// Config

export interface SeriesConfiguration {
	name: string;
	code: string;
	color: string;
}

export interface ColorSchema {
	background: string;
	scale: {
		color: string;
		font: string;
		offset: number;
	},
	axis: {
		color: string;
		font: string;
		offset: number;
	},
	series: {
		label: {
			font: string;
			color: string;
			offset: Point;
		},
		colors: string[];
	},
	date: {
		font: string;
		color: string;
	},
	watermark: {
		font: string;
		background: string;
		color: string;
	},
	timebar: {
		background: string;
		foreground: string;
	},
	coverOverlay: {
		font: string;
		background: string;
		color: string;
	}
}

export interface Box {
	left: number;
	right: number;
	top: number;
	bottom: number;
}

export interface Layout {
	canvasSize: number[];
	plotArea: Box;
	seriesLabelsArea: Box;
	circleSize: number;
	datePosition: Point;
	dateFont: object;
	watermark:
	{
		area: Box;
		icons: {
			[key: string]: Point
		},
		labels: {
			[key: string]: Point
		}
	},
	timebar: Box;
	coverOverlay: Box;
}

export interface PreProcessorConfig {
	name: string;
	parameters?: any;
}

export interface DataSource {
	url: string;
	nameColumn: string;
	title?: string;
	preProcessor?: PreProcessorConfig | string;
	preProcessors?: PreProcessorConfig[];
	series?: SeriesConfiguration[];
}

export interface Options
{
	schema: string;
	source: string;
	days: number,
	frames: number,
	extraFrames: number;
	dateFormat: string;
	horizontalAxisLabel: string;
	verticalAxisLabel: string;
	filter: string | null;
	zoomEasing: string;
	timebarEasing: string;
	title: string;
	drawMarkers: boolean;
	skipZoom: boolean;
	hideWatermark: boolean;
	seriesLineWidth: number;
	horizontalMin: number;
	horizontalMax: number;
	verticalMin: number;
	verticalMax: number;
}

export interface Configuration {
	dataSources: { [key: string]: DataSource };
	days: number;
	framesPerDay: number;
	extraEndFrames: number;
	colorSchemas: { [key: string]: ColorSchema };
	layouts: { [key: string]: Layout; };
	defaults: Options;
}

// Plot

export type EasingFunction = (p: number) => number;

export interface Scale {
	horizontal: {
		min: number;
		max: number;
	};
	vertical: {
		min: number;
		max: number;
	}
}

export interface FrameFilterInfo {
	date: DateTime;
	ratio: number;
	name?: string;
	drawCover?: boolean;
}

export interface FrameInfo {
	date: DateTime;
	series: PlotSeries[];
	scale: Scale;
	currentFrame: number;
	totalFrames: number;
	drawCover?: boolean;
	name?: string;
}

export interface Animation {
	countFrames: () => number;
	getFrames: () => Generator<FrameFilterInfo>;
	getScale?: (
		filteredSeries: PlotSeries[],
		frameFilterInfo: FrameFilterInfo,
		frameIndex: number,
		stepFrameIndex: number) => Scale | null;
}

export interface PlotSeries {
	code: string;
	color: string;
	points: PlotPoint[];
}

export interface Point {
	x: number;
	y: number;
}

export interface PlotPoint extends Point {
	date: DateTime;
	parent?: PlotPoint;
}

export interface AnimationContext {
	config: Configuration;
	options: Options;
	series: PlotSeries[];
	color: ColorSchema;
	layout: Layout;
	writer: CanvasWriter;
}

export interface Layer
{
	draw(frame: FrameInfo): Promise<void>;
}

