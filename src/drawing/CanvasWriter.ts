
import * as path from 'path';
import * as fs from 'fs-extra';
import { loadImage, createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';
import { Point, Box, Layout, Rotation } from '../util/Types';
import PromisePipe from '../util/PromisePipe';

export default class CanvasWriter
{
	private layout: Layout;
	private outputPath: string;
	private canvas: Canvas;
	private ctx: CanvasRenderingContext2D;
	private frame: number;

	public constructor(layout: Layout, outputPath: string)
	{
		this.layout = layout;
		this.outputPath = outputPath;

		this.frame = 1;
		const [ width, height ] = this.layout.canvasSize;
		this.canvas = createCanvas(width, height);
		this.ctx = this.canvas.getContext('2d');
		fs.mkdirSync(this.outputPath, { recursive: true });
		fs.emptyDirSync(this.outputPath);
	}

	public clean(): void
	{
		const [ width, height ] = this.layout.canvasSize;
		this.ctx.clearRect(0, 0, width, height);
	}

	public drawCircle(radius: number, color: string, center: Point, box: Box | null = null): void
	{
		this.useMaskBox(box, () =>
		{
			this.ctx.beginPath();
			this.ctx.ellipse(center.x, center.y, radius, radius, 0, 0, 2 * Math.PI);
			this.ctx.fillStyle = color;
			this.ctx.fill();
		});
	}

	public drawLine(color: string, lineWidth: number, from: Point, to: Point, box: Box|null = null): void
	{
		this.drawPolyline(color, lineWidth, [from, to], box);
	}

	public drawLineAlpha(color: string, lineWidth: number, from: Point, to: Point, alpha: number, dashed = false): void
	{
		this.drawPolyline(color, lineWidth, [from, to], null, dashed, alpha);
	}

	public drawPolyline(color: string, lineWidth: number, points: Point[], box: Box|null = null,
		dashed = false, alpha: number | null = null): void
	{
		if (points.length < 2)
			return;

		this.useAlpha(alpha, () =>
		{
			this.useDashedLine(dashed, () =>
			{
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
			});
		});
	}

	public drawPolygon(color: string, points: Point[], box: Box | null = null): void
	{
		if (points.length < 2)
			return;

		this.useMaskBox(box, () =>
		{
			const first = points[0];
			this.ctx.fillStyle = color;
			this.ctx.beginPath();
			this.ctx.moveTo(first.x, first.y);
			for (const point of points.slice(1))
				this.ctx.lineTo(point.x, point.y);
			this.ctx.closePath();
			this.ctx.fill();
		});
	}

	public drawText(text: string, font: string, color: string,
		position: Point, box: Box | null = null, textAlign: CanvasTextAlign = 'left'): void
	{
		this.useMaskBox(box, () =>
		{
			this.ctx.font = font;
			this.ctx.fillStyle = color;
			this.ctx.textAlign = textAlign;
			this.ctx.fillText(text, position.x, position.y);
		});
	}

	public drawBoxedText(text: string, font: string, color: string,
		box: Box, rotation: Rotation | null = null, align: CanvasTextAlign = 'center'): void
	{
		const centerX = rotation ?
			CanvasWriter.getRotationX(box, rotation) :
			(box.left + box.right) / 2;
		const centerY = rotation ?
			CanvasWriter.getRotationY(box, rotation) :
			(box.bottom + box.top) / 2;
		this.useMaskBox(box, () =>
		{
			if (rotation)
			{
				this.ctx.translate(centerX, centerY);
				this.ctx.rotate(rotation.angle * Math.PI / 180);
				this.ctx.translate(-centerX, -centerY);
			}
			this.ctx.font = font;
			this.ctx.fillStyle = color;
			this.ctx.textAlign = align;
			this.ctx.textBaseline = 'middle';
			this.ctx.fillText(text, centerX, centerY);
		});
	}

	public drawRectangle(box: Box, color: string): void
	{
		const width = box.right - box.left;
		const height = box.bottom - box.top;
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = 5; // FIXME: config?
		this.ctx.strokeRect(box.left, box.top, width, height);
	}

	public drawFilledRectangle(box: Box, color: string): void
	{
		const width = box.right - box.left;
		const height = box.bottom - box.top;
		this.ctx.fillStyle = color;
		this.ctx.fillRect(box.left, box.top, width, height);
	}

	public async drawImage(imagePath: string, point: Point): Promise<void>
	{
		const image = await loadImage(imagePath);
		this.ctx.drawImage(image, point.x, point.y);
	}

	public async drawScaledImage(imagePath: string): Promise<void>
	{
		const image = await loadImage(imagePath);
		this.ctx.drawImage(image, 0, 0, ...this.layout.canvasSize);
	}

	public async save(forcedName: string|null = null): Promise<void>
	{
		const input = this.canvas.createJPEGStream();
		const name = forcedName || this.frame.toString();
		const fileName = `${name}.jpg`;
		const filePath = path.join(this.outputPath, fileName);
		const output = fs.createWriteStream(filePath);
		await PromisePipe.pipe(input, output);
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

	private useDashedLine(dashed: boolean, f: () => void)
	{
		try {
			if (dashed)
				this.ctx.setLineDash([5, 5]);
			f();
		}
		finally {
			this.ctx.setLineDash([]);
		}
	}

	private useAlpha(alpha: number | null, f: () => void)
	{
		try
		{
			if (alpha !== null)
				this.ctx.globalAlpha = alpha;
			f();
		}
		finally
		{
			this.ctx.globalAlpha = 1;
		}
	}

	private static getRotationX(box: Box, rotation: Rotation) {
		const horizontalRotation = rotation.point.horizontal;
		if (horizontalRotation === 'center')
			return (box.left + box.right) / 2;
		if (horizontalRotation === 'left')
			return box.left;
		if (horizontalRotation === 'right')
			return box.right;
		throw new Error(`Invalid value for horizontal rotation: ${horizontalRotation}`);
	}

	private static getRotationY(box: Box, rotation: Rotation) {
		const verticalRotation = rotation.point.vertical;
		if (verticalRotation === 'center')
			return (box.top + box.bottom) / 2;
		if (verticalRotation === 'top')
			return box.top;
		if (verticalRotation === 'bottom')
			return box.bottom;
		throw new Error(`Invalid value for vertical rotation: ${verticalRotation}`);
	}
}
