
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
	forceGaps?: SeriesGapConfiguration[];
}

export type PreProcessor = (series: TimeSeries[], params: any) => Promise<TimeSeries[]>;

// Config

export interface SeriesGapConfiguration {
	from: string;
	to: string;
}

export interface MilestoneConfiguration {
	date: string;
	color: string;
}

export interface SeriesConfiguration {
	name: string;
	code: string;
	color: string;
	gaps?: SeriesGapConfiguration[];
	milestones?: MilestoneConfiguration[];
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
	timebar: {
		background: string;
		foreground: string;
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
	timebar: Box;
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
	seriesLineWidth: number;
	horizontalMin: number;
	horizontalMax: number;
	verticalMin: number;
	verticalMax: number;
	scale: string;
	scaleDateFormat: string;
	scaleNumberFormat: string;
	horizontalJump: number;
	verticalJump: number;
	configOverride: string;
	postAnimationDirectory: string;
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

export interface ScaleBoundaries {
	horizontal: {
		min: number;
		max: number;
	};
	vertical: {
		min: number;
		max: number;
	}
}

export type AnimationStage =
	'pre' |
	'main' |
	'post' |
	'cover';

export interface FrameFilterInfo {
	date: DateTime;
	ratio: number;
	name?: string;
	stage?: AnimationStage;
}

export interface FrameInfo {
	date: DateTime;
	series: PlotSeries[];
	scaleBoundaries: ScaleBoundaries;
	currentFrame: number;
	totalFrames: number;
	stage: AnimationStage;
	name?: string;
}

export interface Animation {
	countFrames: () => number;
	getName: () => string;
	getFrames: () => Generator<FrameFilterInfo>;
	getScaleBoundaries?: (
		filteredSeries: PlotSeries[],
		frameFilterInfo: FrameFilterInfo,
		frameIndex: number,
		stepFrameIndex: number) => ScaleBoundaries | null;
}

export interface TimeGap {
	from: DateTime;
	to: DateTime;
}

export interface Milestone {
	date: DateTime;
	color: string;
}

export interface PlotSeries {
	code: string;
	color: string;
	points: PlotPoint[];
	gaps: TimeGap[];
	milestones: Milestone[];
}

export interface Point {
	x: number;
	y: number;
}

export interface PlotPoint extends Point {
	date: DateTime;
	parent?: PlotPoint;
}

export interface ScaleLabel
{
	position: number;
	text: string;
}

export interface ScaleLabelProvider
{
	getScaleLabels(frame: FrameInfo, horizontal: boolean): ScaleLabel[];
}

export interface AnimationContext {
	config: Configuration;
	options: Options;
	series: PlotSeries[];
	color: ColorSchema;
	layout: Layout;
	writer: CanvasWriter;
	scaleLabelProvider: ScaleLabelProvider;
	firstDate: DateTime;
	lastDate: DateTime;
}

export interface Layer
{
	draw(frame: FrameInfo): Promise<void>;
}
