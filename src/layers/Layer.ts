import CanvasWriter from '../drawing/CanvasWriter';
import { FrameInfo } from '../util/Types';

export default interface Layer
{
	draw(frame: FrameInfo): Promise<void>;
}
