
import * as path from 'path';
import * as fs from 'fs-extra';
// @ts-ignore
import { SVG, registerWindow } from '@svgdotjs/svg.js';
// @ts-ignore
import * as window from 'svgdom';
import { PlotArea, Point } from '@/util/Types';

// Register window
registerWindow(window, window.document);

export default class SvgWriter
{
	private background: string;
	private canvas: any;
	private frame: number;
	private outputDirectory: string;
	private size: number[];

	public constructor(outputDirectory: string, size: number[], background: string)
	{
		this.outputDirectory = outputDirectory;
		this.size = size;
		this.background = background;
		this.frame = 1;
		this.canvas = SVG(window.document.documentElement);
		this.canvas.size(...size);
		fs.mkdirSync(outputDirectory, { recursive: true });
		fs.emptyDirSync(outputDirectory);
	}

	public applyMask(group: any, area: PlotArea)
	{
		const width = area.right - area.left;
		const height = area.bottom - area.top;
		const rectangle = this.canvas
			.rect(width, height)
			.move(area.left, area.top)
			.fill('white');
		const mask = this.canvas.mask().add(rectangle);
		group.maskWith(mask);
	}

	public clean()
	{
		this.canvas.clear();
		this.canvas
			.rect(... this.size)
			.fill(this.background);
	}

	public createGroup()
	{
		return this.canvas.group();
	}

	public drawCircle(circleSize: number, color: string, position: number[], group: any = null)
	{
		const circle = this.canvas
			.circle(circleSize)
			.fill(color)
			.move(
				position[0] - circleSize / 2,
				position[1] - circleSize / 2);
		if (group)
			group.add(circle);
	}

	public drawLine(stroke: object, from: number[], to: number[], mask: any = null) {
		const coordinates = [...from, ...to];
		if (coordinates.some(c => c === -Infinity || c === +Infinity))
			return;
		const line = this.canvas
			.line(...coordinates)
			.stroke(stroke);
		if (mask)
			line.maskWith(mask);
	}

	public drawPolyline(points: Point[], stroke: object, group: any = null)
	{
		const polyline = points
			.map(point => `${point.x},${point.y}`)
			.join(' ');
		const element = this.canvas.polyline(polyline)
			.fill('none')
			.stroke(stroke);
		if (group)
			group.add(element);
	}

	public drawText(text: string, font: object, position: number[], group: any = null, rotate: number|null = null)
	{
		const element = this.canvas
			.text(text)
			.font(font)
			.move(...position);
		if (rotate)
			element.rotate(rotate);
		if (group)
			group.add(element);
	}

	public save()
	{
		const outputPath = path.join(this.outputDirectory, `${this.frame++}.svg`);
		fs.writeFileSync(outputPath, this.canvas.svg());
	}
}
