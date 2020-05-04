
## Architecture

	- animation.getFrames: () ->
		FrameFilterInfo { date, ratio: }
	- DataFrameFilter FrameFilterInfo -> PlotSeries[]
	- animation.getScale: (FrameFilterInfo, PlotSeries[]) -> Scale
	- ScaledPointGenator (PlotSeries[], Scale) -> PlotSeries[]
	- CanvasGenerator -> (PlotArea, PlotPoint) -> PlotPoint
		FrameInfo { date: DateTime, series: PlotSeries, scale: Scale }
