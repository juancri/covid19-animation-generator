
import * as path from 'path';
import * as fs from 'fs-extra';
// @ts-ignore
import { SVG, registerWindow } from '@svgdotjs/svg.js';
// @ts-ignore
import * as window from 'svgdom';

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

	public clean()
	{
		this.canvas.clear();
		this.canvas
			.rect(... this.size)
			.fill(this.background);
	}

	public drawCircle(circleSize: number, color: string, position: number[])
	{
		this.canvas
			.circle(circleSize)
			.fill(color)
			.move(
				position[0] - circleSize / 2,
				position[1] - circleSize / 2);
	}

	public drawLine(stroke: object, from: number[], to: number[]) {
		const coordinates = [...from, ...to];
		if (coordinates.some(c => c === -Infinity || c === +Infinity))
			return;
		this.canvas
			.line(...coordinates)
			.stroke(stroke);
	}

	public drawText(text: string, font: object, position: number[])
	{
		this.canvas
			.text(text)
			.font(font)
			.move(...position);
	}

	public save()
	{
		const outputPath = path.join(this.outputDirectory, `${this.frame++}.svg`);
		fs.writeFileSync(outputPath, this.canvas.svg());
	}
}
