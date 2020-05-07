
import * as path from 'path';
import * as fs from 'fs-extra';
import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';
import { Point, Box } from '../util/Types';
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

	public clean()
	{
		this.ctx.clearRect(0, 0, this.size[0], this.size[1]);
		this.ctx.fillStyle = this.background;
		this.ctx.fillRect(0, 0, this.size[0], this.size[1]);
	}

	public drawCircle(radius: number, color: string, center: Point, box: Box | null = null)
	{
		this.useMaskBox(box, () =>
		{
			this.ctx.beginPath();
			this.ctx.ellipse(center.x, center.y, radius, radius, 0, 0, 2 * Math.PI);
			this.ctx.fillStyle = color;
			this.ctx.fill();
		});
	}

	public drawLine(color: string, lineWidth: number, from: Point, to: Point, box: Box|null = null) {
		this.drawPolyline(color, lineWidth, [from, to], box);
	}

	public drawPolyline(color: string, lineWidth: number, points: Point[], box: Box|null = null)
	{
		if (points.length < 2)
			return;

		this.useMaskBox(box, () =>
		{
			this.ctx.strokeStyle = color;
			this.ctx.lineWidth = lineWidth;
			this.ctx.beginPath();
			const first = points[0];
			this.ctx.moveTo(first.x, first.y);
			for (let index = 1; index < points.length; index++)
				this.ctx.lineTo(points[index].x, points[index].y);
			this.ctx.stroke();
		});
	}

	public drawText(text: string, font: string, color: string, position: Point, box: Box | null = null)
	{
		this.useMaskBox(box, () =>
		{
			this.ctx.font = font;
			this.ctx.fillStyle = color;
			this.ctx.fillText(text, position.x, position.y);
		});
	}

	public drawBoxedText(text: string, font: string, color: string, box: Box, rotate: number|null = null)
	{
		const centerX = (box.left + box.right) / 2;
		const centerY = (box.bottom + box.top) / 2;
		this.useMaskBox(box, () =>
		{
			if (rotate)
			{
				this.ctx.translate(centerX, centerY);
				this.ctx.rotate(rotate * Math.PI / 180);
				this.ctx.translate(-centerX, -centerY);
			}
			this.ctx.font = font;
			this.ctx.fillStyle = color;
			this.ctx.textAlign = 'center';
			this.ctx.textBaseline = 'middle';
			this.ctx.fillText(text, centerX, centerY);
		});
	}

	public drawFilledRectangle(box: Box, color: string)
	{
		const width = box.right - box.left;
		const height = box.bottom - box.top;
		this.ctx.fillStyle = color;
		this.ctx.fillRect(box.left, box.top, width, height);
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

	private useMaskBox(box: Box | null, f: () => void) {
		try {
			if (box) {
				this.ctx.save();
				const boxWidth = box.right - box.left;
				const boxHeight = box.bottom - box.top;
				this.ctx.beginPath();
				this.ctx.rect(box.left, box.top, boxWidth, boxHeight);
				this.ctx.clip();
			}

			f();
		}
		finally {
			if (box)
				this.ctx.restore();
		}
	}
}
