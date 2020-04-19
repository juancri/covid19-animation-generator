
import * as path from 'path';
import * as fs from 'fs-extra';
import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';
import { PlotArea, Point } from '@/util/Types';
import { runInThisContext } from 'vm';

export default class CanvasWriter
{
	private background: string;
	private canvas: Canvas;
	private ctx: CanvasRenderingContext2D;
	private frame: number;
	private outputDirectory: string;
	private size: number[];

	public constructor(outputDirectory: string, size: number[], background: string)
	{
		this.outputDirectory = outputDirectory;
		this.size = size;
		this.background = background;
		this.frame = 1;
		this.canvas = createCanvas(size[0], size[1]);
		this.ctx = this.canvas.getContext('2d');
		fs.mkdirSync(outputDirectory, { recursive: true });
		fs.emptyDirSync(outputDirectory);
	}

	public applyMask(group: any, area: PlotArea)
	{
		// TODO: Implement
	}

	public clean()
	{
		this.ctx.clearRect(0, 0, this.size[0], this.size[1]);
		this.ctx.fillStyle = this.background;
		this.ctx.fillRect(0, 0, this.size[0], this.size[1]);
	}

	public createGroup()
	{
		// TODO: Implement
	}

	public drawCircle(circleSize: number, color: string, center: number[], group: any = null)
	{
		this.ctx.beginPath();
		this.ctx.ellipse(100, 100, 50, 75, Math.PI / 4, 0, 2 * Math.PI);
		this.ctx.stroke();
	}

	public drawLine(stroke: object, from: number[], to: number[], mask: any = null) {
		// TODO: Implement
	}

	public drawPolyline(points: Point[], stroke: object, group: any = null)
	{
		// TODO: Implement
	}

	public drawText(text: string, font: object, position: number[], group: any = null)
	{
		// TODO: Implement
	}

	public drawBoxedText(box: number[], fontSize: number, text: string, rotate: number|null = null)
	{
		// TODO: Implement
	}

	public save()
	{
		// TODO: Implement
	}
}
