# COVID-19 Animation Generator

[![Node.js CI](https://github.com/juancri/covid19-animation-generator/workflows/Node.js%20CI/badge.svg)](https://github.com/juancri/covid19-animation-generator/actions)

Generates an animation based on COVID-19 daily data.

![Sample](sample.gif)

- Explanation: [minutephysics: How To Tell If We're Beating COVID-19](https://www.youtube.com/watch?v=54XLXg4fYsc)
- Data:
  - [Novel Coronavirus (COVID-19) Cases, provided by JHU CSSE](https://github.com/CSSEGISandData/COVID-19)
  - [Datos covid19 en Chile by Jorge Perez](https://github.com/jorgeperezrojas/covid19-data)

## About

- Created by [JC Olivares](https://twitter.com/juancriolivares).
- Animations posted on Instagram [@covid19statsvideos](https://instagram.com/covid19statsvideos) and Twitter [@covid19statsvid](https://twitter.com/covid19statsvid)

## Requirements

- Node 12.x
- Gulp: ```npm install -g gulp```

## Initialize

- Run: ```npm install```

## Build

- Clean: ```gulp clean```
- Build: ```gulp build```

## Running

```node dist/main```

The data is downloaded automatically

### Parameters

All parameters are optional.

- ```--help```: Displays a help message and exits.
- ```--source```: Sets the data source. Default: ```global```. Possible values:
  - ```global```: Compare countries (including Chile, US and others)
  - ```southamerica```: Compare main countries in South America
  - ```us```: Compare states (US)
  - ```washington```: Compare Washington State counties (US)
  - ```chile```: Compare regions (Chile)
  - ```chile-comunas```: Compare communes (Chile)
- ```--filter```: Filters the series configurations from the datasource using its code. Multiple codes can be included, separated by comma.
- ```--schema```: Sets the color schema. Default: ```dark```. Possible values:
  - ```dark```: Dark theme
- ```--days```: Number of days for which the animation will be generated. Default: 30. Use 0 to plot all days.
- ```--frames```: Number of frames per day. Default: 30.
- ```--extraFrames```: Number of extra frames for the last image. Default: 300.
- ```--horizontalAxisLabel```: Horizontal axis label. Default: "total confirmed cases (log)".
- ```--verticalAxisLabel```: Vertical axis label. Default: "new confirmed cases (log, last week)".
- ```--zoomEasing```: Easing function for the zoom effect. Default: ```easeInOutCubic```.
- ```--timebarEasing```: Easing function for the timebar. Default: ```linear```.
- ```--dateFormat```: Sets the date format based on the [Luxon tokens](https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens). Default: ```yyyy-MM-dd```.
- ```--drawMarkers```: Draws series markers over the scale. Disabled by default.
- ```--skipZoom```: Skips the zoom effect. Enabled by default.
- ```--hideWatermark```: Hides the watermark. Enabled by default.
- ```--seriesLineWidth```: Series line width. Default: ```3```.
- ```--horizontalMin```: Horizontal scale minimum. Default: dynamic.
- ```--horizontalMax```: Horizontal scale maximum. Default: dynamic.
- ```--verticalMin```: Vertical scale minimum. Default: dynamic.
- ```--verticalMax```: Vertical scale maximum. Default: dynamic.
- ```--scale```: Scale. Default: log.
- ```--scaleDateFormat```: Date format for the scale labels. Applies only for linear scale. Default: ```MM/dd```.
- ```--horizontalJump```: Distance between scale labels (horizontal axis).
- ```--verticalJump```: Distance between scale labels (vertical axis).

#### Examples

- ```node dist/main```
- ```node dist/main --source global```
- ```node dist/main --layout square```
- ```node dist/main --source us --layout vertical```
- ```node dist/main --source us --layout vertical --frames 20```

## Output

The generated images will be in the ```output``` directory

## Generate animation

You can generate an animation (60 fps). Requires ffmpeg. Run:

```
npm run video
```

The video will be here: ```output/animation.mp4```
