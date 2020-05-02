
import * as path from 'path';
import * as fs from 'fs-extra';
import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';
import { PlotArea, Point } from '@/util/Types';
// @ts-ignore
import * as promisePipe from 'promisepipe';

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

	public drawCircle(radius: number, color: string, center: number[], group: any = null)
	{
		this.ctx.beginPath();
		this.ctx.ellipse(center[0], center[1], radius, radius, 0, 0, 0);
		this.ctx.fillStyle = color;
		this.ctx.fill();
		// TODO: Group
	}

	public drawLine(color: string, lineWidth: number, from: Point, to: Point, mask: any = null) {
		// FIXME: Remove this method?
		this.drawPolyline(color, lineWidth, [from, to]);
	}

	public drawPolyline(color: string, lineWidth: number, points: Point[])
	{
		if (points.length < 2)
			return;

		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = lineWidth;
		this.ctx.beginPath();
		const first = points[0];
		this.ctx.moveTo(first.x, first.y);
		for (let index = 1; index < points.length; index++)
			this.ctx.lineTo(points[index].x, points[index].y);
		this.ctx.stroke();
	}

	public drawText(text: string, font: object, position: number[], group: any = null)
	{
		// TODO: Implement
	}

	public drawBoxedText(box: number[], fontSize: number, text: string, rotate: number|null = null)
	{
		// TODO: Implement
	}

	public async save()
	{
		const input = this.canvas.createJPEGStream();
		const fileName = `${this.frame}.jpg`;
		const filePath = path.join(this.outputDirectory, fileName);
		const output = fs.createWriteStream(filePath);
		await promisePipe(input, output);
		this.frame++;
	}
}
